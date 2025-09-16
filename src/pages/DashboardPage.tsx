import { AccountList } from "@/components/custom/AccountList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MonthlySummaryCard } from "@/components/custom/MonthlySummaryCard";
import { ExpenseChart } from "@/components/custom/ExpenseChart";
import { getMonthlySummary, getExpenseByCategory, MonthlySummary, ExpenseByCategory } from "@/services/apiService";
import { useEffect, useState } from "react";

export function DashboardPage() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [expenseData, setExpenseData] = useState<ExpenseByCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            try {
                const [summaryData, expenseChartData] = await Promise.all([
                    getMonthlySummary(year, month),
                    getExpenseByCategory(year, month)
                ]);
                setSummary(summaryData);
                setExpenseData(expenseChartData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <>
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                    Đăng xuất
                </Button>
            </header>
            
            <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p>Đang tải dữ liệu báo cáo...</p>
                ) : (
                    <>
                        <div className="lg:col-span-1 space-y-6">
                            {summary && <MonthlySummaryCard totalIncome={summary.totalIncome} totalExpense={summary.totalExpense} />}
                            <ExpenseChart data={expenseData} />
                        </div>
                        <div className="lg:col-span-2">
                             <AccountList />
                        </div>
                    </>
                )}
            </main>
        </>
    );
}