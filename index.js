var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var io = require('socket.io')(http);
var Users = require('./db/Users');
var Messages = require('./db/Messages');
var Queues = require('./db/Queues');
var config = require('./config')(Users, Messages);

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({secret:'somesecrettokenhere'}));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', function(req, res){
  /** HINT : to get form data in req.body add name attribute to relevant elements **/
  var usr=req.body.usr;
  var pwd=req.body.pwd;
  var redirectTo = '/login';
  //console.log("Login Attempt for : " + usr + " <:-:> " + pwd);
  if(Users.userExists(usr)) {
  	//console.log("User " + usr + " exists !");
  	if(Users.getPassword(usr) === pwd) {
  		//console.log("User " + usr + " has entered correct password !");
  		req.session.user = usr;
  		redirectTo = '/home';
  	}
  	else {
  		//console.log("User " + usr + " has entered incorrect password !");
  	}
  }
  else {
  	//console.log("User" + usr + " doesn't exist !");
  }
  res.redirect(redirectTo);
});

var pool = {};
var qool = {};
var tool = {};

var users = ['Cersei', 'Jaime', 'Tyrion'];

app.get('/home', function(req, res){
	var user = req.session.user;
	//console.log(user);	
	if(user === undefined) {
		res.redirect('/login');
	}
	else {	
		var sid = getSid(req.headers.cookie);
		pool[user] = sid;
		qool[sid] = user;
		function compare(val) {
		    return val !== user;
		}
		diff = users.filter(compare);
		res.render('home', {
	        user: user,
	        users: diff
	    });
	}
});

app.use( express.static( "public" ) ); 

/**redirect-all-unmatched-urls**/
function redirectUnmatched(req, res) {
  res.redirect("/login");
}
app.use(redirectUnmatched);

function getSid(s) {
	a = s.split(";");
	b = a.length;
	for(i=0;i<b;i++) {
		c = a[i].indexOf('connect.sid');
		if(c == 0 || c == 1) {
			d = a[i].trim().split("=");
			return d[1];
		}
	}
	return undefined;
}

io.on('connection', function(socket){
	var sid = getSid(socket.request.headers.cookie);
	if(qool[sid] !== undefined) {
		tool[sid] = socket;
	}
	socket.on('disconnect', function(){
	/** clear tool **/
	if(socket === tool[sid]) {
		/** latest socket for the session **/
		delete tool[sid];
		/** clear pool & qool **/
		if(qool[sid] !== undefined) {
			delete pool[qool[sid]];
			delete qool[sid];
		}
	}
	else {
		/** already over-written socket **/
	}	
  });

	socket.on('chat message', function(data){
		var sender = qool[sid];
		var recipient = data.user;
		var message = data.msg;		
		var mid = Messages.addMsg(sender, recipient, message);
		//console.log("message id = " + mid);
		var recipientSessionId = pool[data.user];
		var recipientSocketId = tool[recipientSessionId];
		if(recipientSessionId === undefined || recipientSocketId === undefined) {
			Queues.addMsgId(recipient, mid);
			socket.emit('system message', {user: recipient, msg: recipient + ' is offline. Message not delivered.'});
		}
		else {
			recipientSocketId.emit('chat message', {user: sender, msg: message});
		}    	
  	});

  	function logMsg(sender, recipient, msg) {
  		console.log("---chat message---");
		console.log('sender:' + sender);
		console.log('recipient: ' + recipient);
		console.log('message: ' + data.msg);
  		console.log("------------------");
  	}
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on *:' + port);
});