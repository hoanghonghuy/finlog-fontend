import { MonthlySummaryCard } from "@/components/custom/MonthlySummaryCard";
import { ExpenseChart } from "@/components/custom/ExpenseChart";
import { getMonthlySummary, getExpenseByCategory, MonthlySummary, ExpenseByCategory } from "@/services/apiService";
import { useEffect, useState } from "react";

export function ReportsPage() {
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [expenseData, setExpenseData] = useState<ExpenseByCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
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


    return (
        <div className="container mx-auto p-0 md:p-8">
             <header className="mb-6 px-4 md:px-0">
                <h1 className="text-3xl font-bold">Báo cáo & Phân tích</h1>
            </header>
            
            <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
                {loading ? (
                    <p>Đang tải dữ liệu báo cáo...</p>
                ) : (
                    <>
                        <div className="col-span-1 space-y-6">
                           {summary && <MonthlySummaryCard totalIncome={summary.totalIncome} totalExpense={summary.totalExpense} />}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <ExpenseChart data={expenseData} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}