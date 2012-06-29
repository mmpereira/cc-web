//var http = require('http');

var express = require('express'),
	app = express.createServer(),
	fs = require('fs'),
	http = require('http'),
	io = require('socket.io').listen(app),
	context = require('rabbit.js').createContext(),
	amqp = require('amqp');

var port = 3000;

app.listen(port);


//configuration
app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname+'/public'));
});



//routes
//app.get('/', routes.index);

//end of config

app.get('/', function(req, res) {
	var index = fs.readFileSync('views/index.html', 'utf8');
	res.send(index);
});

io.sockets.on('connection', function(socket, message) {
//	io.sockets.emit("notifications", {message: 'mario'});
	socket.emit('notifications', { message: 'hello' });
		socket.on('my other event', function(data) {
		console.log('answer:' +data.my);
	});
});


var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function() {
	connection.queue('notifications.queue', {durable: false}, function(q) {
		q.bind('notifications.exchange', 'notifications.queue');
		q.subscribe(function(message, headers, deliveryInfo) {
			console.log('message: ', message.data.toString());
			io.sockets.emit("notifications", {message: message.data.toString()});
		});
	});

});


console.log("Server running at http://127.0.0.1:"+port);
