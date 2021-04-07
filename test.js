var child_process = require("child_process");
child_process.exec('python ./stock/realtime.py 1', function (error, stdout, stderr) {
    console.log(stdout)
});