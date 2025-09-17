// src/services/apiService.ts
import axios from 'axios';


// --- CÁC INTERFACE (KIỂU DỮ LIỆU) ---
interface LoginRequest {
    username?: string;
    password?: string;
}

interface RegisterRequest {
    username?: string;
    email?: string;
    password?: string;
}

interface LoginResponse {
    userId: number;
    token: string;
}

// Giao diện Category chỉ được định nghĩa một lần
export interface Category {
    id: number;
    name: string;
}

export interface CategoryDto {
    name: string;
}

// Kiểu dữ liệu cho Account, khớp với backend
export interface Account {
    id: number;
    name: string;
    balance: number;
}

export interface Transaction {
    id: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string; // Backend trả về string
    description: string;
    // Dữ liệu đã được làm phẳng
    categoryId: number | null;
    categoryName: string | null;
    accountId: number;
    accountName: string;
}

export interface TransactionDto {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    description: string;
    categoryId: number;
    accountId: number;
}

export interface YearlySummary {
    totalIncome: number;
    totalExpense: number;
    monthlySummaries: {
        month: number;
        totalIncome: number;
        totalExpense: number;
    }[];
}

export interface Budget {
    id: number;
    amount: number;
    month: number;
    year: number;
    category: Category;
}

export interface BudgetDto {
    amount: number;
    month: number;
    year: number;
    categoryId: number;
}

export interface MonthlySummary {
    totalIncome: number;
    totalExpense: number;
}

export interface ExpenseByCategory {
    categoryName: string;
    totalAmount: number;
}


// --- CẤU HÌNH AXIOS ---
const apiClient = axios.create({
    // Nếu biến môi trường tồn tại thì dùng nó, không thì mặc định là localhost cho dev
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- CÁC HÀM GỌI API ---
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Sai thông tin đăng nhập.');
        } else {
            throw new Error('Không thể kết nối tới server. Vui lòng thử lại.');
        }
    }
};

export const registerUser = async (data: RegisterRequest): Promise<void> => {
    try {
        await apiClient.post('/auth/register', data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data || 'Đăng ký không thành công.');
        } else {
            throw new Error('Không thể kết nối tới server. Vui lòng thử lại.');
        }
    }
};

export const getAccounts = async (): Promise<Account[]> => {
    const response = await apiClient.get<Account[]>('/accounts');
    return response.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>('/transactions');
    return response.data;
};

export const getTransactionsByMonth = async (year: number, month: number): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>(`/transactions/by-month`, { params: { year, month } });
    return response.data;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
};

export const addCategory = async (data: CategoryDto): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
};

export const updateCategory = async (id: number, data: CategoryDto): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/categories/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Ném ra lỗi với thông điệp từ server nếu có, không thì dùng thông điệp mặc định
            throw new Error(error.response.data.message || error.response.data || 'Xóa danh mục thất bại.');
        } else {
            throw new Error('Lỗi mạng hoặc không thể kết nối tới server.');
        }
    }
};

export const addTransaction = async (data: TransactionDto): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions', data);
    return response.data;
};

export const updateTransaction = async (id: number, data: TransactionDto): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
};

export const getBudgets = async (year: number, month: number): Promise<Budget[]> => {
    const response = await apiClient.get<Budget[]>(`/budgets?year=${year}&month=${month}`);
    return response.data;
};

export const addBudget = async (data: BudgetDto): Promise<Budget> => {
    const response = await apiClient.post<Budget>('/budgets', data);
    return response.data;
};

export const updateBudget = async (id: number, data: BudgetDto): Promise<Budget> => {
    const response = await apiClient.put<Budget>(`/budgets/${id}`, data);
    return response.data;
};

export const deleteBudget = async (id: number): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
};

export const getMonthlySummary = async (year: number, month: number): Promise<MonthlySummary> => {
    const response = await apiClient.get<MonthlySummary>(`/reports/monthly-summary?year=${year}&month=${month}`);
    return response.data;
};

export const getExpenseByCategory = async (year: number, month: number): Promise<ExpenseByCategory[]> => {
    const response = await apiClient.get<ExpenseByCategory[]>(`/reports/expense-by-category?year=${year}&month=${month}`);
    return response.data;
};

export interface AccountDto {
    name: string;
    initialBalance?: number;
}

export const addAccount = async (data: AccountDto): Promise<Account> => {
    const response = await apiClient.post<Account>('/accounts', data);
    return response.data;
};

export const updateAccount = async (id: number, data: AccountDto): Promise<Account> => {
    const response = await apiClient.put<Account>(`/accounts/${id}`, data);
    return response.data;
};

export const deleteAccount = async (id: number): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`);
};

export const getYearlySummary = async (year: number): Promise<YearlySummary> => {
    const response = await apiClient.get<YearlySummary>('/reports/yearly-summary', { params: { year } });
    return response.data;
}