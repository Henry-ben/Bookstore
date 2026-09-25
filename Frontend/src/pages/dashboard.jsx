import { useEffect, useState } from "react";
import axios from "axios";
import"../css/dashboard.css"

export default function Dashboard(){
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All")
    const mostOrdered = {};

    const apiUrl= import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    for (const order of orders){
        for(const book of order.books){

            if(!mostOrdered[book.title]){
                mostOrdered[book.title] = 0;
            }
            mostOrdered[book.title] += book.quantity;
        }
    }

    const revenue = orders.reduce(
        (total, order) => total + Number(order.totalPrice), 0
    );

    const booksSold = orders.reduce(
        (total, order) => total + order.books.reduce(
            (sum,book) => sum + book.quantity, 0
        ),
        0
    );

    async function updateStatus(id,status){
        try{
            await axios.put(
                `${apiUrl}/api/orders/${id}/status`,
                {},
                { 
                    headers: { Authorization: `Bearer ${localStorage.getItem("currentToken")}` }, params: { status } 
                }
            );
            fetchOrders();
        }catch(error){
            console.error(error);
        }
    }

    async function fetchOrders() {
        try{
                const response = await axios.get(
                    `${apiUrl}/api/orders/admin-orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                        }
                    }
                );

                setOrders(response.data);
            }catch(error){
                console.error("Error fetching orders:", error);
            }
    }

    const filteredOrders = orders.filter((order) => {
        const value = search.toLowerCase();

        const matchesSearch =
            order.customerName.toLowerCase().includes(value) ||
            order.customerPhone.includes(value) ||
            order.reference.toLowerCase().includes(value)
        
        const matchesStatus =
         statusFilter === "All" || order.status === statusFilter


         return matchesSearch && matchesStatus;
    });
    const pendingOrders = orders.filter(
        order => order.status === "Paid"
    ).length;

    const recentOrders = [...filteredOrders]
    .sort( (a,b) => b.id - a.id);

    const processingOrders = orders.filter(
        order => order.status === "Processing"
    ).length;

    const readyOrders = orders.filter(
        order => order.status === "Ready"
    ).length;

    const deliverdOrders = orders.filter(
        order => order.status === "Delivered"
    ).length;


    useEffect(() => {
        fetchOrders();
    }, []);
    return(
        <div className="dash">
            <div className="dash-head">
              <h2>Dashboard</h2>
              <p>Overview of the store</p>
            </div>
            <div className="stats">
                <section className="stat">
                    <p>BOOKS SOLD:</p>
                    <h3>{booksSold}</h3>
                </section>
                <section className="stat">
                    <p>Revenue:</p> 
                    <h3>₦{revenue.toLocaleString()}</h3>
                </section>
                <section className="stat">
                    <p>Total Orders: </p>
                    <h3>{orders.length}</h3>
                </section>
                <section className="stat">
                    <p>Pending Orders:</p>
                    <h3>{pendingOrders}</h3>
                </section>        
            </div>

            <div className="tools">
                <input 
                    type="text"  
                    placeholder="Search by customer, phonenumber or reference"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All ({pendingOrders})</option>
                    <option value="Processing">Processing ({processingOrders})</option>
                    <option value="Ready">Ready ({readyOrders})</option>
                    <option value="Delivered">Delivered ({deliverdOrders})</option>
                </select>
            </div>

            <div className="dash-grid">
                <section className="card">
                    <h2>Most books sold</h2>
                    <div className="best">
                        <ul>
                            {Object.entries(mostOrdered).map(([title, quantity]) => (
                                <li key={title}>
                                    <p><strong>{title}</strong>: {quantity} Sold</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                <section className="card">
                    <h2>Recent Orders</h2>
                    <div className="orders">
                        {recentOrders.map((order) =>(
                            <div className="order" key={order.id}>
                                <div className="order-head">
                                    <div>
                                        <h4>Customer: {order.customerName}</h4>
                                        <p>Reference: {order.reference}</p>
                                    </div>
                                    <span className="status">Status: {order.status}</span>
                                </div>
                                <p>Phone: {order.customerPhone}</p>
                                <p className="total">Total: ₦{order.totalPrice}</p>
                                <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Delivered">Delivered</option>
                                
                                </select>
                                
                                <h5>Books:</h5>
                                <ul className="order-books">
                                    {order.books.map((book) => (
                                        <li key={book.title}>
                                            {book.title} x {book.quantity} 
                                        </li>
                                    ))}
                                </ul>

                                <hr/>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
