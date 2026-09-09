import { useState, useEffect } from "react";
import axios from "axios";
import "../css/order.css"



export default function Order(){

    const [orders, setOrders] = useState([]);

     async function fetchOrders() {
        try{
                const response = await axios.get(
                    "http://localhost:5000/api/orders/admin-orders",
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
    useEffect(() => {
        fetchOrders();
    }, []);
    return(
        <div className="orders-page">
            <div className="orders-header">
                <div>
                   <h2> Customers Orders</h2>
                   <p>Manage all customer orders in one place.</p>
               </div>
               <div className="orders-count">
                 {orders.length } Orders
               </div>
            </div>


            {orders.length === 0 ? (
                <div className="no-orders">
                   <h3>No Orders Found</h3>
                   <p>There are currently no orders.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div>
                                <h4>Order #{order.id}</h4>
                                <p>Customer: {order.customerName}</p>
                                </div>
                                <span className="order-status">{order.status}</span>
                            </div>
                            
                            <div className="order-date">
                                <span>Date</span>
                                <p>{order.date}</p>
                            </div>
                            <details className="order-books">

                                <summary>
                                    Books to Package ({order.books.length})
                                </summary>

                                <div className="books-list">

                                    {order.books.map((book) => (

                                        <div className="ordered-book" key={book.id}>

                                            <p className="book-name">
                                                {book.title}
                                            </p>

                                            <p className="book-quantity">
                                                Quantity: <strong>{book.quantity}</strong>
                                            </p>

                                        </div>

                                    ))}

                                </div>

                            </details>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
