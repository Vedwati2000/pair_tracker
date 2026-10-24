import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark tracker-navbar">
            <div className="container">
                <NavLink className="navbar-brand fw-bold" to="/dashboard">
                    Pair Programming Tracker
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#trackerNavbar"
                    aria-controls="trackerNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="trackerNavbar">
                    <div className="navbar-nav ms-auto">
                        <NavLink
                            className="nav-link"
                            to="/dashboard"
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            className="nav-link"
                            to="/students"
                        >
                            Students
                        </NavLink>

                        <NavLink
                            className="nav-link"
                            to="/sessions"
                        >
                            Sessions
                        </NavLink>
                        <NavLink
                            className="nav-link"
                            to="/feedback"
                        >
                            AI Feedback
                        </NavLink>

                        <button
                            className="btn btn-light ms-lg-3 mt-2 mt-lg-0"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;