import { useEffect, useState, useCallback } from "react";
import {
  Transaction,
  getTransactions,
  deleteTransaction,
  MonthlySummary,
  getMonthlySummary,
} from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Pencil, AlertTriangle, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddTransactionForm } from "@/components/custom/AddTransactionForm";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/custom/CalendarView";
import { MonthlyView } from "@/components/custom/MonthlyView";

// Component DailyView không thay đổi
function DailyView({ onEdit, onDelete }: { onEdit: (tx: Transaction) => void, onDelete: (id: number) => void }) {
    const [groupedTransactions, setGroupedTransactions] = useState<Record<string, Transaction[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const groupTransactionsByDate = (transactions: Transaction[]) => {
        return transactions.reduce((acc, tx) => {
            const date = format(parseISO(tx.date), "yyyy-MM-dd");
            if (!acc[date]) acc[date] = [];
            acc[date].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);
    };

    useEffect(() => {
        getTransactions()
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setGroupedTransactions(groupTransactionsByDate(sortedData));
            })
            .catch(() => setError("Không thể tải danh sách giao dịch."))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

    if (loading) return <p className="text-center p-8">Đang tải...</p>;
    if (error) return <p className="text-center text-red-500 p-8">{error}</p>;

    return (
        <main className="space-y-6 mt-4">
            {Object.keys(groupedTransactions).length > 0 ? (
                Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                        <div className="flex justify-between items-center bg-muted/60 px-4 py-2 text-sm font-semibold sticky top-0 md:relative z-5">
                            <span>{format(parseISO(date), "dd", { locale: vi })}</span>
                            <span>{format(parseISO(date), "EEEE", { locale: vi })}</span>
                            <span className="text-right">{format(parseISO(date), "MMMM, yyyy", { locale: vi })}</span>
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
            ) : ( <p className="text-center text-muted-foreground p-8">Chưa có giao dịch nào.</p> )}
        </main>
    );
}

// --- COMPONENT TRANG GIAO DỊCH CHÍNH ---
export function TransactionsPage() {
    const [summaryData, setSummaryData] = useState<MonthlySummary | null>(null);
    const [summaryTitle, setSummaryTitle] = useState("Tổng quan Tháng này");
    const [error, setError] = useState("");
    
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isAlertOpen, setAlertOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const fetchMonthlySummary = useCallback(() => {
        setSummaryTitle("Tổng quan Tháng này");
        const now = new Date();
        getMonthlySummary(now.getFullYear(), now.getMonth() + 1)
            .then(setSummaryData)
            .catch(() => setError("Không thể tải tổng quan tháng."));
    }, []);

    useEffect(() => {
        fetchMonthlySummary();
    }, [fetchMonthlySummary]);
    
    // ✅ SỬA LỖI: Bọc hàm này trong useCallback
    const handleYearlySummaryChange = useCallback((summary: { totalIncome: number; totalExpense: number } | null) => {
        if (summary) {
            setSummaryTitle("Tổng quan Năm");
            setSummaryData(summary);
        } else {
            setSummaryTitle("Không có dữ liệu năm");
            setSummaryData(null);
        }
    }, []);
    
    const handleTabChange = (tabValue: string) => {
        if (tabValue !== 'monthly') {
            fetchMonthlySummary();
        }
    };

    // Các hàm handler còn lại không đổi
    const handleDeleteClick = (id: number) => {
        setTransactionToDelete(id);
        setAlertOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (transactionToDelete === null) return;
        try {
            await deleteTransaction(transactionToDelete);
            window.location.reload(); 
        } catch (err) {
            setError("Xóa giao dịch thất bại.");
        } finally {
            setAlertOpen(false);
            setTransactionToDelete(null);
        }
    };
    const handleAddClick = () => {
        setTransactionToEdit(null);
        setDialogOpen(true);
    };
    const handleEditClick = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setDialogOpen(true);
    };
    const handleSuccess = () => {
        setTransactionToEdit(null);
        window.location.reload();
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

    return (
        <div className="container mx-auto p-0 md:p-8 relative min-h-screen">
            <header className="mb-6 px-4 md:px-0">
                <h1 className="text-3xl font-bold">Giao dịch</h1>
            </header>

            {error && <Alert variant="destructive" className="mx-4 md:mx-0 mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Lỗi</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            {summaryData && (
                <Card className="mb-6 mx-4 md:mx-0">
                    <CardContent className="p-4 text-sm">
                        <div className="flex justify-between font-bold text-base mb-2">{summaryTitle}</div>
                        <div className="flex justify-between"><span>Tổng thu:</span><span className="font-medium text-green-600">{formatCurrency(summaryData.totalIncome)} đ</span></div>
                        <div className="flex justify-between"><span>Tổng chi:</span><span className="font-medium text-red-600">-{formatCurrency(summaryData.totalExpense)} đ</span></div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold"><span>Cộng:</span><span>{formatCurrency(summaryData.totalIncome - summaryData.totalExpense)} đ</span></div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="daily" className="w-full" onValueChange={handleTabChange}>
                <div className="px-4 md:px-0">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="daily">Hàng ngày</TabsTrigger>
                      <TabsTrigger value="calendar">Ngày</TabsTrigger>
                      <TabsTrigger value="monthly">Tháng</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="daily" className="px-0 md:px-0">
                    <DailyView onEdit={handleEditClick} onDelete={handleDeleteClick} />
                </TabsContent>
                <TabsContent value="calendar" className="px-0 md:px-0">
                    <CalendarView />
                </TabsContent>
                <TabsContent value="monthly" className="px-4 md:px-0">
                    <MonthlyView onYearlySummaryChange={handleYearlySummaryChange} />
                </TabsContent>
            </Tabs>

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