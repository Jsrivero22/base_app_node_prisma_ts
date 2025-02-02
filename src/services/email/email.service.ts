import fs from 'fs';
import path from 'path';
import { Email, MailOptions } from 'src/config/adapters/emails.adapter';
import { envs } from 'src/config/adapters/envs.adapter';
import { CustomError } from 'src/errors/custom.error';

export class EmailService {
    constructor(private readonly emailAdapter: Email) {}

    async validationToken(token: string, userEmail: string): Promise<void> {
        const html = await this.loadTemplate('emailValidation.html', {
            link: `${envs.WEB_SERVICE_URL}/auth/validate-email?token=${token}`,
        });

        await this.sendEmail({
            to: userEmail,
            subject: 'Welcome to Our Service!',
            text: '',
            html,
        });
    }

    async sendPasswordResetEmail(
        token: string,
        userEmail: string,
    ): Promise<void> {
        const html = await this.loadTemplate('passwordReset.html', {
            link: `${envs.WEB_SERVICE_URL}/auth/reset-password?token=${token}`,
        });

        await this.sendEmail({
            to: userEmail,
            subject: 'Password Reset Request',
            text: '',
            html,
        });
    }

    async sendEmail(mailOptions: MailOptions): Promise<void> {
        if (!mailOptions.text.trim() && !mailOptions.html.trim()) {
            throw CustomError.badRequest(
                'You must provide either text or html content',
            );
        }

        await this.emailAdapter.sendEmail(mailOptions).catch(error => {
            throw CustomError.internal(
                'Error sending email',
                'Email Service',
                'sendEmail',
                error,
            );
        });
    }

    async sendEmails(mailOptions: MailOptions[]): Promise<void> {
        this.emailAdapter.sendEmails(mailOptions).catch(() => {
            throw CustomError.internal(
                'Error sending email',
                'Email Service',
                'sendEmails',
            );
        });
    }

    private async loadTemplate(
        templateName: string,
        data: Record<string, string>,
    ): Promise<string> {
        const templatePath = path.join(
            __dirname,
            '../../',
            'templates',
            templateName,
        );

        let template = await fs.promises.readFile(templatePath, 'utf8');

        for (const key in data) {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g'); // Create a regex
            template = template.replace(regex, data[key]);
        }

        return template;
    }

    async verify(): Promise<boolean> {
        return this.emailAdapter.verify();
    }
}
