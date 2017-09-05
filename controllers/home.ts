import {Controller} from "../utility/route";
import {ErrorCode, error} from "../utility/common";
import * as session from "../utility/session";
import {userModel} from "../models/user";
import {config} from "../config";
import * as git from "../lib/git";

@Controller
export class HomeController {

    asCreateRepo(repo: { path: string }): Promise<any> {
        let path = `${config.ReposRoot}/${repo.path}`;
        if(!path.endsWith(".git"))
            path = path + ".git";
        return git.createRepo(path).then(() => {
            return Promise.resolve({path});
        }).catch(() => {
            return Promise.reject(ErrorCode.GIT_ERROR);
        });
    }

    asLogin(usr: { username: string, password: string }): Promise<any> {
        if (!usr || !usr.username || !usr.password) {
            return Promise.reject(ErrorCode.ACCOUNT_INVALID);
        }

        return new Promise((resolve, reject) => {
            if (usr.username == 'admin' && usr.password == 'admin') {
                resolve({ssid: session.createSession(usr.username, usr.password)});
            }
            else {
                reject(ErrorCode.ACCOUNT_INVALID);
            }
        });

        /*return new Promise((resolve, reject) => {
            userModel.findOne({ username: usr.username }, (err, doc) => {
                if (err) return reject(err);
                if (!doc || doc.password !== usr.password)
                    reject(ErrorCode.ACCOUNT_INVALID);
                else
                    resolve({ ssid: session.createSession(usr.username, usr.password) });
            });
        });*/
    }

    asSignup(usr: { username: string, password: string }): Promise<any> {
        let newusr = new userModel({
            username: usr.username,
            password: usr.password
        });
        newusr.encode();
        return new Promise((resolve, reject) => {
            newusr.save((err) => {
                if (err)
                    reject(error(ErrorCode.DB_ERROR, err));
                else
                    resolve();
            }).then();
        });
    }

    asChecksession(ss: { ssid: string }): Promise<any> {
        return session.checkSession(ss.ssid);
    }

    asAbout(): Promise<any> {
        return Promise.resolve({info: "Welding Management System V0.01"});
    }
}