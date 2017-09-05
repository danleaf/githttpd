import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as bodyParser from "body-parser";
import * as pr from "child_process";
import * as fs from "fs";
import {Request, Response} from "express";

let webroot = path.join(process.cwd(), "html");
let reporoot = path.join(process.cwd(), "repo");
let app = express();

app.use(bodyParser.json());
app.use(express.static(webroot));

function service(req:Request, res:Response, repo:string) {
    let service = req.query["service"];
    if(!service) {
        res.sendFile("index.html", { root: webroot });
        return;
    }

    let auth = req.header("authorization");
    if(!auth) {
        res.setHeader("WWW-Authenticate",`Basic realm="Password Required"`);
        res.writeHead(401);
        res.end();
        return;
    }

    let [usr, pwd] = new Buffer(auth.split(" ")[1], 'base64').toString().split(":");
    if(usr != "yedan" || pwd != "123456") {
        res.setHeader("WWW-Authenticate",`Basic realm="Password Required"`);
        res.writeHead(401);
        res.end();
        return;
    }

    let cmd = `git ${service.substring(4)} --stateless-rpc --advertise-refs ${repo}`;
    pr.exec(cmd,(err,stdout,stderr) => {
        if(stderr) {
            console.log('get weather api error:'+ stderr);
            res.sendFile("index.html", { root: webroot });
            return;
        }

        let srvhdr = `# service=${service}\n0000`;
        let out = srvhdr.length.toString(16);
        while(out.length < 4) {
            out = "0" + out;
        }

        res.contentType(`application/x-${service}-advertisement`);
        res.end(out + srvhdr + stdout);
    });
}

function rpc(req:Request, res:Response, repo:string) {
    let gitcmd = req.params["gitcmd"];

    res.contentType(`application/x-git-${gitcmd}-result`);

    let proc = pr.spawn("git", [gitcmd, "--stateless-rpc", repo]);
    req.pipe(proc.stdin);
    proc.stdout.pipe(res);
    let stdout = fs.createWriteStream("okstdout.bin");
    proc.stdout.pipe(stdout);

    if (gitcmd == "receive-pack") {
        pr.exec(`git --git-dir ${repo} update-server-info`);
    }
}

app.get("/:repo/info/refs",(req, res) => {
    console.log(req.url);
    let repo = path.join(reporoot,req.params["repo"]);
    service(req, res, repo);
});

app.get("/:path/:repo/info/refs",(req, res) => {
    console.log(req.url);
    let repo = path.join(path.join(reporoot,req.params["path"]),req.params["repo"]);
    service(req, res, repo);
});

app.get("/:path1/:path2/:repo/info/refs",(req, res) => {
    console.log(req.url);
    let repo = path.join(path.join(path.join(reporoot,req.params["path1"]),req.params["path2"]),req.params["repo"]);
    service(req, res, repo);
});

app.post("/:repo/git-:gitcmd",(req, res) => {
    console.log(req.url);
    let repo = path.join(reporoot,req.params["repo"]);
    rpc(req, res, repo);
});

app.post("/:path/:repo/git-:gitcmd",(req, res) => {
    console.log(req.url);
    let repo = path.join(path.join(reporoot,req.params["path"]),req.params["repo"]);
    rpc(req, res, repo);
});

app.post("/:path1/:path2/:repo/git-:gitcmd",(req, res) => {
    console.log(req.url);
    let repo = path.join(path.join(path.join(reporoot,req.params["path1"]),req.params["path2"]),req.params["repo"]);
    rpc(req, res, repo);
});


app.use(function (req, res) {
    console.log("...");
    console.log(req.url);
    res.sendFile("index.html", { root: webroot });
});

let server = http.createServer(app);
server.listen(8080);

console.log("Server Started OK");



