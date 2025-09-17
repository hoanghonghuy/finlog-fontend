import { NavLink } from "react-router-dom";
import { BarChart3, Wallet, Tag, GanttChartSquare, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { to: "/reports", icon: BarChart3, label: "Báo cáo" },
    { to: "/transactions", icon: Wallet, label: "Giao dịch" },
    { to: "/accounts", icon: Landmark, label: "Tài khoản" },
    { to: "/categories", icon: Tag, label: "Danh mục" },
    { to: "/budgets", icon: GanttChartSquare, label: "Ngân sách" },
];

export function Sidebar() {
    const activeLinkClass = "bg-primary text-primary-foreground";
    const inactiveLinkClass = "hover:bg-muted hover:text-muted-foreground";

    return (
        <aside className="w-64 h-screen border-r bg-muted/40 p-4 hidden md:block sticky top-0">
            <h1 className="text-2xl font-bold mb-8">FinLog</h1>
            <nav className="flex flex-col gap-2">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => 
                            cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all",
                                isActive ? activeLinkClass : inactiveLinkClass
                            )
                        }
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}