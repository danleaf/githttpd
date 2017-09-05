import * as crypto from 'crypto';

export enum ErrorCode {
    UNKNOWN_COMMAND = 1,
    NOT_LOGIN,
    AUTHORITY_INSUFFICIENT,
    ACCOUNT_INVALID,
    GIT_ERROR,
    DB_ERROR,
}

export function error(code: number, info: any) {
    return { errcode: code, errinfo: info };
}

export function md5(source: string) {
    return crypto.createHash('md5').update(source).digest('hex');
}

export function createObject(x: Object | Function, args?: any[]): Object {
    var obj: { __proto__: any } = { __proto__: undefined };
    if (x instanceof Function) {
        obj.__proto__ = x.prototype;
        x.apply(obj, args);
    } else {
        obj.__proto__ = x;
        x.constructor.apply(obj, args);
    }

    return obj;
}