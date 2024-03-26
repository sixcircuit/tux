"use strict";

const _ = require('./_.js');
const fs = require('fs');

const tmux = module.exports = {};

tmux.run = function(cmd, args){
   args = _.def(args, []);
   return _.spawn("tmux", [cmd, ...args]);
};

const window = tmux.window = {};
const session = tmux.session = {};

session.exists = function({ name }){
   const { exit_code } = tmux.run('has-session', ['-t', name]);
   return(exit_code === 0);
};

session.attach = function({ name, title }){
   if(title){ _.shell.title(title); }
   _.shell(`tmux attach-session -t ${ name }`);
   if(title){ _.shell.title(""); }
};

session.create = async function({ session }){
   const { name, dir, windows } = session;

   if(!fs.existsSync(dir)){
      _.fatal("working directory doesn't exist: ", dir);
   }

   // set-option -g default-command "reattach-to-user-namespace -l zsh"
   // set first window command in new window wait for (sleep 0.1) tmux wait-for <unique-var>

   function start_zsh_cmd(window){
      // return(`reattach-to-user-namespace -l start_zsh_with_tmux_wait_for_id "${window.wait_id}"`)
      return(`reattach-to-user-namespace -l zsh`)

   }

   const rows = process.stdout.rows;
   const cols = process.stdout.columns;

   for(let i = 0; i < windows.length; i++){

      const window = windows[i];

      // wind.
      window.index = (i-0);
      window.name = (window.name || window.index);
      window.wait_id = _.sid_128("tmux_wait");

      _.debug("creating windows: " + i);
      if(window.index === 0){
         _.debug("first window. creating session with working dir: " + dir);

         tmux.run('new-session', ['-d', '-y', rows, '-x', cols, '-c', dir, "-e", `"TMUX_WAIT_FOR=${window.wait_id}"`, '-s', session.name, start_zsh_cmd(window)]);
      }else{
         tmux.run('new-window', ['-aP', "-c", dir, "-e", `"TMUX_WAIT_FOR=${window.wait_id}"`, '-t', session.name, start_zsh_cmd(window)]);
      }

      _.debug("waiting for: ", window.wait_id);
      tmux.run('wait-for', [window.wait_id]);

      await _.timeout(10);

      if(window.layout){
         tmux.layout({ target: "=" + session.name + ":" + window.index });
      }

      const run_cmd = JSON.stringify(window.run);
      _.debug(`sending command: ${run_cmd}`);
      tmux.run('send-keys', ["-t", session.name, run_cmd, "C-m"]);

   }
};


tmux.layout = function({ name, target }){
   // layout "name" is unused.

   if(!target){ target = "" }
   else if(target[target.length-1] !== "."){ target = target + "."; }

   // tmux.run("split-window", ["-h"]);
   // tmux.run("rotate-window");

   // tmux.run("select-window", ["-t", "=" + session.name + ":0"]);
   // tmux.run("resize-pane", ["-t", "=" + session.name + ":0.1", "-x", "20"]);
   // tmux.run("resize-pane", ["-t", "=" + session.name + ":0.0", "-x", "20"]);
   // tmux.run("resize-pane", ["-t", "=" + session.name + ":1.0", "-x", "20"]);
   // tmux.run("resize-pane", ["-t", "=" + session.name + ":=.1", "-x", "20"]);
   // tmux.run("resize-pane", ["-t", "=" + session.name, "-x", "20"]);

   // tmux.run("split-window", ["-h"]);
   // // tmux.run("resize-pane", ["-t", session.name + ":0.0", "-x", "20"]);
   // tmux.run("resize-pane", ["-t", session.name, "-x", "20"]);

   // tmux.run('send-keys', ["-t", session.name + ":0.0", run, "C-m"]);

   function mk_target(suffix){ return(target + suffix); }

   const get_pane_count = function(){
      const { stdout } = tmux.run("display-message", ["-p", '"#{window_panes}"']);
      return parseInt(stdout, 10);
   };

   const get_column_count = function(){
      const { stdout } = tmux.run("display-message", ["-p", '"#{window_width}"']);
      return parseInt(stdout, 10);
   };

   const panes = get_pane_count();
   const col_count = get_column_count();

   _.debug("panes: ", panes);
   _.debug("col_count: ", col_count);

   const first_split_small = 50;
   const second_split_small = 85;
   const first_split_big = 82;

   if(col_count < 250) {
      if(panes === 1){
         tmux.run("split-window", ["-h -b"]);
         tmux.run("select-pane", ["-t", mk_target("1")]);
         tmux.run("resize-pane", ["-t", mk_target("0"), "-x", first_split_small]);
      }else if(panes === 2){
         tmux.run("resize-pane", ["-t", mk_target("0"), "-x", first_split_small]);
      }else if(panes === 3){
         tmux.run("resize-pane", ["-t", mk_target("0"), "-x", first_split_small]);
         tmux.run("resize-pane", ["-t", mk_target("1"), "-x", second_split_small]);
      }else{
         tmux.run("select-layout", ["even-horizontal"]);
      }
   }else{
      if(panes === 1){
         tmux.run("split-window", ["-h -b"]);
         tmux.run("select-pane", ["-t", mk_target("1")]);
         tmux.run("split-window", ["-h -b"]);
         tmux.run("select-layout", ["even-horizontal"]);
      }else if(panes === 2){
         tmux.run("resize-pane", ["-t", mk_target("0"), "-x", first_split_big]);
      }else if(panes === 3){
         tmux.run("select-layout", ["even-horizontal"]);
      }else{
         tmux.run("select-layout", ["even-horizontal"]);
      }
   }
};

