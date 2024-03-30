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

session.exists = function({ key }){
   const { exit_code } = tmux.run('has-session', [`-t=${key}`]);
   return(exit_code === 0);
};

session.attach = function({ key, title }){
   if(title){ _.shell.title(title); }
   _.shell(`tmux attach-session -t=${ key }`);
   if(title){ _.shell.title(""); }
};

tmux.start_zsh = async function(cmd, args, delay_ms){
   args = args || [];
   delay_ms = delay_ms || 25;

   const wait_id = _.sid_128("tmux_wait_");

   const zsh_cmd = `reattach-to-user-namespace -l zsh`;

   args = args.concat(["-e", `"TMUX_WAIT_FOR=${wait_id}"`, zsh_cmd]);

   const ret = tmux.run(cmd, args)

   _.debug("waiting for: ", wait_id);
   tmux.run('wait-for', [wait_id]);

   await _.timeout(delay_ms);
}

session.create = async function({ session }){

   if(!fs.existsSync(session.dir)){
      _.fatal("working directory doesn't exist: ", session.dir);
   }

   // set-option -g default-command "reattach-to-user-namespace -l zsh"
   // set first window command in new window wait for (sleep 0.1) tmux wait-for <unique-var>

   const rows = process.stdout.rows;
   const cols = process.stdout.columns;

   for(let i = 0; i < session.windows.length; i++){

      const window = session.windows[i];

      // wind.
      window.index = (i-0);
      window.name = (window.name || window.index);

      _.debug("creating windows: " + i);
      if(window.index === 0){
         _.debug("first window. creating session with working dir: " + session.dir);
         // tmux.run('new-session', ['-d', '-y', rows, '-x', cols, '-c', session.dir, '-s', session.key, "-e", `"TMUX_WAIT_FOR=${wait_id}"`, start_zsh_cmd(window)]);
         await tmux.start_zsh('new-session', ['-d', '-y', rows, '-x', cols, '-c', session.dir, '-s', session.key]);
      }else{
         // tmux.run('new-window', ['-aP', "-c", session.dir, `-t=${session.key}`, "-e", `"TMUX_WAIT_FOR=${wait_id}"`, start_zsh_cmd(window)]);
         await tmux.start_zsh('new-window', ['-aP', "-c", session.dir, `-t=${session.key}`]);
      }

      let pane_no = 0;

      if(window.layout){
         await tmux.layout({ target: `${session.key}:${window.index}` });
         pane_no = 1;
      }

      const run_cmd = JSON.stringify(window.run);
      _.debug(`sending command: ${run_cmd}`);
      tmux.run('send-keys', [`-t=${session.key}:${window.index}.${pane_no}`, run_cmd, "C-m"]);

   }
};


tmux.layout = async function({ target }){

   if(!target){ target = "" }
   else if(target[target.length-1] !== "."){ target = target + "."; }

   // tmux.run("split-window", ["-h"]);
   // tmux.run("rotate-window");

   // tmux.run("select-window", ["-t=" + session.name + ":0"]);
   // tmux.run("resize-pane", ["-t=" + session.name + ":0.1", "-x", "20"]);
   // tmux.run("resize-pane", ["-t=" + session.name + ":0.0", "-x", "20"]);
   // tmux.run("resize-pane", ["-t=" + session.name + ":1.0", "-x", "20"]);
   // tmux.run("resize-pane", ["-t=" + session.name + ":=.1", "-x", "20"]);
   // tmux.run("resize-pane", ["-t=" + session.name, "-x", "20"]);

   // tmux.run("split-window", ["-h"]);
   // // tmux.run("resize-pane", ["-t", session.name + ":0.0", "-x", "20"]);
   // tmux.run("resize-pane", ["-t", session.name, "-x", "20"]);

   // tmux.run('send-keys', ["-t", session.name + ":0.0", run, "C-m"]);

   function mk_target(suffix){ return(target + (suffix || "")); }

   const get_pane_count = function(){
      const { stdout } = tmux.run("display-message", ["-t", mk_target(), "-p", '"#{window_panes}"']);
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

   const small_is_less_than = 250;

   const small = [50, 85];
   const big = [82];

   if(col_count < small_is_less_than){
      if(panes === 1){
         await tmux.start_zsh("split-window", [`-t=${mk_target("0")}`, "-h", "-b", "-l", small[0]]);
         tmux.run("select-pane", [`-t=${mk_target("1")}`]);
      }else if(panes === 2){
         tmux.run("resize-pane", [`-t=${mk_target("0")}`, "-x", small[0]]);
      }else if(panes === 3){
         tmux.run("resize-pane", [`-t=${mk_target("0")}`, "-x", small[0]]);
         tmux.run("resize-pane", [`-t=${mk_target("1")}`, "-x", small[1]]);
      }else{
         tmux.run("select-layout", ["even-horizontal"]);
      }
   }else{
      if(panes === 1){
         let col_count_minus_separators = (col_count - 2);
         await tmux.start_zsh("split-window", [`-t=${mk_target("0")}`, "-h -b -l", Math.floor(col_count_minus_separators / 3)]);
         await tmux.start_zsh("split-window", [`-t=${mk_target("1")}`, "-h -l", Math.ceil(col_count_minus_separators / 3)]);
         tmux.run("select-pane", [`-t=${mk_target("1")}`]);
         // tmux.run("select-layout", ["even-horizontal"]);
      }else if(panes === 2){
         tmux.run("resize-pane", [`-t=${mk_target("0")}`, "-x", big[0]]);
      }else if(panes === 3){
         tmux.run("select-layout", ["even-horizontal"]);
      }else{
         tmux.run("select-layout", ["even-horizontal"]);
      }
   }
};

