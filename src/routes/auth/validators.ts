import { body, query, ValidationChain } from 'express-validator';
import { JWT } from 'src/config/adapters';
import {
    validateAuthHeader,
    validateEmail,
    validateResult,
    validateUUID,
} from 'src/middlewares/validationsMiddleware';

const validateNameField = (fieldName: string): ValidationChain => {
    return body(fieldName)
        .exists()
        .withMessage(`${fieldName} is required`)
        .notEmpty()
        .withMessage(`${fieldName} cannot be empty`)
        .isString()
        .withMessage(`${fieldName} must be a string`)
        .isLength({ min: 3, max: 50 })
        .withMessage(`${fieldName} must be between 3 and 50 characters`)
        .matches(/^[A-Za-z\s]+$/)
        .withMessage(`${fieldName} must contain only letters`)
        .toLowerCase()
        .trim()
        .escape();
};

const validatePassword = (): ValidationChain => {
    return body('password')
        .exists()
        .withMessage('Password is required')
        .bail()
        .notEmpty()
        .withMessage('Password cannot be empty')
        .bail()
        .isString()
        .withMessage('Password must be a string')
        .bail()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[\W_]/)
        .withMessage('Password must contain at least one symbol')
        .trim();
};

export class AuthValidators {
    static getID = [validateUUID('param', 'id'), validateResult];

    static register = [
        validateNameField('name'),
        validateNameField('lastName'),
        validateEmail(),
        validatePassword(),

        body('confirmPassword')
            .exists()
            .withMessage('Confirm password is required')
            .bail()
            .notEmpty()
            .withMessage('Confirm password cannot be empty')
            .bail()
            .custom((value, { req }) => {
                if (value === req.body.password) return true;

                throw new Error('Passwords do not match');
            }),

        validateResult,
    ];

    static login = [validateEmail(), validatePassword(), validateResult];

    static update = [validateUUID('param', 'id'), validateResult];

    static delete = [validateUUID('param', 'id'), validateResult];

    static validateToken = [
        query('token')
            .exists()
            .withMessage('Token is required')
            .bail()
            .notEmpty()
            .withMessage('Token cannot be empty')
            .bail()
            .isString()
            .withMessage('Token must be a string')
            .bail(),

        validateResult,
    ];

    static validateResendEmailToken = [validateEmail(), validateResult];

    static validateChangePassword = [
        validateEmail(),
        validatePassword(),

        body('confirmPassword')
            .exists()
            .withMessage('confirmPassword is required')
            .bail()
            .notEmpty()
            .withMessage('confirmPassword cannot be empty')
            .bail(),

        body('password')
            .exists()
            .withMessage('Password is required')
            .bail()
            .notEmpty()
            .withMessage('Password cannot be empty')
            .bail()
            .custom((value, { req }) => {
                if (value === req.body.confirmPassword) return true;

                throw new Error('The passwords do not match');
            }),

        body('token')
            .exists()
            .withMessage('Token is required')
            .bail()
            .notEmpty()
            .withMessage('Token cannot be empty')
            .bail()
            .isString()
            .withMessage('Token must be a string')
            .bail()
            .custom((value: string) => {
                if (JWT.tokenVerify(value)) return true;

                throw new Error('Invalid token');
            }),

        validateResult,
    ];

    static logout = [validateAuthHeader(), validateResult];
}
