// JavaScript Document(function() {
var clientId = 0;
var clients = [];

Array.prototype.remove = function(e) {
	for (var i = 0; i < this.length; i++)
		if (e == this[i])
			return this.splice(i, 1);
}

function newClient(websocket) {
	clientId++;
	return {id: clientId, socket: websocket};
}

function broadcast(websocket, data, from) {
	clients.forEach(function (client) {
		if (client != from) {
			try {
				websocket.broadcast.emit(data.action, data);
			} catch (e) {
				clients.remove(client);
			}
		}
	});
}

function sendSetId(client) {
	try {
		websocket.broadcast.emit('setId', {id: client.id, action: 'setId'});
	} catch (e) {
	}
}



var io;
io = require('socket.io').listen(8000);
console.log('Welcome');
io.sockets.on('connection', function(websocket) {
	
	console.log('connection');
	
	// emitted after handshake
	var nc = newClient(websocket);
	clients.push(nc);
	var id = nc.id;
	console.log('connect: [' + id + '], clients.length: ' + clients.length);
	broadcast(websocket, {id: id, action: 'connect', length: clients.length});
	sendSetId(nc);
		
		
		
	websocket.on('data',function(data) {
		// send data to attached clients
		console.log('sending data... from(' + nc.id + ') => ' + data);
		//var data = JSON.parse(data);
		data.length = clients.length;
		broadcast(websocket, data, nc);
	});
	websocket.on('disconnect', function() {
		// emitted when server or client closes connection
		var id = nc.id;
		console.log('close: [' + id + '], clients.length: ' + clients.length);
		clients.remove(nc);
		broadcast(websocket, {id: id, action: 'close', length: clients.length});
	});
	
	/*
    socket.on('drawClick', function(data) {
      socket.broadcast.emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type
      });
    });
	*/
});