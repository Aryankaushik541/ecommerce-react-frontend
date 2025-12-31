import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Icons
const ShoppingCartIcon = () => (
    <span role="img" aria-label="cart" style={{ fontSize: '1.2rem' }}>🛒</span>
);

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) =>
        location.pathname === path ||
        (path === '/products' && location.pathname.includes('/products'));

    return (
        <>
            <style>{`
                .royal-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1000;
                    padding: 1rem 0;
                    transition: background-color 0.3s ease, box-shadow 0.3s ease;
                    background-color: transparent;
                    color: #fff;
                    font-family: 'Cinzel', serif;
                    box-shadow: none;
                }
                .royal-navbar.scrolled {
                    background-color: rgba(10, 10, 10, 0.95);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                }
                .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    font-size: 1.8rem;
                    font-weight: bold;
                    letter-spacing: 3px;
                    color: #d4af37;
                    text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
                }
                .crown-symbol {
                    margin-right: 8px;
                    font-size: 1.5em;
                }

                .nav-menu {
                    list-style: none;
                    display: flex;
                    align-items: center;
                    margin: 0;
                    padding: 0;
                }
                .nav-menu li {
                    margin-left: 25px;
                }
                .nav-menu a, .user-greeting {
                    color: #e0e0e0;
                    text-decoration: none;
                    transition: color 0.2s ease;
                    text-transform: uppercase;
                    padding: 5px 0;
                    border-bottom: 2px solid transparent;
                }
                .nav-menu a:hover {
                    color: #fcf6ba;
                }
                .nav-menu .active {
                    color: #d4af37;
                    border-bottom: 2px solid #d4af37;
                }

                .user-greeting {
                    color: #d4af37;
                    font-weight: bold;
                    margin-right: 15px;
                    text-transform: capitalize;
                }
                .btn-nav-logout {
                    background: transparent;
                    color: #ccc;
                    border: 1px solid #ccc;
                    padding: 8px 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: uppercase;
                }
                .btn-nav-logout:hover {
                    color: #fff;
                    border-color: #d4af37;
                    background-color: rgba(212, 175, 55, 0.1);
                }

                /* Plain Join/Register link (no background) */
                .btn-nav-gold {
                    color: #e0e0e0;
                    text-decoration: none;
                    text-transform: uppercase;
                    padding: 5px 0;
                    border-bottom: 2px solid transparent;
                    transition: color 0.2s ease;
                }
                .btn-nav-gold:hover {
                    color: #fcf6ba;
                }

                .nav-menu .cart-icon a {
                    font-size: 1.2rem;
                    padding: 0;
                    border-bottom: none;
                }
                .nav-menu .cart-icon {
                    margin-left: 30px;
                }

                .admin-link {
                    color: #cc0000 !important;
                    border-bottom: 2px solid #cc0000 !important;
                }
            `}</style>

            <nav className={`royal-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-container">

                    <Link to="/" className="nav-logo">
                        <span className="crown-symbol">♔</span>
                        <span className="brand-name">IMPERIUM</span>
                    </Link>

                    <ul className="nav-menu">
                        <li>
                            <Link to="/" className={isActive('/') ? 'active' : ''}>
                                Home
                            </Link>
                        </li>

                        <li>
                            <Link to="/products" className={isActive('/products') ? 'active' : ''}>
                                Collection
                            </Link>
                        </li>

                        {user && (
                            <>
                                <li>
                                    <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
                                        Orders
                                    </Link>
                                </li>

                                {user.is_staff && (
                                    <li>
                                        <Link to="/admin" className="admin-link">
                                            Sovereign
                                        </Link>
                                    </li>
                                )}

                                <li>
                                    <span className="user-greeting">
                                        Welcome, {user.first_name || user.username}
                                    </span>
                                </li>

                                <li>
                                    <button onClick={logout} className="btn-nav-logout">
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}

                        {!user && (
                            <>
                                <li>
                                    <Link to="/login" className="nav-link-login">
                                        Access
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="btn-nav-gold">
                                        Join
                                    </Link>
                                </li>
                            </>
                        )}

                        <li className="cart-icon">
                            <Link to="/cart" className={isActive('/cart') ? 'active' : ''}>
                                <ShoppingCartIcon />
                            </Link>
                        </li>
                    </ul>

                </div>
            </nav>
        </>
    );
};

export default Navbar;
