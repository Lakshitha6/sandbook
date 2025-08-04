import logoimage from '../images/navbar_logo.jpg';
import { Link } from "react-router-dom";
import './Navbar.css';
import React, { useState } from 'react';

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
        <div className="navbar">
            <div className="logo">
                <Link to="/home"><img src={logoimage} alt="logo-img" /></Link>
            </div>

            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <Link to="/friends" onClick={()=> setMenuOpen(false)}>Friends</Link>
				<Link to="/profile" onClick={()=> setMenuOpen(false)}>Profile</Link>
				<Link to="/about" onClick={()=> setMenuOpen(false)}>About Us</Link>
            </div>

            <div className="register">
                <Link to="/register">Sign Up</Link>
            </div>

            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </div>
        </div>
    </>
  )
}
