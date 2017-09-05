import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as bodyParser from "body-parser";
import * as git from "./lib/git";
import * as route from "./utility/route";
import {config} from "./config";

require('./controllers/home');

/*mongoose.connect('mongodb://127.0.0.1/welding', (err) => {
    if (err) throw err;
    console.log('connect to welding db');
});*/

let webroot = path.join(process.cwd(), "./webapp");
let reporoot = config["ReposRoot"] || path.join(process.cwd(), "repos");

console.log(`The root of repos is ${reporoot}`);

let app = express();

app.use(bodyParser.json());
app.use(express.static(webroot));

for (let i = 1; i <= 10; i++) {
    ((n: number) => {
        let repo = "";
        for (let i = 0; i < n; i++) {
            repo += "/:repo" + i;
        }

        app.get(repo + "/info/refs", (req, res) => {
            console.log(req.url);
            let repo = reporoot;
            for (let i = 0; i < n; i++) {
                repo = path.join(repo, req.params["repo" + i]);
            }
            git.service(req, res, repo);
        });

        app.post(repo + "/git-:gitcmd", (req, res) => {
            console.log(req.url);
            let repo = reporoot;
            for (let i = 0; i < n; i++) {
                repo = path.join(repo, req.params["repo" + i]);
            }
            git.rpc(req, res, repo);
        });
    })(i);
}

app.use("/*.cmd", route.dispatch);

app.use(function (req, res) {
    console.log(`No Handler for URL ${req.url}`);
    res.sendFile("index.html", {root: webroot});
});

let server = http.createServer(app);
server.listen(8080);

console.log("Server Started OK");



