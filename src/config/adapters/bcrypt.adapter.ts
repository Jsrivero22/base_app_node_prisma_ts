import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export class EncryptedAdapter {
    static encrypt(value: string): string {
        const salt = genSaltSync(12);
        return hashSync(value, salt);
    }

    static compare(value: string, hash: string): boolean {
        return compareSync(value, hash);
    }
}
