import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addBudget, updateBudget, getCategories, Category, Budget, BudgetDto } from "@/services/apiService";

const formSchema = z.object({
    amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
});

interface BudgetFormProps {
    onSuccess: (budget: Budget) => void;
    setOpen: (open: boolean) => void;
    budgetToEdit?: Budget | null;
    selectedYear: number;
    selectedMonth: number;
}

export function BudgetForm({ onSuccess, setOpen, budgetToEdit, selectedYear, selectedMonth }: BudgetFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const isEditMode = !!budgetToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        if (isEditMode && budgetToEdit) {
            form.reset({
                amount: budgetToEdit.amount,
                categoryId: String(budgetToEdit.category.id),
            });
        } else {
            form.reset({ amount: undefined, categoryId: "" });
        }
    }, [budgetToEdit, form, isEditMode]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const budgetData: BudgetDto = {
                ...values,
                categoryId: Number(values.categoryId),
                year: selectedYear,
                month: selectedMonth,
            };
            let result: Budget;

            if (isEditMode && budgetToEdit) {
                result = await updateBudget(budgetToEdit.id, budgetData);
            } else {
                result = await addBudget(budgetData);
            }
            onSuccess(result);
            setOpen(false);
        } catch (error) {
            console.error("Failed to save budget:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem><FormLabel>Danh mục</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isEditMode}><FormControl><SelectTrigger><SelectValue placeholder="Chọn danh mục để đặt ngân sách" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="amount" render={({ field }) => ( <FormItem><FormLabel>Số tiền ngân sách</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="submit" className="w-full">{isEditMode ? 'Cập nhật' : 'Lưu'}</Button>
            </form>
        </Form>
    );
}