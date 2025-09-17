import { NavLink } from "react-router-dom";
import { BarChart3, Wallet, Tag, GanttChartSquare, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { to: "/transactions", icon: Wallet, label: "Giao dịch" },
    { to: "/reports", icon: BarChart3, label: "Báo cáo" },
    { to: "/accounts", icon: Landmark, label: "Tài khoản" },
    { to: "/budgets", icon: GanttChartSquare, label: "Ngân sách" },
    { to: "/categories", icon: Tag, label: "Danh mục" },
];

export function BottomNav() {
    // CSS classes cho trạng thái active và inactive
    const activeLinkClass = "text-primary";
    const inactiveLinkClass = "text-muted-foreground";

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-10 md:hidden">
            <div className="grid h-full grid-cols-5">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => 
                            cn(
                                "flex flex-col items-center justify-center gap-1 pt-1 text-xs",
                                isActive ? activeLinkClass : inactiveLinkClass
                            )
                        }
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}