import {
    v7 as uuidV7,
    validate as uuidValidate,
    version as uuidVersion,
} from 'uuid';

export class Uuid {
    private v7 = (): string => uuidV7();
    private uuidValidateV7 = (uuid: string): boolean => {
        return uuidValidate(uuid) && [7].includes(uuidVersion(uuid));
    };

    static generate = () => new Uuid().v7();
    static validate = (uuid: string) => new Uuid().uuidValidateV7(uuid);
}
