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
