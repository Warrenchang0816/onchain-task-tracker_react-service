import { NavLink } from "react-router-dom";
import WalletConnectPanel from "../wallet/WalletConnectPanel";

const Header = () => {
    return (
        <header>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2>On-chain Task Tracker</h2>

                    <nav>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/tasks"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Tasks
                        </NavLink>

                        <NavLink
                            to="/logs"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            History
                        </NavLink>
                    </nav>
                </div>

                <WalletConnectPanel />
            </div>
        </header>
    );
};

export default Header;