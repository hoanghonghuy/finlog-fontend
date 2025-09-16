// src/components/custom/AccountList.tsx
import { useEffect, useState } from "react";
import { Account, getAccounts } from "@/services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountList() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts();
                setAccounts(data);
            } catch (err) {
                setError('Không thể tải danh sách tài khoản.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

    if (loading) {
        return <p>Đang tải tài khoản...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tài khoản của bạn</CardTitle>
                <CardDescription>Danh sách các tài khoản và số dư hiện tại.</CardDescription>
            </CardHeader>
            <CardContent>
                {accounts.length > 0 ? (
                    <ul>
                        {accounts.map(account => (
                            <li key={account.id} className="flex justify-between py-2 border-b">
                                <span>{account.name}</span>
                                <span className="font-semibold">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(account.balance)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Bạn chưa có tài khoản nào.</p>
                )}
            </CardContent>
        </Card>
    );
}