import { NavLink } from "react-router-dom";

const Header = () => {
    return (
        <header>
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
                </nav>
            </div>
        </header>
    );
};

export default Header;
