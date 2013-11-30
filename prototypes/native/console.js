// console._log = console.log;
// console.log = function(text){
// 	var stack = new Error().stack;
// 	var fullLine = stack.split("\n")[2];
// 	var line;
// 	if(fullLine.indexOf('(') != -1){
// 		var str = stack.split("\n")[2].split('(')[1];
// 		line = str.substring(0, str.length-1);
// 	}
// 	else{
// 		line = fullLine.trim(3);
// 	}
// 	console._log(line);
// 	console._log(text+'\n');
// }