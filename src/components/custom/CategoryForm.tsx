import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addCategory, updateCategory, Category, CategoryDto } from "@/services/apiService";

const formSchema = z.object({
    name: z.string().min(1, "Tên danh mục không được để trống"),
});

interface CategoryFormProps {
    onSuccess: (category: Category) => void;
    setOpen: (open: boolean) => void;
    categoryToEdit?: Category | null;
}

export function CategoryForm({ onSuccess, setOpen, categoryToEdit }: CategoryFormProps) {
    const isEditMode = !!categoryToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (isEditMode && categoryToEdit) {
            form.setValue("name", categoryToEdit.name);
        } else {
            form.reset({ name: "" });
        }
    }, [categoryToEdit, form, isEditMode]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const categoryData: CategoryDto = values;
            let result: Category;

            if (isEditMode && categoryToEdit) {
                result = await updateCategory(categoryToEdit.id, categoryData);
            } else {
                result = await addCategory(categoryData);
            }
            onSuccess(result);
            setOpen(false);
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên danh mục</FormLabel>
                            <FormControl>
                                <Input placeholder="Ví dụ: Ăn uống" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    {isEditMode ? 'Cập nhật' : 'Lưu'}
                </Button>
            </form>
        </Form>
    );
}