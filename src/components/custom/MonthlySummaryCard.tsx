import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlySummaryCardProps {
    totalIncome: number;
    totalExpense: number;
}

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export function MonthlySummaryCard({ totalIncome, totalExpense }: MonthlySummaryCardProps) {
    const netFlow = totalIncome - totalExpense;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tổng quan Tháng này</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tổng thu</span>
                    <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tổng chi</span>
                    <span className="font-semibold text-red-600">{formatCurrency(totalExpense)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Dòng tiền</span>
                    <span className={netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}>
                        {formatCurrency(netFlow)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}