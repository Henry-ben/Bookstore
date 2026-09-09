import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import mobilelogo from "../assets/phone logo.png";
import desktoplogo from "../assets/big screen.png";
import tabletlogo from "../assets/tablet logo.png";
import Navbar from "./nav";
import"../css/head.css";


function Home() {
    
    const navigate = useNavigate(); 
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const role = user?.role

      


    return(
        <>
            <div className="head">
                <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={mobilelogo}
                    />
                    <source 
                      media="(max-width: 1199px)"
                      srcSet={tabletlogo}
                    />
                    <img
                       src={desktoplogo}
                       alt="EPP Bookstore Logo"
                       className="logo"
                    />
                </picture>
                <button className="head-logout" onClick={() => {
                    localStorage.removeItem("currentUser"); // Clear current user data from localStorage on logout
                    navigate("/"); // Navigate back to login page on logout
                }}>Logout</button>
            </div>

            <Navbar role={role}/>

            <section>
                <Outlet />
            </section>
        </>
    )
}


export default Home