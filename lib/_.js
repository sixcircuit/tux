
const _ = module.exports = {};

const spawn_sync = require('child_process').spawnSync;

_.os = require('os');
_.path = require('path');

_.path.expand_tilde = function(path){
   if(path.startsWith('~')){ return _.path.join(_.os.homedir(), path.slice(1)); }
   return(path);
};

const crypto = require('crypto');

_.sid_128 = function(prefix){
   if(prefix){
      return prefix + crypto.randomBytes(16).toString('hex');
   }else{
      return crypto.randomBytes(16).toString('hex');
   }
};

_.is_ary = function(a){ return Array.isArray(a); };

_.exit = process.exit;

_.debug = function(...str){ return _.stderr(...str); }
// _.debug = function(){}

_.stdout = function(...str){ process.stdout.write(str.join("") + "\n"); }
_.stdout.write = function(...str){ process.stdout.write(str.join("")); };

_.stderr = function(...str){ process.stderr.write(str.join("") + "\n"); }
_.stderr.write = function(...str){ process.stdout.write(str.join("")); };

_.each = function(obj, f){
   if(Array.isArray(obj)){
      for(let i = 0; i < obj.length; i++){
         f(obj[i], i);
      }
   }else{
      const keys = _.keys(obj);
      for(let i = 0; i < keys.length; i++){
         const key = keys[i];
         f(obj[key], key);
      }
   }
}

_.undef = function(a){ return(a === undefined) };

_.timeout = function delay(ms) {
   return new Promise(function(resolve) {
      setTimeout(resolve, ms);
   });
};

_.def = function(...args){
   const [ a, b ] = args;
   if(args.length === 0){ return (false); }
   if(args.length === 1){ return (a !== undefined); }
   if(args.length === 2){
      if(a !== undefined){ return(a); }
      else{ return(b); }
   }
};

_.spawn = function(cmd, args){
  const { status, stdout, stderr } = spawn_sync(cmd, args, { shell: "/bin/bash", stdio: [], encoding: "utf8" });
  return({ exit_code: status, stdout: stdout.trim(), stderr: stderr.trim() });
};

_.shell = function(cmd, args){
   return spawn_sync(cmd, args, { shell: "/bin/bash", stdio: [0,1,2], encoding: "utf8" }).status;
};

_.shell.title = function(title){ _.stdout.write(`\x1b]1;${title}\x07`); };

_.error = function(code, ...args){
   const e = new Error(args.join(""));
   e.code = code;
   return(e);
};

_.fatal = function(...args){ throw _.error("fatal", ...args); };
_.exit = process.exit;
_.keys = Object.keys;

_.merge = function(...args){ return Object.assign({}, ...args); };

