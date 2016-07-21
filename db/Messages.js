var messages = {};
var counter = 1;
var addMsg = function(sender, recipient, message) {
   	messages[counter] = {sender: sender, recipient: recipient, message: message, timestamp: Date.now()};
   	return counter++;
}
var getMsg = function(id) {
	return {id: id, msg: messages[id]};
}
var getMsgs = function(arr) {
	var res = [];
	for(i=0;i<arr.length;i++) {
		res.push({id: arr[i], msg: messages[arr[i]]});
	}
}
exports.addMsg = addMsg;
exports.getMsg = getMsg;
exports.getMsgs = getMsgs;