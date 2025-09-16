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

// Định nghĩa schema validation bằng Zod
const formSchema = z.object({
    description: z.string().min(1, "Mô tả không được để trống"),
    amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
    type: z.enum(["INCOME", "EXPENSE"]),
    date: z.date({ required_error: "Vui lòng chọn ngày." }),
    accountId: z.string().min(1, "Vui lòng chọn tài khoản."),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
});

// Props của component, có thể nhận vào một transaction để sửa
interface AddTransactionFormProps {
    onSuccess: (updatedOrNewTransaction?: Transaction) => void;
    setOpen: (open: boolean) => void;
    transactionToEdit?: Transaction | null;
}

export function AddTransactionForm({ onSuccess, setOpen, transactionToEdit }: AddTransactionFormProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Xác định xem form đang ở chế độ sửa hay thêm mới
    const isEditMode = !!transactionToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // useEffect để lấy dữ liệu cho các dropdown
    useEffect(() => {
        Promise.all([getAccounts(), getCategories()]).then(([accs, cats]) => {
            setAccounts(accs);
            setCategories(cats);
        });
    }, []);
    
    // useEffect để điền dữ liệu vào form khi ở chế độ sửa
    useEffect(() => {
        if (isEditMode && transactionToEdit) {
            form.reset({
                description: transactionToEdit.description,
                amount: transactionToEdit.amount,
                type: transactionToEdit.type,
                date: parseISO(transactionToEdit.date), // Chuyển date string từ API thành Date object
                accountId: String(transactionToEdit.account.id),
                categoryId: String(transactionToEdit.category.id),
            });
        } else {
            // Reset về giá trị mặc định cho form thêm mới
            form.reset({ description: "", amount: undefined, type: "EXPENSE", date: new Date() });
        }
    }, [transactionToEdit, form, isEditMode]);

    // Hàm xử lý khi submit form, cho cả 2 chế độ
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const transactionData: TransactionDto = {
                ...values,
                accountId: Number(values.accountId),
                categoryId: Number(values.categoryId),
                date: format(values.date, "yyyy-MM-dd"), // Format date thành string yyyy-MM-dd cho backend
            };

            if (isEditMode && transactionToEdit) {
                const updatedTx = await updateTransaction(transactionToEdit.id, transactionData);
                onSuccess(updatedTx); // Gửi lại transaction đã được cập nhật
            } else {
                const newTx = await addTransaction(transactionData);
                onSuccess(newTx); // Gửi lại transaction vừa được tạo
            }
            setOpen(false); // Đóng dialog sau khi thành công
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