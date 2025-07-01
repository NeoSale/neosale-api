import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}
export declare const errorHandler: (error: ApiError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const createError: (message: string, statusCode: number, details?: any) => ApiError;
//# sourceMappingURL=errorHandler.d.ts.map