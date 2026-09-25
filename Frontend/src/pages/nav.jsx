import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/nav.css"


function Navbar({ role, setDisplay }) {
    const navigate = useNavigate();

    return (
        <nav>
            <ul className="nav-control">
                <li><button type="button" onClick={() => navigate("/home")}>Home</button></li>
                {role === "Admin" && (
                    <li><button type="button" onClick={() => navigate("/home/dashboard")}>Dashboard</button></li>
                )}
                {role === "Admin" && (
                    <li><button type="button" onClick={() => navigate("/home/inventory")}>Inventory</button></li>
                )}
                <li><button type="button" onClick={() => navigate("/home/books")}>Books</button></li>
                {role === "Guest" && (
                    <li><button type="button" onClick={() => navigate("/home/your-order")}>Your Orders</button></li>
                )}
                {role == "Staff" && (
                    <li><button type="button" onClick={() => navigate("/home/order")}>Orders</button></li>
                )}
                <li><button type="button" onClick={() => navigate("/home/profile")}>Profile</button></li>
                </ul>
            </nav>
    )
}

export default Navbar