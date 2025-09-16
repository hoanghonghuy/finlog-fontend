// src/pages/LoginPage.tsx
import { LoginForm } from "@/components/custom/LoginForm";

export function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <LoginForm />
        </div>
    );
}