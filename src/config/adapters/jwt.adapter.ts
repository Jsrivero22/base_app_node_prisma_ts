import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { envs } from './envs.adapter';
import { Request } from 'express';
import { CustomError } from 'src/errors/custom.error';

const expire: string = '12h';

export type DraftTokenType = { id: string; status: string; userType?: string };
export type TokenType = {
    id: string;
    status: string;
    userType?: string;
};

export class JWT {
    constructor() {}

    static tokenSign = (
        payload: DraftTokenType,
        expiresIn: string = expire,
    ) => {
        return jwt.sign(
            { ...payload, certificate: envs.CERTIFICATE_TOKEN },
            envs.JWT_SECRET,
            {
                expiresIn,
            },
        );
    };

    static tokenVerify<T>(token: string): T {
        try {
            const tokenVerified = jwt.verify(
                token,
                envs.JWT_SECRET,
            ) as JwtPayload;

            if (typeof tokenVerified !== 'object' || !tokenVerified) {
                throw CustomError.unauthorized(
                    'Invalid token',
                    'JWT',
                    'execute',
                );
            }

            if (
                'certificate' in tokenVerified &&
                tokenVerified.certificate !== envs.CERTIFICATE_TOKEN
            ) {
                throw CustomError.unauthorized(
                    'Invalid token',
                    'JWT',
                    'execute',
                );
            }

            return tokenVerified as T;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw CustomError.unauthorized(
                    'Token has expired',
                    'JWT',
                    'tokenVerify',
                );
            }

            throw CustomError.unauthorized(
                'Invalid token',
                'JWT',
                'tokenVerify',
            );
        }
    }

    // static tokenVerify<T> = (token: string): T => {
    //     try {
    //         const tokenVerified = jwt.verify(
    //             token,
    //             envs.JWT_SECRET,
    //         ) as JwtPayload;

    //         if (typeof tokenVerified !== 'object') {
    //             throw CustomError.unauthorized(
    //                 'Invalid token',
    //                 'JWT',
    //                 'execute',
    //             );
    //         }

    //         if (
    //             tokenVerified.certificate &&
    //             tokenVerified.certificate !== envs.CERTIFICATE_TOKEN
    //         ) {
    //             throw CustomError.unauthorized(
    //                 'Invalid token',
    //                 'JWT',
    //                 'execute',
    //             );
    //         }

    //         return tokenVerified;
    //     } catch {
    //         throw CustomError.unauthorized(
    //             'Invalid token',
    //             'JWT',
    //             'tokenVerify',
    //         );
    //     }
    // };

    // static tokenVerify = (token: string): JwtPayload | null => {
    //     const tokenVerified = jwt.verify(token, envs.JWT_SECRET);
    //     if (!tokenVerified) {
    //         throw CustomError.unauthorized(
    //             'Invalid token',
    //             'JWT',
    //             'tokenVerify',
    //         );
    //     }

    //     return tokenVerified as JwtPayload;
    // };

    static tokenDecode = (token: string) => {
        return jwt.decode(token);
    };

    static tokenGetUserId = (token: string): string => {
        const decoded = JWT.tokenDecode(token) as TokenType;

        return decoded.id;
    };

    static tokenCleanVerify = (req: Request) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw CustomError.unauthorized(
                'Authorization header is missing',
                'JWT',
                'tokenCleanVerify',
            );
        }

        const token = authHeader.split(' ').pop();

        if (!token) {
            throw CustomError.unauthorized(
                'Token is missing',
                'JWT',
                'tokenCleanVerify',
            );
        }

        return JWT.tokenVerify(token);
    };
}
