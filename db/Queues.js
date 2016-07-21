var queue = {};
var addMsgId = function(user, mid) {
	var arr = queue[user];
	if(arr === undefined) {
		arr = []
	}
	arr.push(mid);
	queue[user] = arr;
}
var getMsgIds = function(user) {
	return queue[user];
}
exports.addMsgId = addMsgId;
exports.getMsgIds = getMsgIds;