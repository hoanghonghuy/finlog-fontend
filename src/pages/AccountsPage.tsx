import { useEffect, useMemo, useState } from "react";
import { Account, getAccounts, deleteAccount } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AccountForm } from "@/components/custom/AccountForm";

// --- COMPONENT CHÍNH ---
export function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isAlertOpen, setAlertOpen] = useState(false);
    
    const [accountToDelete, setAccountToDelete] = useState<number | null>(null);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await getAccounts();
            setAccounts(data);
        } catch (err) {
            setError('Không thể tải danh sách tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    // --- LOGIC MỚI: Tính toán tổng tài sản và nợ ---
    const summary = useMemo(() => {
        return accounts.reduce((acc, account) => {
            if (account.balance >= 0) {
                acc.assets += account.balance;
            } else {
                acc.liabilities += account.balance;
            }
            return acc;
        }, { assets: 0, liabilities: 0 });
    }, [accounts]);

    const handleAddClick = () => {
        setAccountToEdit(null);
        setDialogOpen(true);
    };

    const handleEditClick = (account: Account) => {
        setAccountToEdit(account);
        setDialogOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setAccountToDelete(id);
        setAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (accountToDelete === null) return;
        try {
            await deleteAccount(accountToDelete);
            fetchAccounts();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'Xóa tài khoản thất bại.');
            } else {
                setError('Xóa tài khoản thất bại.');
            }
        } finally {
            setAlertOpen(false);
            setAccountToDelete(null);
        }
    };

    const handleSuccess = (account: Account) => {
        fetchAccounts();
        setAccountToEdit(null);
    };

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    if (loading) return <p className="p-8 text-center">Đang tải tài khoản...</p>;
    
    return (
        <div className="container mx-auto p-0 md:p-8">
            <header className="mb-6 px-4 md:px-0">
                <h1 className="text-3xl font-bold">Quản lý Tài khoản</h1>
            </header>

            {/* --- THẺ TỔNG QUAN MỚI --- */}
            <Card className="mb-6 mx-4 md:mx-0">
                <CardContent className="p-4 grid grid-cols-3 divide-x text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Tài sản</p>
                        <p className="font-bold text-blue-600">{formatCurrency(summary.assets)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Khoản nợ</p>
                        <p className="font-bold text-red-600">{formatCurrency(summary.liabilities)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Cộng</p>
                        <p className="font-bold">{formatCurrency(summary.assets + summary.liabilities)}</p>
                    </div>
                </CardContent>
            </Card>

            <main className="px-4 md:px-0">
                {error && <p className="p-4 mb-4 text-center text-red-500 bg-red-100 rounded-md">{error}</p>}
                
                {}
                <div className="mb-4 hidden md:block">
                    <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm Tài khoản mới
                    </Button>
                </div>

                {accounts.length > 0 ? (
                    <div className="space-y-4">
                        {accounts.map(acc => (
                            <Card key={acc.id} onClick={() => handleEditClick(acc)} className="cursor-pointer md:cursor-default">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <p className="font-semibold">{acc.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-right">
                                            {formatCurrency(acc.balance)}
                                        </p>
                                        {}
                                        <div className="hidden md:flex">
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(acc); }}>
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteClick(acc.id); }}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground mt-8">Bạn chưa có tài khoản nào.</p>
                )}
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                 {}
                <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-lg z-10 md:hidden" onClick={handleAddClick}>
                    <Plus className="h-8 w-8" />
                </Button>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{accountToEdit ? 'Sửa Tài khoản' : 'Thêm Tài khoản mới'}</DialogTitle>
                    </DialogHeader>
                    <AccountForm 
                        setOpen={setDialogOpen} 
                        onSuccess={handleSuccess}
                        accountToEdit={accountToEdit}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Nếu tài khoản đã có giao dịch, bạn sẽ không thể xóa.
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