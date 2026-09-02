export interface RevenueSummary {
    totalAmount: number;
    totalPayments: number;
    avgAmount: number;
}

export interface StoreTotals {
    store_id: number;
    store_name: string;
    totalAmount: number;
    totalPayments: number;
}

export interface MonthTotals {
    month: string;
    totalAmount: number;
    totalPayments: number;
}

export interface TopCustomer {
    customer_id: number;
    name: string;
    totalAmount: number;
    totalPayments: number;
}

export interface RevenueReport {
    summary: RevenueSummary;
    byStore: StoreTotals[];
    monthly: MonthTotals[];
    topCustomers: TopCustomer[];
}

export interface RevenueQuery {
    storeId?: number;
    customerId?: number;
    dateFrom?: string;
    dateTo?: string;
}