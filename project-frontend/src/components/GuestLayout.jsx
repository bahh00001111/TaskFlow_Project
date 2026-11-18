import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout() {
    const { token } = useStateContext();

    // បើមាន Token រួចហើយ (ធ្លាប់ Login ហើយ) មិនបាច់ឱ្យចូលទំព័រ Login/Register ទេ គឺទម្លាក់ចូល Dashboard វិញ
    if (token) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div>
            <Outlet />
        </div>
    );
}