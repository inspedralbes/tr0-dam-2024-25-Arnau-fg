const { spawn } = require("child_process");

const ls = spawn("docker", ["run", "--rm", "-i", "python:3.13.0rc3-slim-bookworm", "python3", "./getWinrateStats.py"]);

let objToSend = {
    correct: false,
    response: ""
};

ls.stdout.on("data", (data) => {

    console.log(data.toString());

    objToSend.correct = true;
    objToSend.response = data.toString();

});

ls.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
    objToSend.correct = false;
    objToSend.response = data.toString();
});

ls.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    // res.send(objToSend);
});