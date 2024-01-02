"use strict";

const _ = require('./_.js');

const lib = module.exports = {};

const tmux = lib.tmux = {};

tmux.shell = function(cmd, args){
   return _.shell("tmux", [cmd, ...args]);
};

tmux.run = function(cmd, args){
   return _.spawn("tmux", [cmd, ...args]);
};

const sessions = lib.sessions = {};

sessions.exists = function({ session_name }){
   const { exit_code } = tmux.run('has-session', ['-t', session_name]);
   return(exit_code === 0);
};

sessions.attach = function({ session_name }){
   return tmux.shell('attach-session', ['-t', session_name]);
};

sessions.create = function({ session_name, working_dir }){
   return tmux.run('new-session', ['-d', '-c', working_dir, '-s', session_name]);
};

const windows = lib.windows = {};

windows.create = function({ session_name, number, command, working_dir }){
   _.stdout.line("create window: ", session_name, " ", number, " ", command, " ", working_dir);
   if(!sessions.exists({ session_name })){
      _.stdout.line("session doesn't exist: ", session_name);
      _.stdout.line("creating session: ", session_name);
      sessions.create({ session_name, working_dir });
   }else{
      _.stdout.line("create new window: ", session_name, ":", number);
      tmux.run('new-window', ['-t', session_name + ":" + number, "-c", working_dir]);
   }

   tmux.run('send-keys', [JSON.stringify(command), "C-m"]);
   // await{ this.tmux.run('send-keys', ['-t', session_name + ":" + number, _.stringify(command), "C-m"], _.plumb(defer(), cb)); } 
   // await{ this.tmux.run('send-keys', ['-t', session_name + ":" + number, _.stringify(command), "C-m"], _.plumb(defer(), cb)); } 

};

