import dotenv from 'dotenv';

import env from 'env-var';

dotenv.config();

export const envs = {
    PORT: env.get('PORT').default('3000').required().asPortNumber(),
    PUBLIC_PATH: env.get('PUBLIC_PATH').required().asString(),

    JWT_SECRET: env.get('JWT_SECRET').required().asString(),
    CERTIFICATE_TOKEN: env.get('JWT_SECRET').required().asString(),

    POSTGRES_USER: env.get('POSTGRES_USER').required().asString(),
    POSTGRES_PASSWORD: env.get('POSTGRES_PASSWORD').required().asString(),
    POSTGRES_DATABASE: env.get('POSTGRES_DATABASE').required().asString(),
    POSTGRES_PORT: env.get('POSTGRES_PORT').required().asPortNumber(),
    POSTGRES_URL: env.get('POSTGRES_URL').required().asString(),

    SEND_EMAIL: env.get('SEND_EMAIL').required().asBool(),
    MAIL_SERVICE: env.get('MAIL_SERVICE').required().asString(),
    MAILER_SECRET_KEY: env.get('MAILER_SECRET_KEY').required().asString(),

    SMTP_USER: env.get('SMTP_USER').asString(),
    SMTP_PASS: env.get('SMTP_PASS').asString(),
    SMTP_HOST: env.get('SMTP_HOST').required().asString(),
    SMTP_PORT: env.get('SMTP_PORT').required().asPortNumber(),
    SMTP_SECURE: env.get('SMTP_SECURE').required().asBool(),
    SENDER_EMAIL: env.get('SENDER_EMAIL').required().asString(),
    REPLY_TO: env.get('REPLY_TO').required().asString(),

    GOOGLE_CLIENT_ID: env.get('GOOGLE_CLIENT_ID').required().asString(),
    GOOGLE_SECRET_ID: env.get('GOOGLE_SECRET_ID').required().asString(),

    WEB_SERVICE_URL: env.get('WEB_SERVICE_URL').required().asString(),
};
