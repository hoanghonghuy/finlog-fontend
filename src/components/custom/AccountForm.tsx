import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addAccount, updateAccount, Account, AccountDto } from "@/services/apiService";

const formSchema = z.object({
    name: z.string().min(1, "Tên tài khoản không được để trống"),
    initialBalance: z.coerce.number().min(0, "Số dư phải là số không âm").optional(),
});

type AccountFormValues = z.infer<typeof formSchema>;

interface AccountFormProps {
    onSuccess: (account: Account) => void;
    setOpen: (open: boolean) => void;
    accountToEdit?: Account | null;
}

export function AccountForm({ onSuccess, setOpen, accountToEdit }: AccountFormProps) {
    const isEditMode = !!accountToEdit;

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isEditMode && accountToEdit) {
            form.reset({
                name: accountToEdit.name,
                initialBalance: accountToEdit.balance, // Hiển thị số dư hiện tại
            });
        } else {
            form.reset({ name: "", initialBalance: 0 });
        }
    }, [accountToEdit, form, isEditMode]);

    async function onSubmit(values: AccountFormValues) {
        try {
            const accountData: AccountDto = {
                name: values.name,
                // Chỉ gửi initialBalance khi tạo mới
                ...(!isEditMode && { initialBalance: values.initialBalance }),
            };

            let result: Account;

            if (isEditMode && accountToEdit) {
                // Backend chỉ cho phép cập nhật tên, nên ta chỉ gửi tên
                result = await updateAccount(accountToEdit.id, { name: values.name });
            } else {
                result = await addAccount(accountData);
            }
            onSuccess(result);
            setOpen(false);
        } catch (error) {
            console.error("Failed to save account:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tên tài khoản</FormLabel>
                        <FormControl>
                            <Input placeholder="Ví dụ: Ví tiền mặt" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="initialBalance" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Số dư</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled={isEditMode} />
                        </FormControl>
                        <FormDescription>
                            {isEditMode ? "Số dư không thể sửa trực tiếp." : "Số dư ban đầu của tài khoản."}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full">
                    {isEditMode ? 'Cập nhật' : 'Lưu'}
                </Button>
            </form>
        </Form>
    );
}