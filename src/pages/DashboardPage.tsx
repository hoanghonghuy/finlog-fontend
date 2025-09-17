import { Navigate } from "react-router-dom";

export function DashboardPage() {
    // Luôn chuyển hướng đến trang giao dịch, là trang chính mới
    return <Navigate to="/transactions" />;
}