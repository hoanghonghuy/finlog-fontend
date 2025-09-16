import { useEffect, useState } from "react";
import { Category, getCategories, deleteCategory } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CategoryForm } from "@/components/custom/CategoryForm";


export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho các dialog
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);

  // State quản lý item đang được sửa/xóa
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Không thể tải danh sách danh mục.");
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
    } catch (err) {
      setError("Xóa danh mục thất bại.");
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

  if (loading) return <p className="p-8 text-center">Đang tải danh mục...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
      </header>
      <main>
        <div className="mb-4">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Danh mục mới
          </Button>
        </div>
        {categories.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <ul>
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center justify-between p-4 border-b last:border-b-0"
                  >
                    <span className="font-semibold">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(cat)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(cat.id)}
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
            Chưa có danh mục nào.
          </p>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Sửa Danh mục" : "Thêm Danh mục mới"}
            </DialogTitle>
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
