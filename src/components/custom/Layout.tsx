import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function Layout() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            
            {}
            <Sidebar /> 

            {}
            <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6"> {}
                <Outlet />
            </main>

            {}
            <BottomNav /> {}
        </div>
    );
}