function home(){ return("~"); }

exports.config = {
    "foo" : { // session name
        cwd: home(), // all your new windows will start here
        windows: [ // the windows will be created in this order, the commands will be run
            { cmd: "ls" },
            { cmd: "vi" },
            { cmd: "cd /bin && ls"}
        ]
    }
}
