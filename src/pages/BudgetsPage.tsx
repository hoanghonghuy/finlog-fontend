import { useEffect, useState } from "react";
import { Budget, getBudgets, deleteBudget } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BudgetForm } from "@/components/custom/BudgetForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho việc chọn tháng/năm
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // State cho các dialog
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);

  // State quản lý item đang được sửa/xóa
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  // Fetch budgets khi tháng hoặc năm thay đổi
  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const data = await getBudgets(selectedYear, selectedMonth);
        setBudgets(data);
      } catch (err) {
        setError("Không thể tải danh sách ngân sách.");
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [selectedYear, selectedMonth]);

  const handleAddClick = () => {
    setBudgetToEdit(null);
    setDialogOpen(true);
  };

  const handleEditClick = (budget: Budget) => {
    setBudgetToEdit(budget);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setBudgetToDelete(id);
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (budgetToDelete === null) return;
    try {
      await deleteBudget(budgetToDelete);
      setBudgets((prev) => prev.filter((b) => b.id !== budgetToDelete));
    } catch (err) {
      setError("Xóa ngân sách thất bại.");
    } finally {
      setAlertOpen(false);
      setBudgetToDelete(null);
    }
  };

  const handleSuccess = (budget: Budget) => {
    if (budgetToEdit) {
      setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)));
    } else {
      setBudgets((prev) => [...prev, budget]);
    }
    setBudgetToEdit(null);
  };

  // Tạo danh sách các năm và tháng để chọn
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý Ngân Sách</h1>
      </header>

      <div className="flex gap-4 mb-6">
        <Select
          value={String(selectedYear)}
          onValueChange={(val) => setSelectedYear(Number(val))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedMonth)}
          onValueChange={(val) => setSelectedMonth(Number(val))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={String(m)}>
                Tháng {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <main>
        <div className="mb-4">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Đặt Ngân sách mới
          </Button>
        </div>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : budgets.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <ul>
                {budgets.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between p-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold">{b.category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ngân sách:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(b.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(b)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(b.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            Chưa có ngân sách nào được đặt cho tháng này.
          </p>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {budgetToEdit
                ? "Sửa Ngân sách"
                : `Đặt Ngân sách cho Tháng ${selectedMonth}/${selectedYear}`}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            setOpen={setDialogOpen}
            onSuccess={handleSuccess}
            budgetToEdit={budgetToEdit}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
