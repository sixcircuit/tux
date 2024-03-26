tux - a tmux library and command line client for node

### REQUIRED EDITS TO SHELL INIT SCRIPTS

we use bashrc, zshrc, etc. to signal to tux that the tmux session is ready to have keys sent to it.
you must put this line at the bottom of your bashrc, zshrc, or whatever shell init scripts you use.

IF YOU DON'T TUX WILL HANG FOREVER. It won't get the signal, it'll never work.

TODO: fix this by making the signal detection async and setting a timeout on it.

```bash
if [[ -n $TMUX_WAIT_FOR ]]; then
   tmux wait-for -S $TMUX_WAIT_FOR
fi
```

## THIS ISN'T UP TO DATE FROM HERE.

**Installation**

Please read the section on global installation.

``` bash
npm install -g node-tux
```

**Global Installation**

You should be installing "globally" to your home directory without sudo:

Run this command: ```npm config set prefix ~/.npm-packages```

Add this to your .bashrc or similar: ```export PATH=$HOME/.npm-packages/bin:$PATH```

this should do it but currently npm doesn't respect the prefix config.
It's fixed in the latest versions, but versions greater than 1.4.9 and less than 1.4.20 (I think) are broken.

If you're on a broken version, when you install global packages run: ```npm install -g --prefix=$(npm config get prefix) <package>```

**Config files**

You need a config file in your home directory for this to work. You can you a simple json format, or you can use a module format.

***.tux.json***

This is the simple config file type, it's in a json format. Put a .tux.json file in your home directory -- there is an example in the repo.
The file name needs to be .tux.json. Don't forget the "." prefix.

Write out the sessions you want to be able to create/attach to in one large hash, with the following format (no exports):

``` javascript
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
```

***.tux.js***

This is the more complicated config file format, you can write whatever code you want so long as you export a  "config" hash. It lets you break out common functionalities, and refactor your config. Put a .tux.js file in your home directory -- there is an example in the repo.
The file name needs to be .tux.js. Don't forget the "." prefix. If you have a .tux.json file as well, the .json file will take precedence.

Write out the sessions you want to be able to create/attach to:

``` javascript
function home(){ return("~"); }

exports.config = {
    "foo" : { // session name
        cwd: home() // all your new windows will start here
        windows: [ // the windows will be created in this order, the commands will be run
            { cmd: "ls" },
            { cmd: "vi" }
            { cmd: "cd /bin && ls"}
        ]
    }
}
```

**Use (it's really easy)**

just run
``` bash
tux <session name>
```

If the session doesn't exist, it will be created as it exists in your config file, and you'll be attached to it.
If it does exist, you'll be attached to it. Maybe emotionally. Definitely from the perspective of your terminal.

Fork, add issues, send pull requests, whatever.

Apache License -- see the LICENSE file in the root of the repo for license information.
