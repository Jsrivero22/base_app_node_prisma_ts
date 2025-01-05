import { UserType } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import {
    body,
    CustomValidator,
    header,
    param,
    ValidationChain,
    validationResult,
} from 'express-validator';
import { JWT, Uuid } from 'src/config/adapters';
import { CustomError } from 'src/errors/custom.error';

export const validateUUID = (
    location: 'param' | 'body',
    field: string = 'id',
): ValidationChain => {
    const validator = location === 'param' ? param : body;

    return validator(field)
        .exists()
        .withMessage('ID is required')
        .bail()
        .notEmpty()
        .withMessage('ID cannot be empty')
        .bail()
        .isUUID()
        .withMessage(`${field} must be a valid UUID`)
        .bail()
        .custom((value: string) => {
            const validated = Uuid.validate(value);
            if (!validated) {
                throw new Error(`${field} must be a valid UUID`);
            }

            return true;
        });
};

export const validateRootUser: CustomValidator = (value: string, { req }) => {
    if (value === UserType.ROOT) {
        const authHeader = req.headers?.authorization;

        if (!authHeader) throw new Error('Authorization header is missing');

        const { userType } = authHeader.split(' ').pop();

        if (!userType || userType !== UserType.ROOT) {
            throw new Error('Only root users can create other root users');
        }

        req.body.userType = UserType.ROOT;
    }

    return true;
};

export const validateEmail = (): ValidationChain => {
    return body('email')
        .exists()
        .withMessage(`Email is required`)
        .bail()
        .notEmpty()
        .withMessage(`Email cannot be empty`)
        .bail()
        .isEmail()
        .withMessage(`Email must be a valid email`)
        .bail()
        .normalizeEmail()
        .toLowerCase()
        .trim()
        .escape();
};

export const validateAuthHeader = (): ValidationChain => {
    return header('authorization')
        .isEmpty()
        .withMessage('Authorization header is missing')
        .exists()
        .withMessage('Authorization header is required')
        .bail()
        .matches(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
        .withMessage('Invalid Authorization format. Expected Bearer token')
        .bail()
        .custom((value: string) => {
            const token = value.split(' ').pop();

            if (!token) {
                throw CustomError.unauthorized(
                    'Token is missing',
                    'JWT',
                    'validateAuthHeader',
                );
            }

            try {
                JWT.tokenVerify(token);
                return true;
            } catch (error) {
                throw CustomError.unauthorized(
                    `Invalid token: ${error}`,
                    'JWT',
                    'validateAuthHeader',
                );
            }
        });
};

export const validateResult = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const errors = validationResult(req);

        if (errors.isEmpty()) return next();

        const errorMessages: { [key: string]: string } = {};
        errors.array().forEach((error: any) => {
            if (!errorMessages[error.path]) {
                errorMessages[error.path] = error.msg;
            }
        });

        const errorsArray = Object.keys(errorMessages).map(key => ({
            field: key,
            message: errorMessages[key],
        }));

        return res.status(400).json({ errors: errorsArray });

        /**
         * This is an alternative way to group errors by field
         */
        // const groupedErrors = errors.array().reduce((acc: { [key: string]: string[] }, error: any) => {

        //     if (!acc[error.path]) {
        //         acc[error.path] = [];
        //     }
        //     acc[error.path].push(error.msg);
        //     return acc;
        // }, {});

        // return res.status(400).json({ errors: groupedErrors });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
};
