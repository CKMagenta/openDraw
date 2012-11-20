// JavaScript Document(function() {
var PORT = 80;
var clientId = 0;
var clients = [];
var lamps = [];

Array.prototype.remove = function(e) {
	for (var i = 0; i < this.length; i++)
		if (e == this[i])
			return this.splice(i, 1);
}

function newClient(websocket) {
	clientId = (clientId+1)%20;
	//clientId++;
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
io = require('socket.io').listen(PORT);//80);
console.log('Welcome');
io.sockets.on('connection', function(websocket) {
	
	console.log('connection');
	
	// emitted after handshake
	var nc = newClient(websocket);
	clients.push(nc);
	var id = nc.id;
	console.log('connect: [' + id + '], clients.length: ' + clients.length);
	broadcast(websocket, {id: id, action: 'connect', length: clients.length});
	websocket.emit('lampsOn', {id: nc.id, lamps:lamps});
	sendSetId(nc);
		
		
		
	websocket.on('data',function(data) {
		// send data to attached clients
		console.log('sending data... from(' + nc.id + ') => ' + data);
		//var data = JSON.parse(data);
		data.length = clients.length;
		broadcast(websocket, data, nc);
		
		if(data.action == 'lampOn') {
			lamps[data.lampIndex] = {id:nc.id, lampIndex:data.lampIndex};
		} else if(data.action == 'lampOff') {
			lamps[data.lampIndex] = null;
		}

	});
	websocket.on('disconnect', function() {
		// emitted when server or client closes connection
		var id = nc.id;
		console.log('close: [' + id + '], clients.length: ' + clients.length);
		for(var i=0; i<lamps.length; i++) {
			if(!lamps[i]) continue;
			if(lamps[i].id == nc.id) {
				lamps[i]=null;
				console.log('close: ' + i + 'th lamp flush');
				broadcast(websocket, {id: id, action: 'lampOff', lampIndex:i});
			}
		}
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