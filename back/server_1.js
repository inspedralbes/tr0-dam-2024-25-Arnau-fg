const {spawn} = require('child_process');

const ls = spawn("python", ["getWinrateStats.py"]);

let objToSend = {
    correct: false,
    response: ""
};

ls.stdout.on("data", (data) => {

    objToSend.correct = true;
    objToSend.response = data.toString();

});

ls.on("close", (code) => {
    console.log(`Getting stats exited with code ${code}`);
    res.send(JSON.stringify(objToSend));
});