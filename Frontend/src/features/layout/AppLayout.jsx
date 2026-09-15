import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/hooks/useAuth";
import ThemeToggle from "../theme/ThemeToggle";
import "./app-layout.scss";

const AppLayout = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await handleLogout();
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <Link to="/" className="brand">
                    MindVault
                </Link>
                <nav className="app-nav">
                    <NavLink to="/" end>Notes</NavLink>
                    <NavLink to="/chat">AI Chat</NavLink>
                    <NavLink to="/graph">Graph</NavLink>
                </nav>
                <div className="app-header-actions">
                    <ThemeToggle />
                    <span className="user-pill">{user?.username}</span>
                    <button type="button" className="button" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </header>
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
