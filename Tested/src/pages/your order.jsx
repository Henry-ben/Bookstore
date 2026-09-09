import PaystackPop from "@paystack/inline-js";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { useState, useEffect } from "react";
import { getCart, removeFromCart, clearCart } from "../Api/cart.js";
import "../css/yourorder.css"

export default function Yourorder(){
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [display, setDisplay] = useState("Cart");
    const [cartBooks, setCartBooks] = useState([]);
    const [orders, setOrders] = useState([]);

    if(!currentUser){
        return<p>Please login</p>
    }


    async function download(order) {
    try {
        const response = await axios.get(
            "http://localhost:5000/api/settings"
        );

        const settings = response.data;

        const doci = new jsPDF();


        doci.setFontSize(20);
        doci.setFont("helvetica", "bold");
        doci.text(settings.businessName, 105, 20, {
            align: "center"
        });

        doci.setFontSize(10);
        doci.setFont("helvetica", "normal");

        doci.text(settings.businessAddress, 105, 28, {
            align: "center"
        });

        doci.text(
            `${settings.businessPhone} | ${settings.businessEmail}`,
            105,
            34,
            { align: "center" }
        );


    

        doci.setFontSize(16);
        doci.setFont("helvetica", "bold");

        doci.text("RECEIPT", 105, 48, {
            align: "center"
        });


        doci.setFontSize(10);
        doci.setFont("helvetica", "normal");

        doci.text(
            `Reference: ${order.reference}`,
            20,
            60
        );

        doci.text(
            `Date: ${order.date}`,
            20,
            67
        );

        doci.text(
            `Status: ${order.status}`,
            20,
            74
        );


        

        doci.setFont("helvetica", "bold");

        doci.text("CUSTOMER", 130, 60);

        doci.setFont("helvetica", "normal");

        doci.text(
            order.customerName,
            130,
            67
        );

        doci.text(
            order.customerPhone,
            130,
            74
        );


        

        autoTable(doci, {
            startY: 85,

            head: [
                ["Book", "Qty", "Unit Price", "Total"]
            ],

            body: order.books.map(book => [
                book.title,
                book.quantity,
                `₦${Number(book.price).toFixed(2)}`,
                `₦${(
                    Number(book.price) *
                    Number(book.quantity)
                ).toFixed(2)}`
            ]),

            theme: "grid",

            styles: {
                fontSize: 10,
                cellPadding: 4
            },

            headStyles: {
                fontStyle: "bold",
                halign: "center"
            },

            columnStyles: {
                0: {
                    cellWidth: 75
                },

                1: {
                    cellWidth: 20,
                    halign: "center"
                },

                2: {
                    cellWidth: 35,
                    halign: "right"
                },

                3: {
                    cellWidth: 35,
                    halign: "right"
                }
            }
        });




        const finalY = doci.lastAutoTable.finalY;

        doci.setFontSize(13);
        doci.setFont("helvetica", "bold");

        doci.text(
            `Grand Total: ₦${Number(order.totalPrice).toFixed(2)}`,
            190,
            finalY + 15,
            {
                align: "right"
            }
        );


        

        doci.setFontSize(10);
        doci.setFont("helvetica", "normal");

        doci.text(
            settings.receiptFooter,
            105,
            finalY + 30,
            {
                align: "center"
            }
        );

        doci.save(
            `Receipt-${order.reference}.pdf`
        );

    } catch (error) {
        console.error(
            "Error Creating pdf:",
            error
        );
    }
}


    async function fetchOrders() {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders?userId=${currentUser.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }
    async function remove( bookId) {
            try {
            const updatedCart = await removeFromCart(
                currentUser.id,
                bookId
            );

            setCartBooks(updatedCart);
        } catch (error) {
            console.error("Error removing book:", error);
        }
    
    }
    function addUpPrice(){
        if(cartBooks.length === 0){
            return 0;
        }
        let totalPrice = 0;
         for(const book of cartBooks){
            totalPrice += Number(book.price) * Number(book.quantity);
         }
         return totalPrice;
    }

    async function placed(){
         try {
        const user = JSON.parse(localStorage.getItem("currentUser"));

        const response = await axios.post(
            "http://localhost:5000/api/paystack/initiate",
            {
                email: user.email,
                amount: addUpPrice()
            }
        );

        window.location.href =
            response.data.data.authorization_url;

    } catch (error) {
        console.log(error);
        alert("Unable to initialize payment.");
    }
    }

    useEffect(() => {
        async function fetchCartBooks() {
            try {
                const response = await getCart(currentUser.id);
                setCartBooks(Array.isArray(response) ? response : []);
            }catch (error) {
                console.error("Error fetching cart books:", error);
            }
        }

        fetchCartBooks();
    }, [currentUser.id]);

    useEffect(() => {
        const verify = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const reference = urlParams.get("reference");

            if (!reference) return;

            const paid = localStorage.getItem(reference);

            if (paid) return;
            
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/paystack/verify/${reference}`
                );

                if (response.data.data.status === "success") {
                    const cartBooks = await getCart(currentUser.id);
                    const user = JSON.parse(localStorage.getItem("currentUser"));
                    if (cartBooks.length > 0) {
                        await axios.post(
                            "http://localhost:5000/api/orders/add",
                            {
                                userId: user.id,
                                customerName: user.name,
                                customerEmail: user.email,
                                customerPhone: user.phoneNumber,
                                reference,
                                books: cartBooks,
                                totalPrice: cartBooks.reduce((total, book) => total + Number(book.price) * Number(book.quantity), 0),
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("currentToken")}`
                                }
                            }
                        );

                        await clearCart(currentUser.id);
                        setCartBooks([]);
                        fetchOrders();
                    }
                } 
            } catch (error) {
                console.error('Error verifying payment:', error);
            }
        }
        verify();
        fetchOrders();
    }, []);

    return(
        <div className="cart-page">
            
            <div className="cart-tabs">
                <ul>
                    <li>
                        <button type="button"
                         className={display ==="Cart"?"active":""} onClick={() => setDisplay("Cart")}>
                            Cart
                        </button>
                    </li>
                    <li>
                        <button type="button" 
                         className={display ==="Order"?"active":""}
                         onClick={() => setDisplay("Order")}>
                            Order
                        </button></li>
                </ul>
            </div>
            
                {display === "Cart" && (
                   <section className="cart-section">
                        <div className="cart-heading">
                            <h2> Your Cart </h2>
                            <p>{cartBooks.length} books in cart</p>
                        </div>
                        
                        {cartBooks.length === 0 ?
                        (<p className="empty-message">No book added to cart</p>):
                        (<>
                        <ul className="cart-list">
                            {cartBooks.map((books) => (
                                    <li className="cart-item" key={books.id}>
                                        
                                        <button type="button" 
                                          className="cart-remove"
                                          onClick={() => remove(books.id)}>
                                            Clear
                                        </button>
                                        <div className="cart-info">
                                            <h3>{books.title}</h3>
                                            <p>Quantity: {books.quantity}</p>
                                            <p className="cart-price">Price: {"\u20A6"}{Number(books.price) * books.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                        </>
                        )
                        }
                        <div>
                        <p>Total Price </p> 
                        <strong className="cart-total">
                            {"\u20A6"} {addUpPrice().toFixed(2)}
                        </strong>
                        <button type="button"
                          className="place-order" 
                          onClick={placed}>
                            Place Order
                        </button>
                        </div>
                        
                    </section>
                )}
            
                {display === "Order" && (
                   <section className="order-section">
                        <div className="order-heading">
                            <h2>Your order is here</h2>
                        </div>
                        {orders.length === 0 ?
                        (<p className="empty-message">No order placed yet</p>):
                        (<>
                            <ul className="order-list"> 
                                {orders.map((order) => (
                                    <li className="order-card" key={order.id}>
                                        <div className="order-head">
                                          <div>
                                            <h3>Order Reference: {order.reference}</h3>
                                            <p>Date: {order.date}</p>
                                          </div>
                                          <span>Status: {order.status}</span>
                                        </div>
                                        
                                        <details className="order-books"> 
                                        <summary>Books:</summary>
                                        <ul className="order-book-list">
                                            {order.books.map((book,index) => (
                                                <li key = {book.id ?? index} className="order-book-item">
                                                    <h4>{book.title}</h4>
                                                    <div>
                                                        <p>
                                                            <strong>Quantity: </strong>{book.quantity}
                                                        </p>

                                                        <p>
                                                            <strong>Unit Price: </strong>{"\u20A6"} {Number(book.price).toFixed(2)}
                                                        </p>

                                                        <p>
                                                            <strong>BookTotal: </strong>{"\u20A6"} {Number(book.price) * Number(book.quantity)}

                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                    <div className="order-footer">
                                        <strong className="order-total">
                                            Total Price: {"\u20A6"} {Number(order.totalPrice).toFixed(2)}
                                        </strong>
                                        <button className ="receipt-btn" onClick={() => download(order)}>Receipt</button>
                                    </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                        )
                        }
                        
                   </section>
                )}
           
        </div>
    );
}
