import { Response } from 'express';

export class Success {
    constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly data?: any,
    ) {}

    static ok(message: string, data?: any) {
        return new Success(200, message, data);
    }

    static created(message: string, data?: any) {
        return new Success(201, message, data);
    }

    static accepted(message: string, data?: any) {
        return new Success(202, message, data);
    }

    static noContent() {
        return new Success(204, 'Deleted');
    }

    send(res: Response): Response {
        return res.status(this.statusCode).json({
            status: 'success',
            message: this.message,
            data: this.data || null,
        });
    }
}
