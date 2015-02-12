
var redUtil = function(node, config) {
    this.node = node;
    this.config = config;

    this.node.status({fill:'red', shape:'ring', text:'inactive'});
}

redUtil.prototype.normalCallbackArg = function(msg, idx, arg) {

    var self = this;
    if(typeof arg == 'Function') {
        return arg;
    }

    if(typeof arg == 'String') {
        return eval(arg);
    }
    
    return function() {

        self.send({
        	'iot': {
        		'method': msg.iot.method,
        		'callback': {
        			'idx': idx,
        			'args': Array.prototype.slice.call(arguments)
        		}
        	}
        });
    }; 	
}

redUtil.prototype.checkMethod = function(msg) {

    if(!(msg && msg.iot && msg.iot.method))
        return false;

    var method = msg.iot.method;

    if(method != this.config.method) {
        return false;
    }

    return true;
}

redUtil.prototype.isValid = function(msg) {
    var ret = this.checkMethod(msg);

    if(ret)
        this.node.status({fill:'green', shape:'dot', text:'active'});
    else
        this.node.status({fill:'red', shape:'ring', text:'inactive'});

    return ret;	
}

redUtil.prototype.send = function(msg) {
	this.node.log('send: ' + JSON.stringify(msg));
    this.node.send(msg);	
}

redUtil.prototype.close = function() {

}

redUtil.prototype.jsonCharParse = function(arg) {
  if (typeof(arg) == "string") {
    var arg = arg.trim();
    if (arg.length != 1)
      throw Error("should be only one character for %s parameter of function %s.");
    return arg.charCodeAt(0);
  } else {
    return parseInt(arg);
  }
}

redUtil.prototype.jsonIntegerParse = function(arg) {
  if (typeof(arg) == "string") {
    arg = arg.trim();
    if (arg[0] == '0') {
      if (arg[1] == 'x' || arg[1] == 'X')
        return parseInt(arg, 16);
      else
        return parseInt(arg, 8);
    } else {
      return parseInt(arg);
    }
  } else if (typeof(arg) == "number") {
    return arg;
  }
}

redUtil.prototype.jsonFloatPointerParse = function(arg) {
  return parseFloat(arg);
}

redUtil.prototype.jsonIntegerArrayParse = function(arg) {
  for (i = 0; i < arg.length; i ++) {
    arg[i] =  parseInt(arg[i]);
  }
  return arg;
}

redUtil.prototype.stringToIntegerArray = function(str) {
  var i;
  var arr = []; 

  for (i=0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }   
  return arr;
} 

redUtil.prototype.jsonStringArrayParse = function(arg) {
  if (typeof(arg) == "string") { 
    return this.stringToIntegerArray(arg)
  } else {
    return this.jsonIntegerArrayParse(arg)
  }
}

redUtil.prototype.checkCallbackStr = function(funcStr, funcName) {
  // Split function to funcName & funcBody
  funcStrArr = funcStr.trim().split("=", 2)
  if (funcStrArr.length != 2)
    console.log("the format of function shoule be 'var %s = function(args){ }'.", funcName);

  funcNameStr = funcStrArr[0].trim()
  funcBodyStr = funcStrArr[1].trim()

  // Check function body
  lBraceCnt = funcBodyStr.split("{").length - 1
  rBraceCnt = funcBodyStr.split("}").length - 1
  if (lBraceCnt != rBraceCnt)
    console.log("the '{ }' in function is not paired.");
  
  lParenCnt = funcBodyStr.split("(").length - 1
  rParenCnt = funcBodyStr.split(")").length - 1
  if (lParenCnt != rParenCnt)
    console.log("the '( )' in function is not paired.");
  
  if (funcBodyStr.substr(0, 8) != "function")
    console.log("the format of function shoule be 'var %s = function(args){ }'.", funcName);

  // Check function arguments
  funcArgStr = funcBodyStr.substring(8).split("{")[0].trim()
  lParenCnt = funcArgStr.split("(").length - 1
  rParenCnt = funcArgStr.split(")").length - 1
  if (lParenCnt != 1 || rParenCnt != 1)
    console.log("the format of function shoule be 'var %s = function(args){ }'.", funcName);

  // Check function name
  funcNameArr = funcNameStr.trim().split(" ")
  if ((funcNameArr.length != 2) 
    || (funcNameArr[0] != "var") || (funcNameArr[1] != funcName))
    console.log("the format of function shoule be 'var %s = function(args){ }'.", funcName);
}

module.exports = redUtil;
