import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Transaction,
  deleteTransaction,
  MonthlySummary,
  getMonthlySummary,
  getTransactionsByMonth,
} from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Pencil, AlertTriangle, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddTransactionForm } from "@/components/custom/AddTransactionForm";
import { format, parseISO, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/custom/CalendarView";
import { MonthlyView } from "@/components/custom/MonthlyView";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MonthYearPicker } from "@/components/custom/MonthYearPicker";

// --- CÁC COMPONENT CON ---
function MonthNavigator({ date, onDateChange }: { date: Date, onDateChange: (newDate: Date) => void }) {
    const [isPickerOpen, setPickerOpen] = useState(false);
    
    const handleDateChangeAndClose = (newDate: Date) => {
        onDateChange(newDate);
        setPickerOpen(false);
    }

    return (
        <div className="flex justify-center items-center gap-2 my-4">
            <Button variant="outline" size="icon" onClick={() => onDateChange(subMonths(date, 1))}><ChevronLeft className="h-4 w-4"/></Button>
            <Popover open={isPickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-36 md:w-40">
                        {format(date, "'Tháng' M, yyyy", { locale: vi })}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <MonthYearPicker date={date} onChange={handleDateChangeAndClose} />
                </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => onDateChange(addMonths(date, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
    );
}

function DailyView({ transactions, onEdit, onDelete }: { transactions: Transaction[], onEdit: (tx: Transaction) => void, onDelete: (id: number) => void }) {
    const dailyTotals = useMemo(() => {
        const totals: Record<string, { income: number; expense: number }> = {};
        transactions.forEach(tx => {
            const dateStr = format(parseISO(tx.date), "yyyy-MM-dd");
            if (!totals[dateStr]) {
                totals[dateStr] = { income: 0, expense: 0 };
            }
            if (tx.type === 'INCOME') {
                totals[dateStr].income += tx.amount;
            } else {
                totals[dateStr].expense += tx.amount;
            }
        });
        return totals;
    }, [transactions]);
    
    const groupedTransactions = useMemo(() => {
        return transactions.reduce((acc, tx) => {
            const date = format(parseISO(tx.date), "yyyy-MM-dd");
            if (!acc[date]) acc[date] = [];
            acc[date].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);
    }, [transactions]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

    return (
        <main className="space-y-6">
            {transactions.length > 0 ? (
                Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                        <div className="flex justify-between items-center bg-muted/60 px-4 py-2 text-sm font-semibold sticky top-[188px] md:top-[204px] z-5 border-y">
                            <span className="font-bold text-xs md:text-sm">{format(parseISO(date), "EEEE, dd.MM.yyyy", { locale: vi })}</span>
                            <div className="flex gap-2 md:gap-4 text-xs">
                                <span className="text-green-600">{formatCurrency(dailyTotals[date].income)}</span>
                                <span className="text-red-600">-{formatCurrency(dailyTotals[date].expense)}</span>
                            </div>
                        </div>
                        <ul>
                            {txs.map((tx) => (
                                <li key={tx.id} className="flex items-center justify-between p-4 border-b">
                                    <div className="flex items-center gap-4">
                                        <Avatar><AvatarFallback>{(tx.categoryName || '?').charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-semibold">{tx.categoryName || 'Chưa phân loại'}</p>
                                            <p className="text-sm text-muted-foreground">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground italic">{tx.accountName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <p className={`font-bold text-right mr-2 ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                                            {tx.type === "INCOME" ? "+" : "-"}
                                            {formatCurrency(tx.amount)} đ
                                        </p>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => onEdit(tx)}><Pencil className="mr-2 h-4 w-4" /><span>Sửa</span></DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => onDelete(tx.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /><span>Xóa</span></DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : ( <p className="text-center text-muted-foreground p-8">Không có giao dịch nào trong tháng này.</p> )}
        </main>
    );
}

// --- COMPONENT TRANG GIAO DỊCH CHÍNH ---
export function TransactionsPage() {
    const [summaryData, setSummaryData] = useState<{ totalIncome: number, totalExpense: number } | null>(null);
    const [summaryTitle, setSummaryTitle] = useState("Tổng quan Tháng này");
    const [error, setError] = useState("");
    
    const [displayMonth, setDisplayMonth] = useState(new Date());
    const [dailyTransactions, setDailyTransactions] = useState<Transaction[]>([]);
    const [isLoadingDaily, setIsLoadingDaily] = useState(true);

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isAlertOpen, setAlertOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [activeTab, setActiveTab] = useState("daily");

    const fetchMonthlySummary = useCallback(() => {
        const year = displayMonth.getFullYear();
        const month = displayMonth.getMonth() + 1;
        setSummaryTitle(`Tổng quan Tháng ${month}/${year}`);
        getMonthlySummary(year, month)
            .then(setSummaryData)
            .catch(() => setError("Không thể tải tổng quan tháng."));
    }, [displayMonth]);

    useEffect(() => {
        if (activeTab !== 'monthly') {
            fetchMonthlySummary();
        }
    }, [activeTab, fetchMonthlySummary]);

    useEffect(() => {
        setIsLoadingDaily(true);
        const year = displayMonth.getFullYear();
        const month = displayMonth.getMonth() + 1;
        getTransactionsByMonth(year, month)
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setDailyTransactions(sortedData);
            })
            .catch(() => setError("Không thể tải danh sách giao dịch."))
            .finally(() => setIsLoadingDaily(false));
    }, [displayMonth]);
    
    const handleYearlySummaryChange = useCallback((summary: { totalIncome: number; totalExpense: number } | null, year: number) => {
        if (summary) {
            setSummaryTitle(`Tổng quan Năm ${year}`);
            setSummaryData(summary);
        } else {
            setSummaryTitle(`Tổng quan Năm ${year}`);
            setSummaryData({ totalIncome: 0, totalExpense: 0 });
        }
    }, []);
    
    const handleTabChange = (tabValue: string) => {
        setActiveTab(tabValue);
        if (tabValue !== 'monthly') {
            setDisplayMonth(new Date());
        }
    };

    const handleDeleteClick = (id: number) => { setTransactionToDelete(id); setAlertOpen(true); };
    const handleConfirmDelete = async () => { if (transactionToDelete === null) return; try { await deleteTransaction(transactionToDelete); setDisplayMonth(new Date(displayMonth)); } catch (err) { setError("Xóa giao dịch thất bại."); } finally { setAlertOpen(false); setTransactionToDelete(null); } };
    const handleAddClick = () => { setTransactionToEdit(null); setDialogOpen(true); };
    const handleEditClick = (transaction: Transaction) => { setTransactionToEdit(transaction); setDialogOpen(true); };
    const handleSuccess = () => { setTransactionToEdit(null); setDisplayMonth(new Date(displayMonth)); };

    const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

    return (
        <div className="container mx-auto p-0 md:p-8 relative min-h-screen pb-24 md:pb-8">
            
            {}
            <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm pt-4 md:pt-0">
                <header className="mb-6 px-4 md:px-0">
                    <h1 className="text-3xl font-bold">Giao dịch</h1>
                </header>

                {error && <Alert variant="destructive" className="mx-4 md:mx-0 mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Lỗi</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                {summaryData && (
                <Card className="mb-6 mx-4 md:mx-0">
                    <CardContent className="p-3">
                        {}
                        <div className="grid grid-cols-3 divide-x text-center">
                            <div className="px-2">
                                <div className="text-xs text-muted-foreground">Thu</div>
                                <div className="font-bold text-green-600">{formatCurrency(summaryData.totalIncome)}</div>
                            </div>
                            <div className="px-2">
                                <div className="text-xs text-muted-foreground">Chi</div>
                                <div className="font-bold text-red-600">{formatCurrency(summaryData.totalExpense)}</div>
                            </div>
                            <div className="px-2">
                                <div className="text-xs text-muted-foreground">Cộng</div>
                                <div className="font-bold">{formatCurrency(summaryData.totalIncome - summaryData.totalExpense)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

                <Tabs defaultValue="daily" className="w-full" onValueChange={handleTabChange} value={activeTab}>
                    <div className="px-4 md:px-0">
                      <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="daily">Hàng ngày</TabsTrigger>
                          <TabsTrigger value="calendar">Ngày</TabsTrigger>
                          <TabsTrigger value="monthly">Tháng</TabsTrigger>
                      </TabsList>
                    </div>
                </Tabs>
            </div>
            {}

            {/* Phần nội dung của các Tab */}
            <Tabs defaultValue="daily" className="w-full" value={activeTab}>
                <TabsContent value="daily" className="px-0 md:px-0 mt-0">
                    <MonthNavigator date={displayMonth} onDateChange={setDisplayMonth} />
                    {isLoadingDaily ? <p className="text-center p-8">Đang tải...</p> : <DailyView transactions={dailyTransactions} onEdit={handleEditClick} onDelete={handleDeleteClick} />}
                </TabsContent>
                <TabsContent value="calendar" className="px-0 md:px-0 mt-0">
                    <CalendarView />
                </TabsContent>
                <TabsContent value="monthly" className="px-4 md:px-0 mt-0">
                    <MonthlyView onYearlySummaryChange={handleYearlySummaryChange} />
                </TabsContent>
            </Tabs>

            {/* Dialogs and Add Button */}
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <Button className="fixed bottom-20 md:bottom-8 right-6 md:right-8 h-16 w-16 rounded-full shadow-lg z-10" onClick={handleAddClick}><Plus className="h-8 w-8" /></Button>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{transactionToEdit ? "Sửa Giao dịch" : "Thêm Giao dịch mới"}</DialogTitle>
                        <DialogDescription>Điền thông tin chi tiết cho giao dịch của bạn tại đây.</DialogDescription>
                    </DialogHeader>
                    <AddTransactionForm setOpen={setDialogOpen} onSuccess={handleSuccess} transactionToEdit={transactionToEdit} />
                </DialogContent>
            </Dialog>
            <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>Hành động này không thể hoàn tác. Giao dịch này sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Tiếp tục</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}