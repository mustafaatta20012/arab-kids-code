export interface ApiResponse<T = any> {
    success: boolean;
    code?: string;
    message: string;
    data?: T;
    details?: any;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}
export interface ApiErrorResponse {
    success: false;
    code: string;
    message: string;
    details?: any;
}
//# sourceMappingURL=api.d.ts.map