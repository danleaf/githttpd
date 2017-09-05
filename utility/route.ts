/**
 * Created by Administrator on 2017/1/24.
 */

import * as express from "express";
import * as session from "./session";
import * as common from "./common";


interface HandlerDict {
    [index: string]: (req: any) => Promise<any>;
}

let handlers: HandlerDict = {};
let handlersWithoutLogin: HandlerDict = {};

export function dispatch(req: express.Request, res: express.Response): void {

    let path = req.baseUrl.toLowerCase();
    let handler = handlersWithoutLogin[path];

    let resolve = (ret: any) => {
        ret = ret || {};
        res.json(ret);
    };

    let reject = (err: any) => {
        if (!err) throw Error('error without infomation');
        console.log(err);
        if (typeof err === 'number') {
            if (err === common.ErrorCode.NOT_LOGIN)
                err = { needlogin: true };
            else
                err = common.error(err, '');
        }
        res.json(err);
    };

    if (handler) {
        handler(req.query).then(resolve).catch(reject);
        return;
    }

    handler = handlers[path];
    if (!handler) {
        res.json({ resultcode: common.ErrorCode.UNKNOWN_COMMAND });
        return;
    }

    session.checkSession(req.query.ssid)
        .then(() => handler(req.query)).then(resolve).catch(reject);
}

/*
let controllers: ControllerDict = {};
function getController(target: Object) {
    let ctrlname = target.constructor.name;
    let ctrl = controllers[ctrlname];
    if (!ctrl) {
        ctrl = Object.create(target);
        controllers[ctrlname] = ctrl;
    }

    return ctrl;
}

//定义修饰器，注册指定路径的处理方法（在未登录状态不处理请求，提示登录）
export function On(path: string) {
    return function (target: Object, key: string) {
        let controller = getController(target);
        handlers[path] = (<any>target)[key].bind(controller);
    }
}

//定义修饰器，注册指定路径的处理方法（在未登录状态也处理请求）
export function OnWithoutLogin(path: string) {
    return function (target: Object, key: string) {
        let controller = getController(target);
        handlersWithoutLogin[path] = (<any>target)[key].bind(controller);
    }
}*/

//定义修饰器，注册控制器类
export function Controller(clazz: Function) {
    let prototype = clazz.prototype
    let ctrl = common.createObject(clazz);
    for (let key in prototype) {
        if (key.length > 2 && key[2].toUpperCase() === key[2]) {
            let st = key.substring(0, 2);
            let path = `/${key.substring(2).toLowerCase()}.cmd`;
            if (st === 'on') {
                handlers[path] = prototype[key].bind(ctrl);
            }
            else if (st === 'as') {
                handlersWithoutLogin[path] = prototype[key].bind(ctrl);
            }
        }
    }
}