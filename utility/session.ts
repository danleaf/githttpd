import * as common from './common';
import { ErrorCode } from './common';

let sessions: { [id: string]: { timespan: number } } = {};

(function checkSessionTimeout() {
    setInterval(() => {
        for (var id in sessions) {
            let session = sessions[id];
            session.timespan++;
            if (session.timespan > 3) {
                delete sessions[id];
            }
        }
    }, 12000);
})();

export function createSession(username: string, password: string) {
    var ssid: string;
    do {
        ssid = common.md5(username + password + (Math.random() * 10000));
    } while (sessions[ssid]);
    sessions[ssid] = { timespan: 0 };
    return ssid;
}

export function checkSession(ssid: string) {
    return new Promise((resolve, reject) => {
        if (!ssid)
            return reject(ErrorCode.NOT_LOGIN);

        let session = sessions[ssid];
        if (!session)
            return reject(ErrorCode.NOT_LOGIN);

        session.timespan = 0;
        return resolve();
    });
}