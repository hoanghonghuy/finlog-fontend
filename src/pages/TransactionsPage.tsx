import { useEffect, useState } from "react";
import { Transaction, getTransactions, deleteTransaction } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddTransactionForm } from "@/components/custom/AddTransactionForm";

export function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho các dialog
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isAlertOpen, setAlertOpen] = useState(false);
    
    // State để quản lý transaction đang được sửa hoặc xóa
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    // Hàm gọi API để lấy danh sách giao dịch
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await getTransactions();
            // Sắp xếp giao dịch theo ngày mới nhất lên đầu
            const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(sortedData);
        } catch (err) {
            setError('Không thể tải lịch sử giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    // Chạy fetchTransactions khi component được mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Hàm xử lý khi click nút xóa
    const handleDeleteClick = (id: number) => {
        setTransactionToDelete(id);
        setAlertOpen(true);
    };

    // Hàm xác nhận xóa
    const handleConfirmDelete = async () => {
        if (transactionToDelete === null) return;
        try {
            await deleteTransaction(transactionToDelete);
            // Cập nhật lại UI mà không cần gọi lại API
            setTransactions(prev => prev.filter(tx => tx.id !== transactionToDelete));
        } catch (err) {
            setError('Xóa giao dịch thất bại.');
        } finally {
            setAlertOpen(false);
            setTransactionToDelete(null);
        }
    };

    // Hàm xử lý khi click nút thêm mới
    const handleAddClick = () => {
        setTransactionToEdit(null); // Đảm bảo form ở chế độ "thêm mới"
        setDialogOpen(true);
    };

    // Hàm xử lý khi click nút sửa
    const handleEditClick = (transaction: Transaction) => {
        setTransactionToEdit(transaction); // Đưa transaction cần sửa vào state
        setDialogOpen(true);
    };
    
    // Hàm callback được gọi khi form thêm/sửa thành công
    const handleSuccess = (updatedOrNewTransaction?: Transaction) => {
        if (updatedOrNewTransaction) {
            // Nếu là chế độ Sửa, cập nhật lại item trong danh sách
            if (transactionToEdit) {
                setTransactions(prev => prev.map(tx => tx.id === updatedOrNewTransaction.id ? updatedOrNewTransaction : tx));
            } else {
            // Nếu là chế độ Thêm, thêm item mới vào đầu danh sách
                setTransactions(prev => [updatedOrNewTransaction, ...prev]);
            }
        }
        setTransactionToEdit(null);
    };


    if (loading) return <p className="p-8 text-center">Đang tải giao dịch...</p>;
    if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4 md:p-8 relative min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Lịch sử giao dịch</h1>
            </header>
            <main>
                {transactions.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <ul>
                                {transactions.map(tx => (
                                    <li key={tx.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback>{tx.category.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{tx.category.name}</span>
                                                <span className="text-sm text-muted-foreground">{tx.description}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.type === 'INCOME' ? '+' : '-'} 
                                                    {new Intl.NumberFormat('vi-VN').format(tx.amount)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{tx.account.name}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(tx)}>
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(tx.id)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-center text-muted-foreground">Chưa có giao dịch nào.</p>
                )}
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg" onClick={handleAddClick}>
                    <Plus className="h-8 w-8" />
                </Button>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{transactionToEdit ? 'Sửa Giao dịch' : 'Thêm Giao dịch mới'}</DialogTitle>
                    </DialogHeader>
                    <AddTransactionForm 
                        setOpen={setDialogOpen} 
                        onSuccess={handleSuccess}
                        transactionToEdit={transactionToEdit}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Giao dịch này sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
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