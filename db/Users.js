var users = {};
var userExists = function(user) {
  if(typeof users[user] != 'undefined') {
  	return true;
  }
  return false;
}
var addUser = function(user, pass) {
  if(!userExists(user)) {
  	users[user] = [pass];
  	return true;
  }
  return false;
}
var removeUser = function(user, pass) {
  if(!userExists(user)) {
  	delete users[user];
  	return true;
  }
  return false;
}
var getPassword = function(user) {
  return String(users[user]);
}
exports.userExists = userExists;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getPassword = getPassword;