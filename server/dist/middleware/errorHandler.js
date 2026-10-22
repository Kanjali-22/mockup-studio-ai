"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
function errorHandler(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    // Log error without exposing sensitive data
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${statusCode} ${code}: ${err.message}`;
    if (statusCode >= 500) {
        console.error(logMessage);
    }
    else {
        console.warn(logMessage);
    }
    // Never expose stack traces or internal details to client
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: err.message || 'An unexpected error occurred.',
        },
    });
}
function createError(message, statusCode, code) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}
//# sourceMappingURL=errorHandler.js.map