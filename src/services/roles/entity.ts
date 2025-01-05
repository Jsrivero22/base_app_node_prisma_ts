export class RoleEntity {
    constructor(
        public id: string,
        public name: string,
        public description?: string | null,
    ) {}

    public static fromObject(object: { [key: string]: any }): RoleEntity {
        const { id, name, description } = object;

        return new RoleEntity(id, name, description);
    }

    public static fromArray(array: { [key: string]: any }[]): RoleEntity[] {
        return array.map(RoleEntity.fromObject);
    }
}
