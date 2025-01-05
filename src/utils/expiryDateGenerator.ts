export class ExpiryDateGenerator {
    private static toMilliseconds(amount: number, unit: string) {
        const unitsToMilliseconds: {
            [key: string]: number;
        } = {
            seconds: 1000,
            minutes: 60 * 1000,
            hours: 60 * 60 * 1000,
        };
        return (
            amount *
            (unitsToMilliseconds[unit] || unitsToMilliseconds['minutes'])
        );
    }

    static fromSeconds(seconds: number): Date {
        return new Date(Date.now() + this.toMilliseconds(seconds, 'seconds'));
    }

    static fromMinutes(minutes: number): Date {
        return new Date(Date.now() + this.toMilliseconds(minutes, 'minutes'));
    }

    static fromHours(hours: number): Date {
        return new Date(Date.now() + this.toMilliseconds(hours, 'hours'));
    }
}
