import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    description: z.string().min(1, "Mô tả không được để trống"),
    amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
    type: z.enum(["INCOME", "EXPENSE"], { required_error: "Vui lòng chọn loại giao dịch." }),
    date: z.date({ required_error: "Vui lòng chọn ngày." }),
    accountId: z.string().min(1, "Vui lòng chọn tài khoản."),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
});

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

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            amount: undefined,
            type: "EXPENSE",
            date: new Date(),
            accountId: "",
            categoryId: "",
        }
    });
    
    useEffect(() => {
        if (isEditMode && transactionToEdit) {
            form.reset({
                description: transactionToEdit.description,
                amount: transactionToEdit.amount,
                type: transactionToEdit.type,
                date: parseISO(transactionToEdit.date),
                // Sử dụng optional chaining (?.) để tránh lỗi khi account hoặc category không tồn tại
                accountId: String(transactionToEdit.account?.id || ''),
                categoryId: String(transactionToEdit.category?.id || ''),
            });
        } else {
            form.reset({ description: "", amount: undefined, type: "EXPENSE", date: new Date(), accountId: "", categoryId: "" });
        }
    }, [transactionToEdit, form, isEditMode]);

    useEffect(() => {
        Promise.all([getAccounts(), getCategories()]).then(([accs, cats]) => {
            setAccounts(accs);
            setCategories(cats);
        });
    }, []);

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
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 gap-2"
                                >
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="INCOME" id="income" className="sr-only" />
                                        </FormControl>
                                         <Label htmlFor="income" className={cn("flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'INCOME' && 'border-green-500 bg-green-500/10 text-green-700')}>
                                            Thu
                                        </Label>
                                    </FormItem>
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="EXPENSE" id="expense" className="sr-only" />
                                        </FormControl>
                                        <Label htmlFor="expense" className={cn("flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer", field.value === 'EXPENSE' && 'border-red-500 bg-red-500/10 text-red-700')}>
                                            Chi
                                        </Label>
                                    </FormItem>
                                    
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Ngày</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: vi }) : <span>Chọn ngày</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar locale={vi} mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="accountId" render={({ field }) => ( <FormItem><FormLabel>Tài khoản</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn tài khoản" /></SelectTrigger></FormControl><SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem><FormLabel>Danh mục</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="amount" render={({ field }) => ( <FormItem><FormLabel>Số tiền</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Ghi chú</FormLabel><FormControl><Input placeholder="Ăn tối, mua sắm..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                
                <Button type="submit" className="w-full">{isEditMode ? 'Cập nhật' : 'Lưu Giao dịch'}</Button>
            </form>
        </Form>
    );
}