//var http = require('http');

var express = require('express'),
	app = express.createServer(),
	fs = require('fs'),
	http = require('http'),
	io = require('socket.io').listen(app),
	context = require('rabbit.js').createContext('amqp://localhost');

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
	sub.setEncoding('utf8');
	//sub.pipe(process.stdout);
	sub.connect('notifications.queue');
	console.log('im here');
	sub.on('si.test.queue', function(msg) {
		console.log('msg: '+msg);
	});
	
	//sub.connect('si.test.queue', function(data) {
	//	console.log('event: '+data);
	//});
});

console.log("Server running at http://127.0.0.1:"+port);
