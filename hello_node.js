//var http = require('http');

var express = require('express'),
	app = express.createServer(),
	http = require('http'),
	io = require('socket.io').listen(app),
	//amqp = require('amqp'),
	context = require('rabbit.js').createContext('amqp://localhost');

var port = 3000;

app.listen(port);

//configuration
app.configure(function() {
	app.set('views', __dirname+'/views');
	app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
	res.sendfile(__dirname + '/views/index.html');
});

io.sockets.on('connection', function(socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function(data) {
		console.log('answer:' +data.my);
	});
});

/*
var connection = amqp.createConnection({ host : 'localhost'});

connection.addListener('ready', function() {
	var queue = connection.queue('si.test.queue');

	var socket = io.listen(app);

	socket.on('connection', function(client) {
		queue.subscribe( { ack : true}, function(message) {

		});

	});
}); */


context.on('ready', function() {
	//var pub = context.socket('PUB'), 
	var	sub = context.socket('SUB');
	//sub.pipe(process.stdout);
	sub.connect('si.test.queue');
	console.log('im here');
	sub.on('si.test.queue', function(msg) {
		console.log('msg: '+msg);
	});
	
	//sub.connect('si.test.queue', function(data) {
	//	console.log('event: '+data);
	//});
});

console.log("Server running at http://127.0.0.1:"+port);
