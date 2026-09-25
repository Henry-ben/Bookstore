import { useState } from 'react'
import {Routes, Route} from "react-router-dom";
import './App.css'
import Logsign from "./pages/login"
import Home from "./pages/home"
import Dashboard from './pages/dashboard';
import Inventory from './pages/inventory';
import Homecontent from './pages/homecontent';
import Order from './pages/orders';
import Yourorder from './pages/your order';
import Profile from './pages/profile';
import Books from './pages/books';

function App() { 
    return (
        <Routes>
            <Route path="/" element={<Logsign/>} />
            <Route path="/home" element={<Home/>} >
                <Route index element={<Homecontent/>}/>
                <Route path='dashboard' element={<Dashboard/>}/>
                <Route path='inventory' element={<Inventory/>}/>
                <Route path='books' element={<Books/>}/>
                <Route path='order' element={<Order/>}/>
                <Route path='your-order' element={<Yourorder/>}/>
                <Route path='profile' element={<Profile/>}/>
            </Route>
        </Routes>
    )
      
}

export default App
