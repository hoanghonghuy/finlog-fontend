import { Navigate, Outlet } from "react-router-dom";
import { Layout } from "./Layout";

export const ProtectedRoute = () => {
    const token = localStorage.getItem('authToken');

    // Nếu không có token, vẫn điều hướng về trang /login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Nếu có token, hiển thị Layout chung.
    // Các trang con sẽ được render bên trong Layout thông qua <Outlet />
    return <Layout />;
};