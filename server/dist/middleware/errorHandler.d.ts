import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}
export declare function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void;
export declare function createError(message: string, statusCode: number, code: string): AppError;
//# sourceMappingURL=errorHandler.d.ts.map