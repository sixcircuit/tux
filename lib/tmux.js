"use strict";

const _ = require('./_.js');
const fs = require('fs');

const lib = module.exports = {};

const tmux = lib.tmux = {};

tmux.run = function(cmd, args){
   return _.spawn("tmux", [cmd, ...args]);
};

const sessions = lib.sessions = {};

sessions.exists = function({ name }){
   const { exit_code } = tmux.run('has-session', ['-t', name]);
   return(exit_code === 0);
};

sessions.attach = function({ name, title }){
   _.shell.title(title);
   _.shell(`tmux attach-session -t ${ name }`);
   _.shell.title("");
};

sessions.create = function({ name, working_dir }){

   if(!fs.existsSync(working_dir)){
      _.fatal("working directory doesn't exist: ", working_dir);
   }

   return tmux.run('new-session', ['-d', '-c', working_dir, '-s', name]);
};

const windows = lib.windows = {};

windows.create = function({ session, window }){
   _.debug("create window: ", session.name, " ", window.number, " ", window.command, " ", session.working_dir);

   if(!sessions.exists(session)){
      _.debug("session doesn't exist: ", session.name);
      _.debug("creating session: ", session.name);
      sessions.create(session);
   }else{
      _.debug("create new window: ", session.name, ":", window.number);
      tmux.run('new-window', ['-t', session.name + ":" + window.number, "-c", session.working_dir]);
   }

   tmux.run('send-keys', [JSON.stringify(window.command), "C-m"]);
};

