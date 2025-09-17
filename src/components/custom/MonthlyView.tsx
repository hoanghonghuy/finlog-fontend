import { useState, useEffect } from "react";
import { YearlySummary, getYearlySummary } from "@/services/apiService";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface MonthlyViewProps {
    onYearlySummaryChange: (summary: { totalIncome: number; totalExpense: number } | null, year: number) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

export function MonthlyView({ onYearlySummaryChange }: MonthlyViewProps) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState<YearlySummary | null>(null);
    const [loading, setLoading] = useState(true);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const fetchYearlyData = async () => {
            setLoading(true);
            try {
                const data = await getYearlySummary(selectedYear);
                
                const currentYear = new Date().getFullYear();
                if (selectedYear === currentYear) {
                    const currentMonth = new Date().getMonth() + 1;
                    data.monthlySummaries = data.monthlySummaries.filter(m => m.month <= currentMonth);
                }

                setSummary(data);
                onYearlySummaryChange({ totalIncome: data.totalIncome, totalExpense: data.totalExpense }, selectedYear);

            } catch (error) {
                console.error("Failed to fetch yearly summary", error);
                onYearlySummaryChange(null, selectedYear);
            } finally {
                setLoading(false);
            }
        };
        fetchYearlyData();
    }, [selectedYear]);

    return (
        <div className="space-y-4 mt-4">
            <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>Năm {y}</SelectItem>)}</SelectContent>
            </Select>

            {loading ? <p className="text-center p-8">Đang tải...</p> : 
             summary ? (
                <div className="space-y-4">
                    {summary.monthlySummaries.map(monthData => {
                         const net = monthData.totalIncome - monthData.totalExpense;
                         const totalMonth = monthData.totalIncome + monthData.totalExpense;
                         const incomePercentage = totalMonth > 0 ? (monthData.totalIncome / totalMonth) * 100 : 0;
                        return (
                            <Card key={monthData.month}>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Tháng {monthData.month}</span>
                                        <span className={net >= 0 ? 'text-blue-600' : 'text-red-600'}>{formatCurrency(net)} đ</span>
                                    </div>
                                    <Progress value={incomePercentage} className="h-2 [&>div]:bg-green-500" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span className="text-green-600">{formatCurrency(monthData.totalIncome)} đ</span>
                                        <span className="text-red-600">-{formatCurrency(monthData.totalExpense)} đ</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
             ) : <p>Không có dữ liệu.</p>
            }
        </div>
    )
}