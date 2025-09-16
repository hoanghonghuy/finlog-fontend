import { Navigate } from "react-router-dom";
import { Layout } from "./Layout";

export const ProtectedRoute = () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return <Navigate to="/login" />;
    }

    return <Layout />;
};