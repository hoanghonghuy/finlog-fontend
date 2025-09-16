// src/components/custom/LoginForm.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { loginUser } from "@/services/apiService";
import { useNavigate } from "react-router-dom"; // <-- Import hook chuyển trang

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // <-- Khởi tạo hook

    const handleLogin = async () => {
        setLoading(true);

        try {
            const data = await loginUser({ username, password });
            console.log("Đăng nhập thành công!", data);

            // --- PHẦN THAY ĐỔI QUAN TRỌNG ---
            // 1. Lưu token vào localStorage
            localStorage.setItem('authToken', data.token);

            // 2. Chuyển người dùng đến trang dashboard
            navigate('/dashboard');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                console.error("Lỗi đăng nhập:", err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                <CardDescription>
                    Nhập username và password của bạn để tiếp tục.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Nhập username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Nhập password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLogin} disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
            </CardFooter>
        </Card>
    );
}