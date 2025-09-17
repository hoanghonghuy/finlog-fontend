import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { loginUser } from "@/services/apiService";
import { Link, useNavigate } from "react-router-dom";

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);

        try {
            const data = await loginUser({ username, password });
            localStorage.setItem('authToken', data.token);
            // navigate('/dashboard');
            navigate('/transactions');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Ngăn trình duyệt reload lại trang
        handleLogin();
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                <CardDescription>
                    Nhập username và password của bạn để tiếp tục.
                </CardDescription>
            </CardHeader>
            {}
            <form onSubmit={handleSubmit}>
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
                <CardFooter className="flex flex-col gap-4">
                    {}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    <div className="text-center text-sm">
                        Chưa có tài khoản?{" "}
                        <Link to="/register" className="underline">
                            Đăng ký
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}