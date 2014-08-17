tux - a tmux library and command line client for node

**Installation**

Please read the section on global installation.

```
npm install -g node-tux 
```


**Global Installation**

You should be installing "globally" to your home directory without sudo:

Run this command: ```npm config set prefix ~/.npm-packages```

Add this to your .bashrc or similar: ```export PATH=$HOME/.npm-packages/bin:$PATH```

this should do it but currently npm doesn't respect the prefix config. 
It's fixed in the latest versions, but versions greater than 1.4.9 and less than 1.4.20 (I think) are broken.

If you're on a broken version, when you install global packages run: ```npm install -g --prefix=$(npm config get prefix) <package>```



**Use (it's really easy)**

Put a .tux.json file in your home directory -- there is an example in the repo.
The file name needs to be .tux.json. Don't forget the "." prefix.

Write out the sessions you want to be able to create/attach to:

```
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

then run 
```
tux <session name>
```

If the session doesn't exist, it will be created as it exists in your config file, and you'll be attached to it.
If it does exist, you'll be attached to it. Maybe emotionally. Definitely from the perspective of your terminal.

Fork, add issues, send pull requests, whatever.

Apache License -- see the LICENSE file in the root of the repo for license information.
