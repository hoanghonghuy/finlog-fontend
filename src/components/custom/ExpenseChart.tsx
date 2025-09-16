import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseByCategory } from "@/services/apiService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseChartProps {
    data: ExpenseByCategory[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export function ExpenseChart({ data }: ExpenseChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Phân tích Chi tiêu</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="totalAmount"
                                nameKey="categoryName"
                            >
                                {data.map((_, index) => ( // Sửa 'entry' thành '_' vì không dùng đến
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-muted-foreground py-12">Không có dữ liệu chi tiêu để hiển thị.</p>
                )}
            </CardContent>
        </Card>
    );
}