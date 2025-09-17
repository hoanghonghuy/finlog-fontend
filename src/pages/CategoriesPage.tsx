import { useEffect, useState } from "react";
import { Category, getCategories, deleteCategory } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil, MoreVertical, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CategoryForm } from "@/components/custom/CategoryForm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể tải danh sách danh mục.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setCategoryToEdit(null);
    setDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete === null) return;
    try {
      await deleteCategory(categoryToDelete);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete));
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setAlertOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSuccess = (category: Category) => {
    if (categoryToEdit) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? category : c))
      );
    } else {
      setCategories((prev) => [...prev, category]);
    }
    setCategoryToEdit(null);
  };

  return (
    <div className="container mx-auto p-0 md:p-8">
      <header className="mb-6 px-4 md:px-0">
        <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
      </header>
      <main className="px-4 md:px-0">
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="mb-4 hidden md:block">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Danh mục mới
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground mt-8">Đang tải danh mục...</p>
        ) : categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((cat) => (
              <Card key={cat.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-semibold">{cat.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleEditClick(cat)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Sửa</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteClick(cat.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Xóa</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            Chưa có danh mục nào.
          </p>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-lg z-10 md:hidden" onClick={handleAddClick}>
            <Plus className="h-8 w-8" />
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Sửa Danh mục" : "Thêm Danh mục mới"}
            </DialogTitle>
            <DialogDescription>
                Tạo hoặc chỉnh sửa danh mục để phân loại các giao dịch của bạn.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            setOpen={setDialogOpen}
            onSuccess={handleSuccess}
            categoryToEdit={categoryToEdit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Các giao dịch thuộc danh mục này
              có thể bị ảnh hưởng.
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