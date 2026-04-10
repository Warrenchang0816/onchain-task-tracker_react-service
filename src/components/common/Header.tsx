import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getAuthMe } from "../../api/authApi";
import WalletConnectPanel from "../wallet/WalletConnectPanel";

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        getAuthMe()
            .then((res) => setIsAuthenticated(res.authenticated))
            .catch(() => setIsAuthenticated(false));
    }, []);

    return (
        <header className="app-header">
            <div className="app-header-brand">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--cyan)" }}>hexagon</span>
                ON-CHAIN TRACKER
            </div>

            <nav className="app-header-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
                    Home
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => isActive ? "active" : ""}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>task_alt</span>
                    Tasks
                </NavLink>
{isAuthenticated && (
                    <NavLink to="/logs" className={({ isActive }) => isActive ? "active" : ""}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span>
                        History
                    </NavLink>
                )}
            </nav>

            <div className="app-header-actions">
                <WalletConnectPanel />
            </div>
        </header>
    );
};

export default Header;
