import { UserType } from '@prisma/client';
import { body, ValidationChain } from 'express-validator';
import { Uuid } from 'src/config/adapters/uuid.adapter';
import {
    validateEmail,
    validateResult,
    validateRootUser,
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

export class UsersValidators {
    static getID = [validateUUID('param', 'id'), validateResult];

    static create = [
        validateNameField('name'),
        validateNameField('lastName'),
        validateEmail(),
        validatePassword(),
        body('roles')
            .isArray()
            .withMessage('Roles must be an array')
            .bail()
            .notEmpty()
            .withMessage('Roles cannot be empty')
            .bail()
            .custom(value => {
                value.forEach((role: string) => {
                    const validated = Uuid.validate(role);
                    if (!validated) {
                        throw new Error(
                            'Roles must be an array of valid UUIDs',
                        );
                    }
                });

                return true;
            }),

        body('confirmPassword')
            .exists()
            .withMessage('Confirm password is required')
            .bail()
            .notEmpty()
            .withMessage('Confirm password cannot be empty')
            .bail()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }

                return true;
            }),

        body('userType')
            .optional()
            .isString()
            .withMessage('User type must be a string')
            .bail()
            .isIn([UserType])
            .withMessage(`User type must be one of ${UserType}`)
            .customSanitizer(value => value.toUpperCase())
            .custom(validateRootUser),

        validateResult,
    ];

    static update = [validateUUID('param', 'id'), validateResult];

    static delete = [validateUUID('param', 'id'), validateResult];
}
