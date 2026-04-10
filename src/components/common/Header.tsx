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
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--cyan)" }}>hexagon</span>
                ON-CHAIN TRACKER
            </div>

            <nav className="app-header-nav">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/tasks"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Tasks
                </NavLink>

                <NavLink
                    to="/marketplace"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Marketplace
                </NavLink>

                {isAuthenticated && (
                    <NavLink
                        to="/logs"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    >
                        History
                    </NavLink>
                )}
            </nav>

            <WalletConnectPanel />
        </header>
    );
};

export default Header;
