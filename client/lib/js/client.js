
// print a message
function printMessage(message) {
	$('#log').prepend('<li class="them">' + message + '</li>');
}

// Client module
Client = function() {
	// private variables..
	var conn = new Object();
	var entities = {'<': '&lt;', '>':'&gt;', '&': '&amp;', '"': '&quot;'};
	var myId = null;
	
	// private methods..
	
	
	function onDrawMessage(message) {
		// remove undids if <id> had undo.
		if (History.hasRedo(message.id))
			History.removeUndid(message.id);
		
		History.addAction(message);
		Draw.draw(message);
	}
	
	function escapeString(s) {
		return s.replace(/[<>&"]/g, function (m) { return entities[m]; });
	}
	
	
	function openConnection() {
		if (conn.readyState === undefined || conn.readyState > 1) {
			try {
				conn = io.connect('ws://172.16.7.52:8000');
			} catch (e) {
				conn = null;
				alert('This browser could not surport WebSocket.');
				return;
			}
			
			
			conn.on('setId', function(message) {
				myId = message.id;
			});
			
			conn.on('connect', function(message) {
				$('#connected').html(message.length);
			});
			
			conn.on('close', function(message) {
				$('#connected').html(message.length);
				History.removeAllOfId(message.id);
			});
			
			conn.on('pencil', function(message) {
				onDrawMessage(message);
			});
			
			conn.on('erase', function(message) {
				onDrawMessage(message);
			});
			
			conn.on('undo', function(message) {
				History.undo(message.id);
				Draw.drawAll();
			});
			
			conn.on('redo', function(message) {
				var last = History.redo(message.id);
				if (last != null)
					Draw.draw(last);
			});



			conn.onopen = function () {
				var state = $('#status');
				state.html('Socket open');
				state.className = 'Socket open';
			};
			
			conn.onmessage = function (event) {
				var message = JSON.parse(event.data);
				handleMessage(message);
			};
			
			conn.onclose = function (event) {
				var state = $('#status');
				state.html('Sockets closed');
				state.className = 'fail';
			};
		}
	}
	
	// public variables & methods..
	return {
		initialize: function(data) {
			if (window.WebSocket === undefined) {
				var state = $('#status');
				state.html('Sockets not supported.');
				state.className = 'fail';
			}
			else {
				$('#state').click(function() {
					if (conn.readyState !== 1) {
						conn.close();
						setTimeout(function () {
							openConnection();
						}, 250);
					}
				});
			}

			openConnection();
		},
		
		send: function(action) {
			if (conn)
				conn.emit('data', action);
				//conn.send(JSON.stringify(action));
		},
		
		getMyId: function() {
			return myId;
		},
		undo: function() {
			if (History.hasUndo(myId)) {
				History.undo(myId);
				Draw.drawAll();
				Client.send({id: myId, action: 'undo'});
			}
		},
		redo: function() {
			if (History.hasRedo(myId)) {
				var last = History.redo(myId);
				Draw.draw(last);
				Client.send({id: myId, action: 'redo'});
			}
		}
	};
}();


