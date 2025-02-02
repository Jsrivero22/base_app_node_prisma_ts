import { Response } from 'express';
import { CustomError } from './custom.error';

export const handleError = (res: Response, error: unknown) => {
    // console.log(error);

    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    return res
        .status(500)
        .json({ error: 'Internal server error, contact the administrator' });
};

export function handleServiceError(
    method: string,
    module: string,
    error: any,
): never {
    if (!(error instanceof CustomError)) {
        throw CustomError.internal(
            `Error in ${method}: ${error.message || error}`,
            module,
            method,
        );
    }

    throw error;
}
