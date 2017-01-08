declare namespace Cursor {
    export type Path = Array<string | number>;
    export interface Provider<T> {
        target:any;
        path:Path;
        set(propName: string, value: any): T;
        get(propName: string): any;
        newCursor<K>(path?: Path): Provider<K>
    }
}