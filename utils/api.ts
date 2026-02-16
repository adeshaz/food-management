// utils/api.ts
export class ApiResponse<T> {
    constructor(
        public success: boolean,
        public message: string,
        public data?: T,
        public error?: string
    ) { }
}

export function successResponse<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse(true, message, data);
}

export function errorResponse(message: string, error?: string): ApiResponse<null> {
    return new ApiResponse(false, message, null, error);
}

export function validationErrorResponse(errors: Record<string, string[]>): ApiResponse<null> {
    return new ApiResponse(false, 'Validation failed', null, JSON.stringify(errors));
}