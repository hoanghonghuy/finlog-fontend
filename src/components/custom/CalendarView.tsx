import { useState, useEffect, useMemo } from "react";
import { Transaction, getTransactionsByMonth } from "@/services/apiService";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DayButtonProps } from "react-day-picker";
import { parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DailyTotal {
    income: number;
    expense: number;
    net: number;
}

const formatCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}tr`;
    }
    if (Math.abs(amount) >= 1000) {
        return `${(amount / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('vi-VN').format(amount);
}

function CustomDayButton(props: DayButtonProps & { dayTotals: Record<number, DailyTotal> }) {
    const { date, displayMonth } = props.day;
    const { dayTotals, modifiers } = props;

    if (!date) {
        return <div className="h-full w-full aspect-[4/5]" />;
    }

    const dayOfMonth = date.getDate();
    const totals = dayTotals[dayOfMonth];
    const isOutsideMonth = date.getMonth() !== displayMonth.getMonth();

    return (
        <Button
            variant="ghost"
            // Bỏ min-h, giảm padding cho mobile, giữ aspect-ratio
            className={cn(
                "h-full w-full aspect-[4/5] p-1 sm:p-2 border rounded-lg", // Padding nhỏ cho mobile, lớn hơn cho desktop
                "flex flex-col justify-between items-stretch text-left",
                isOutsideMonth && "text-muted-foreground/30 bg-muted/50",
                modifiers.today && "bg-accent text-accent-foreground ring-2 ring-primary"
            )}
        >
            {/* Phần số ngày giữ nguyên */}
            <div className="self-end font-medium text-xs">{dayOfMonth}</div>

            {/* Layout chi tiết CHỈ HIỂN THỊ trên màn hình sm trở lên */}
            {totals && !isOutsideMonth && (
                <div className="hidden sm:flex sm:flex-col sm:leading-tight sm:space-y-0.5">
                    {totals.income > 0 && (
                        <p className="text-green-600 text-[10px] truncate" title={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.income)}>
                            {formatCurrency(totals.income)}
                        </p>
                    )}
                    {totals.expense > 0 && (
                        <p className="text-red-600 text-[10px] truncate" title={`-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.expense)}`}>
                            -{formatCurrency(totals.expense)}
                        </p>
                    )}
                    {totals.income > 0 && totals.expense > 0 && (
                        <hr className="my-0.5 border-t border-border/50"/>
                    )}
                    <p className="font-semibold text-[11px] truncate" title={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.net)}>
                        {formatCurrency(totals.net)}
                    </p>
                </div>
            )}

            {/* Dấu chấm chỉ báo cho màn hình nhỏ (< sm) */}
            {totals && !isOutsideMonth && (
                <div className="sm:hidden flex justify-center items-end h-full pb-1">
                    <div className="flex space-x-1">
                        {totals.income > 0 && <span className="block w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                        {totals.expense > 0 && <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                    </div>
                </div>
            )}
        </Button>
    );
}


export function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlyTransactions = async () => {
            setLoading(true);
            try {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1;
                const data = await getTransactionsByMonth(year, month);
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch monthly transactions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMonthlyTransactions();
    }, [currentMonth]);

    const dayTotals = useMemo(() => {
        const totals: Record<number, DailyTotal> = {};
        transactions.forEach(tx => {
            const day = parseISO(tx.date).getDate();
            if (!totals[day]) {
                totals[day] = { income: 0, expense: 0, net: 0 };
            }
            if (tx.type === 'INCOME') {
                totals[day].income += tx.amount;
            } else {
                totals[day].expense += tx.amount;
            }
            totals[day].net = totals[day].income - totals[day].expense;
        });
        return totals;
    }, [transactions]);

    return (
        <div className="w-full">
            {loading ? <p className="text-center p-8">Đang tải dữ liệu lịch...</p> : (
                <Calendar
                    mode="single"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    locale={vi}
                    className="w-full"
                    classNames={{
                        cell: "p-1", // Khoảng hở giữa các ô
                        head_cell: "text-muted-foreground rounded-md w-auto font-normal text-[0.8rem]",
                    }}
                    components={{
                        DayButton: (props) => <CustomDayButton {...props} dayTotals={dayTotals} />
                    }}
                />
            )}
        </div>
    );
}