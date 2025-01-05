import nodemailer from 'nodemailer';
import { CustomError } from 'src/errors/custom.error';

export type Attachment = {
    filename: string;
    path: string;
};

export type MailOptions = {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    attachments?: Attachment[];
};

export type EmailConfigSMTP = {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
};

export type EmailConfigGoogle = {
    service: string;
    user: string;
    password: string;
};

export interface Email {
    sendEmail(mailOptions: MailOptions): Promise<void>;
    sendEmails(mailOptions: MailOptions[]): Promise<void>;
    verify(): Promise<boolean>;
}

export class EmailAdapterSMTP implements Email {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly config: EmailConfigSMTP) {
        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: {
                user: this.config.user,
                pass: this.config.password,
            },
            from: this.config.user,
        });
    }

    async sendEmail(mailOptions: MailOptions): Promise<void> {
        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw CustomError.internal(
                'Error sending email',
                'Email Adapter',
                'sendEmail',
                error,
            );
        }
    }

    async sendEmails(mailOptions: MailOptions[]): Promise<void> {
        await Promise.all(
            mailOptions.map(mailOption => this.sendEmail(mailOption)),
        );
    }

    async verify(): Promise<boolean> {
        return await this.transporter.verify();
    }
}

export class EmailAdapterGoogle implements Email {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly config: EmailConfigGoogle) {
        this.transporter = nodemailer.createTransport({
            service: this.config.service,
            auth: {
                user: this.config.user,
                pass: this.config.password,
            },
        });
    }

    async sendEmail(mailOptions: MailOptions): Promise<void> {
        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw CustomError.internal(
                'Error sending email',
                'Email Adapter',
                'sendEmail',
                error,
            );
        }
    }

    async sendEmails(mailOptions: MailOptions[]): Promise<void> {
        await Promise.all(
            mailOptions.map(mailOption => this.sendEmail(mailOption)),
        );
    }

    async verify(): Promise<boolean> {
        return await this.transporter.verify();
    }
}
