import {Request, Response} from "express";
import * as pr from "child_process";

export function service(req: Request, res: Response, repo: string) {
    let service = req.query["service"];
    if (!service) {
        res.writeHead(404);
        res.end();
        return;
    }

    let auth = req.header("authorization");
    if (!auth) {
        res.setHeader("WWW-Authenticate", `Basic realm="Password Required"`);
        res.writeHead(401);
        res.end();
        return;
    }

    let [usr, pwd] = new Buffer(auth.split(" ")[1], 'base64').toString().split(":");
    if (usr != "yedan" || pwd != "123456") {
        res.setHeader("WWW-Authenticate", `Basic realm="Password Required"`);
        res.writeHead(401);
        res.end();
        return;
    }

    let cmd = `git ${service.substring(4)} --stateless-rpc --advertise-refs ${repo}`;
    pr.exec(cmd, (err, stdout, stderr) => {
        if (stderr) {
            console.log('get weather api error:' + stderr);
            res.writeHead(404);
            res.end();
            return;
        }

        let srvhdr = `# service=${service}\n0000`;
        let out = srvhdr.length.toString(16);
        while (out.length < 4) {
            out = "0" + out;
        }

        res.contentType(`application/x-${service}-advertisement`);
        res.end(out + srvhdr + stdout);
    });
}

export function rpc(req: Request, res: Response, repo: string) {
    let gitcmd = req.params["gitcmd"];

    res.contentType(`application/x-git-${gitcmd}-result`);

    let proc = pr.spawn("git", [gitcmd, "--stateless-rpc", repo]);
    req.pipe(proc.stdin);
    proc.stdout.pipe(res);

    if (gitcmd == "receive-pack") {
        pr.exec(`git --git-dir ${repo} update-server-info`);
    }
}

export function createRepo(path: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        let cmd = `git init --bare --shared ${path}`;
        pr.exec(cmd, (err) => {
            if (err) {
                console.log(`git command error: ${cmd} : ${err.message}`);
                reject();
            } else {
                resolve();
            }
        });
    });
}
