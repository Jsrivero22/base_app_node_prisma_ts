import { body } from 'express-validator';
import { CustomError } from 'src/errors/custom.error';
import {
    validateResult,
    validateUUID,
} from 'src/middlewares/validationsMiddleware';

export class RolesValidators {
    static getID = [validateUUID('param', 'id'), validateResult];

    static create = [
        body('name')
            .exists()
            .withMessage('Name is required')
            .isString()
            .withMessage('Name must be a string')
            .bail()
            .isLength({ min: 3, max: 50 })
            .withMessage('Name must be between 3 and 50 characters')
            .bail()
            .matches(/^[A-Za-z\s]+$/)
            .withMessage('Name must contain only letters and spaces')
            .bail()
            .escape()
            .trim()
            .toUpperCase(),

        body('description')
            .exists()
            .withMessage('Description is required')
            .isString()
            .bail()
            .withMessage('Description must be a string')
            .bail()
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters')
            .bail()
            .escape()
            .trim()
            .toLowerCase(),

        validateResult,
    ];

    static update = [
        validateUUID('param', 'id'),

        body().custom(value => {
            if (Object.keys(value).length === 0) {
                throw CustomError.badRequest(
                    'At least one field must be provided for update',
                    'Validation Error Roles Update',
                    'static update',
                );
            }

            const allowedFields = ['name', 'description'];
            const invalidFields = Object.keys(value).filter(
                field => !allowedFields.includes(field),
            );

            if (invalidFields.length > 0) {
                throw CustomError.badRequest(
                    `Invalid fields provided: ${invalidFields.join(', ')}`,
                    'Validation Error Roles Update',
                    'static update',
                );
            }

            return true;
        }),

        body('name')
            .optional()
            .notEmpty()
            .withMessage('Name is empty')
            .bail()
            .isString()
            .withMessage('Name must be a string')
            .bail()
            .isLength({ min: 3, max: 50 })
            .withMessage('Name must be between 3 and 50 characters')
            .bail()
            .matches(/^[A-Za-z\s]+$/)
            .withMessage('Name must contain only letters and spaces')
            .bail()
            .escape()
            .trim()
            .toUpperCase(),

        body('description')
            .optional()
            .notEmpty()
            .withMessage('Description is empty')
            .bail()
            .isString()
            .withMessage('Description must be a string')
            .bail()
            .isLength({ min: 10 })
            .withMessage('Description must be at least 10 characters')
            .bail()
            .escape()
            .trim()
            .toLowerCase(),

        validateResult,
    ];

    static delete = [validateUUID('param', 'id'), validateResult];
}
