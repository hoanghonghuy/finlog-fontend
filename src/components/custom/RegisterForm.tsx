import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { registerUser } from "@/services/apiService";
import { Link, useNavigate } from "react-router-dom";

// 1. Định nghĩa schema validation với Zod
const formSchema = z.object({
    username: z.string().min(3, "Username phải có ít nhất 3 ký tự."),
    email: z.string().email("Email không hợp lệ."),
    password: z.string().min(6, "Password phải có ít nhất 6 ký tự."),
});

type RegisterFormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // 2. Khởi tạo form với useForm và zodResolver
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const { isSubmitting } = form.formState;

    // 3. Xử lý logic submit
    async function onSubmit(values: RegisterFormValues) {
        setApiError('');
        setSuccess('');

        try {
            await registerUser(values);
            setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err instanceof Error) {
                setApiError(err.message);
            }
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Đăng ký</CardTitle>
                <CardDescription>
                    Tạo tài khoản mới để bắt đầu quản lý tài chính của bạn.
                </CardDescription>
            </CardHeader>
            {/* 4. Dùng component Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="grid gap-4">
                        <FormField control={form.control} name="username" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Nhập password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
                        {success && <p className="text-sm text-green-500">{success}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting || !!success}>
                            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                        </Button>
                        <div className="text-center text-sm">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="underline">
                                Đăng nhập
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}