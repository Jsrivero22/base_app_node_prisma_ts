export class CustomError extends Error {
    private constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly service?: string,
        public readonly method?: string,
        public readonly error?: unknown,
    ) {
        super(message);
    }

    /**
     * 400 (Bad Request): Use it for validation errors or malformed requests.
     */
    static badRequest(message: string, service?: string, method?: string) {
        return new CustomError(400, message, service, method);
    }

    /**
     * 401 (Unauthorized): Use it when the client is not authenticated or their credentials are invalid.
     */
    static unauthorized(message: string, service?: string, method?: string) {
        return new CustomError(401, message, service, method);
    }

    /**
     * 403 (Forbidden): Use it when the client is authenticated but does not have permission to access the resource.
     */
    static forbidden(message: string, service?: string, method?: string) {
        return new CustomError(403, message, service, method);
    }

    /**
     * 404 (Not Found): Use it when the requested resource does not exist.
     */
    static notFound(message: string, service?: string, method?: string) {
        return new CustomError(404, message, service, method);
    }

    /**
     * 409 (Conflict): Use it when there is a conflict with the current state of the resource.
     */
    static conflict(message: string, service?: string, method?: string) {
        return new CustomError(409, message, service, method);
    }

    /**
     * 500 (Internal Server Error): Use it for unexpected errors or server problems.
     */
    static internal(
        message: string,
        service: string,
        method: string,
        error?: unknown,
    ) {
        return new CustomError(500, message, service, method, error);
    }

    /**
     * Custom: To handle any other type of error with custom status codes.
     */
    static custom(
        statusCode: number,
        message: string,
        service: string,
        method: string,
    ) {
        return new CustomError(statusCode, message, service, method);
    }
}
