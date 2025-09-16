import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addTransaction, getAccounts, getCategories, Account, Category, Transaction, updateTransaction, TransactionDto } from "@/services/apiService";

// Sửa lại schema để tường minh hơn
const formSchema = z.object({
    description: z.string().min(1, "Mô tả không được để trống"),
    amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
    type: z.enum(["INCOME", "EXPENSE"]),
    date: z.date(), // Zod sẽ tự xử lý lỗi required
    accountId: z.string().min(1, "Vui lòng chọn tài khoản."),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
});

// Tạo một alias cho kiểu dữ liệu của form
type TransactionFormValues = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
    onSuccess: (updatedOrNewTransaction?: Transaction) => void;
    setOpen: (open: boolean) => void;
    transactionToEdit?: Transaction | null;
}

export function AddTransactionForm({ onSuccess, setOpen, transactionToEdit }: AddTransactionFormProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const isEditMode = !!transactionToEdit;

    // Sử dụng alias đã tạo
    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
    });
    
    useEffect(() => {
        if (isEditMode && transactionToEdit) {
            form.reset({
                description: transactionToEdit.description,
                amount: transactionToEdit.amount,
                type: transactionToEdit.type,
                date: parseISO(transactionToEdit.date),
                accountId: String(transactionToEdit.account.id),
                categoryId: String(transactionToEdit.category.id),
            });
        } else {
            form.reset({ description: "", amount: undefined, type: "EXPENSE", date: new Date() });
        }
    }, [transactionToEdit, form, isEditMode]);

    useEffect(() => {
        Promise.all([getAccounts(), getCategories()]).then(([accs, cats]) => {
            setAccounts(accs);
            setCategories(cats);
        });
    }, []);

    // Sử dụng alias đã tạo
    async function onSubmit(values: TransactionFormValues) {
        try {
            const transactionData: TransactionDto = {
                ...values,
                accountId: Number(values.accountId),
                categoryId: Number(values.categoryId),
                date: format(values.date, "yyyy-MM-dd"),
            };

            if (isEditMode && transactionToEdit) {
                const updatedTx = await updateTransaction(transactionToEdit.id, transactionData);
                onSuccess(updatedTx);
            } else {
                const newTx = await addTransaction(transactionData);
                onSuccess(newTx);
            }
            setOpen(false);
        } catch (error) {
            console.error("Failed to save transaction:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Mô tả</FormLabel><FormControl><Input placeholder="Ăn tối, mua sắm..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="amount" render={({ field }) => ( <FormItem><FormLabel>Số tiền</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="accountId" render={({ field }) => ( <FormItem><FormLabel>Tài khoản</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn tài khoản" /></SelectTrigger></FormControl><SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem><FormLabel>Danh mục</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Ngày</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Chọn ngày</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <Button type="submit" className="w-full">{isEditMode ? 'Cập nhật' : 'Lưu Giao dịch'}</Button>
            </form>
        </Form>
    );
}