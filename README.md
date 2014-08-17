tux - a tmux library and command line client for node

It's really easy:

Put a .tux.json file in your home directory -- there is an example in the repo.
The file name needs to be .tux.json. Don't forget the "." prefix.

Write out the sessions you want to be able to create/attach to:

{
    "foo" : { // session name
        cwd: "~/" // all your new windows will start here
        windows: [ // the windows will be created in this order, the commands will be run
            { cmd: "ls" }, 
            { cmd: "vi" }
            { cmd: "cd /bin && ls"}
        ]
    }
}

run "tux <session name>". 

If the session doesn't exist, it will be creted as it exists in your config file, and you'll be attached to it.
If it does exist, you'll be attached to it. Maybe emotionally. Definitely from the perspective of your terminal.

Fork, add issues, send pull requests, whatever.

Apache License -- see the LICENSE file in the root of the repo for license information.
