import { Link, Navigate, Outlet } from "react-router-dom"; // Import Link ចូល
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../api/axios";

export default function DefaultLayout() {
    const { user, token, setUser, setToken } = useStateContext();

    if (!token) {
        return <Navigate to="/login" />
    }

    const onLogout = (ev) => {
        ev.preventDefault();
        axiosClient.post('/logout')
            .then(() => {
                setUser({});
                setToken(null);
            })
            .catch(() => {
                setUser({});
                setToken(null);
            });
    };

    return (
        <div id="defaultLayout">
            <aside>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/projects">Projects</Link> {/* បន្ថែម Link ត្រង់នេះ */}
            </aside>
            <div className="content">
                <header>
                    <div>
                        TaskFlow Project Management
                    </div>
                    <div>
                        {user.name}
                        &nbsp; &nbsp;
                        <button onClick={onLogout} className="btn-logout" style={{ cursor: 'pointer', padding: '5px 10px' }}>
                            Logout
                        </button>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}