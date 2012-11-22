
// Draw module
Draw = function() {
	var color = '#000000';
	var lineWidth = 5;
	var canvas = null;
	var context = null;
	var tool = null;
	var actionData = null;
	var _touchEV = null;
	var zoomLev = window.zoomLev;
	var _x = 0;
	var _y = 0;
	var nInputLine = 0;
	// pencil tool
	var PencilAction = {
		onStart: function(x, y) {
			// set color and lineWidth
			context.strokeStyle = color;
			context.lineWidth = lineWidth;
			
			x = _x = x;
			y = _y = y;
			
			
			// initialize a line data
			actionData = {
				id: Client.getMyId(),
				action: 'pencil',
				undo: false,
				lineWidth: lineWidth,
				color: color,
				data: [{x: x, y: y, lineWidth:lineWidth}]
			}
			
			//context.beginPath();
			//context.moveTo(x, y);
			
			context.beginPath();
			context.moveTo(_x,_y);
			context.lineWidth = calcLineWidth(x, y, _x, _y);
			context.lineTo(x,y);
			context.closePath();
			context.stroke();
			
		},
		onMove: function(x, y) {
			var _lineWidth = lineWidth;
			x = x;
			y = y;
			
			
			

			//context.lineWidth = _lineWidth;
			//context.lineTo(x, y);
			//context.stroke();
			
			context.beginPath();
			context.moveTo(_x,_y);
			context.lineWidth = calcLineWidth(x, y, _x, _y);
			context.lineTo(x,y);
			context.closePath();
			context.stroke();

			
			actionData.data.push({x: x, y: y, lineWidth : _lineWidth});		// add a (x,y) to actionData
			_x = x;
			_y = y;
		},
		onEnd: function(x, y) {
			
			x = x;
			y = y;
			
			
			context.beginPath();
			context.moveTo(_x,_y);
			context.lineWidth = calcLineWidth(x, y, _x, _y);
			context.lineTo(x,y);
			context.closePath();
			context.stroke();
			
			//context.closePath();
			
			var myId = Client.getMyId();
			if (History.hasRedo(myId))
				History.removeUndid(myId);
			
			actionData.data.push({x: x, y: y, lineWidth : lineWidth});		// add a (x,y) to actionData
			History.addAction(actionData);			// add to History
			Client.send(actionData);				// send the action to server
			actionData = null;
		},
		drawItem: function(item) {
			drawLines(item.color, item.lineWidth, item.data);
		}
	};
	
	// erase tool
	var EraseAction = {
		onStart: function(x, y) {
			// set color and lineWidth
			
			x = x;
			y = y;
			
			var ERASE_WIDTH = 10;
			context.strokeStyle = '#FFFFFF';
			context.lineWidth = ERASE_WIDTH;
			
			// initialize a line data
			actionData = {
				id: Client.getMyId(),
				action: 'erase',
				undo: false,
				lineWidth: ERASE_WIDTH,
				color: '#FFFFFF',
				data: [{x: x, y: y}]
			}
			
			context.beginPath();
			context.moveTo(x, y);
		},
		onMove: function(x, y) {
			
			
			x = x;
			y = y;
			
			
			context.lineTo(x, y);
			context.stroke();
			
			actionData.data.push({x: x, y: y});		// add a (x,y) to actionData
		},
		onEnd: function(x, y) {
			context.closePath();
			
			
			x = x;
			y = y;
			
			var myId = Client.getMyId();
			if (History.hasUndo(myId))
				History.removeUndid(myId);
			
			actionData.data.push({x: x, y: y});		// add a (x,y) to actionData
			History.addAction(actionData);			// add to History
			Client.send(actionData);				// send the action to server
			actionData = null;
		},
		drawItem: function(item) {
			drawLines(item.color, item.lineWidth, item.data);
		}
	};
	
	var TOOLS = [
		['pencil', PencilAction],
		['erase', EraseAction],
	];
	
	
	
	function distanceBetweenPoints(x, y, _x, _y) {
		
		return Math.sqrt(Math.pow((x-_x),2) + Math.pow((y-_y),2));//length;
	}
	
	function calcLineWidth(x, y, _x, _y) {
		var d = distanceBetweenPoints(x, y, _x, _y);
		var _lineWidth;
			//console.log(d);
			_lineWidth = lineWidth - d*0.04;
			/*
			if(d < 2 ) {
				_lineWidth = lineWidth;
			} else if( d < 4) {
				_lineWidth = lineWidth*0.95;
			} else if( d < 6) {
				_lineWidth = lineWidth*0.9;
			} else if( d < 8) {
				_lineWidth = lineWidth*0.85;
			} else if( d < 10) {
				_lineWidth = lineWidth*0.8;
			} else if( d < 12) {
				_lineWidth = lineWidth*0.75;
			} else if( d < 14) {
				_lineWidth = lineWidth*0.7;
			} else if( d < 23) {
				_lineWidth = lineWidth*0.65;
			} else if( d < 27) {
				_lineWidth = lineWidth*0.6;
			} else if( d < 30) {				
				_lineWidth = lineWidth*0.55;
			} else if( d < 33) {
				_lineWidth = lineWidth*0.5;
			} else {
				_lineWidth = lineWidth * 0.45;
			}
			*/
			return _lineWidth;
	}
	// mouse event listener
	function onMouseCanvas(ev) {
		if (ev.layerX || ev.layerX == 0) {
			// for Firefox
			ev._x = ev.layerX;
			ev._y = ev.layerY;
		}
		else if (ev.offsetX || ev.offsetX == 0) {
			// for Opera
			ev._x = ev.offsetX;
			ev._y = ev.offsetY;
		}
		
		// call specific event handler for type
		var func = tool[ev.type];	
		if (func) {
			func(ev);
		}
	}
	// touch event listener
	function onTouchCanvas(ev) {
		ev.preventDefault();
		
		
		
		var touch = ev.touches[0];
		//$("#log").html("tc : "+ ev.touches.length); //start&move : 1, end:0
		if(ev.touches.length ==0) {
			touch = _touchEV.touches[0];
			//alert("alt");
		}
		_touchEV = ev;
		
		
		
		
		// call specific event handler for type
		var func = tool[ev.type];	// ev.type : touchstart touchmove touchend...
		

		if (func) {
			func(touch);
		}
	}
	
	// action wrapper for action
	function ActionListener(action) {
		//$("#log").html("actionStart");
		var listener = this;
		this.started = false;
		
		this.mousedown = function(ev) {	//tool[mousedown]??
			if(!window.myLampOn) {
				lampNotOn();
				return;
			}
			listener.started = true;
			var xL = (ev._x/window.zoomLev);
			var yL = (ev._y/window.zoomLev);
			action.onStart(xL, yL);
		};
		this.mousemove = function(ev) {
			if(!window.myLampOn) {
				return;
			}
			if (listener.started) {
				var xL = (ev._x/window.zoomLev);
				var yL = (ev._y/window.zoomLev);
				//$("#log").html("x:"+ev._x+" y:"+ev._y+"    xL:"+xL+" yL:"+yL);
				//$("#log").html(JSON.stringify(ev));
				action.onMove(xL, yL);
			}
		};
		this.mouseup = function(ev) {
			if(!window.myLampOn) {
				return;
			}
			if (listener.started) {
				var xL = (ev._x/window.zoomLev);
				var yL = (ev._y/window.zoomLev);
				action.onEnd(xL, yL);
				//$("#log").html("touchEnd : "+ ev._x + "," + ev._y);				
				listener.started = false;
			}
		};
		this.touchstart = function(ev) {
			if(!window.myLampOn) {
				lampNotOn();
				return;
			}
			//$("#log").html("touchStart");
			
			listener.started = true;
			
			var xL = (ev.pageX/window.zoomLev);
			var yL = ((ev.pageY)/window.zoomLev-140);
			
			
			
			//alert("x:"+ev.pagex+" y:"+ev.pagey+"    xL:"+xL+" yL:"+yL);
			action.onStart(xL, yL);
			//action.onStart(ev.pagex, ev.pagey);
			$("#log").html(""+ev.pageY);
		};
		this.touchmove = function(ev) {
			if(!window.myLampOn) {
				return;
			}
			//$("#log").html("touchMove");
			var xL = (ev.pageX/window.zoomLev);
			var yL = ((ev.pageY)/window.zoomLev-140);
			
			if (listener.started) {
				action.onMove(xL, yL);
				//action.onMove(ev.pagex, ev.pagey);
			}
			$("#log").html(""+ev.pageY);
		};
		this.touchend = function(ev) {
			if(!window.myLampOn) {

				return;
			}
			if (listener.started) {		
			var xL = (ev.pageX/window.zoomLev);
			var yL = ((ev.pageY)/window.zoomLev-140);
				action.onEnd(xL, yL);
				//action.onEnd(ev.pagex, ev.pagey);
				listener.started = false;
			}
		};
	}
	
	// draw lines
	function drawLines(color, lineWidth, data) {
		if (data.length > 0) {
			var preLineWidth = context.lineWidth;
			var preColor = context.strokeStyle;
			
			context.beginPath();
			context.lineWidth = lineWidth;
			context.strokeStyle = color;
			context.moveTo(data[0].x, data[0].y);
			for (var i = 1; i < data.length; i++) {
				//context.beginPath();
				context.lineWidth = data[i].lineWidth;
				context.lineTo(data[i].x, data[i].y);
				context.stroke();
				//context.closePath();
				//console.log(data[i]);
			}
			context.closePath();
			
			context.lineWidth = preLineWidth;
			context.strokeStyle = preColor;
			
			/*
			var preLineWidth = context.lineWidth;
			var preColor = context.strokeStyle;
			
			//context.beginPath();
			context.lineWidth = lineWidth;
			context.strokeStyle = color;
			//context.moveTo(data[0].x, data[0].y);
			var _x = 0;//data[0].x;
			var _y = 0;//data[0].x;
			var x = 0;//data[i].x;
			var y = 0;//data[i].y;
			for (var i = 0; i < data.length; i++) {//(var i = 1; i < data.length; i++) {
				x = data[i].x;
				y = data[i].y;
				if(i==0) {
					_x = data[i].x;
					_y = data[i].y;
				}
				
				context.beginPath();
				context.moveTo(_x,_y);
				context.lineWidth = calcLineWidth(x, y, _x, _y);
				context.lineTo(x,y);//(data[i].x, data[i].y);
				context.stroke();
				context.closePath();
				_x = x;
				_y = y;
				//console.log(data[i]);
			}
			//context.closePath();
			
			context.lineWidth = preLineWidth;
			context.strokeStyle = preColor;
			*/
		}
	}
	
	// public variables & methods..
	return {
		initialize: function() {
			canvas = document.getElementById('drawCanvas');
			if (!canvas) {
				alert('Cannot find Canvas object.');
				return;
			}
			if (!canvas.getContext) {
				alert('Cannot find Drawing Context');
				return;
			}
			context = canvas.getContext('2d');
			if (!context) {
				alert('Cannot call getContext() of Canvas');
				return;
			}
			
			if(window.zoomLev) {
				zoomLev = window.zoomLev;
			}
			
			context.setLineJoin("round");
			context.setLineCap("round");
			
			// set tool <= pencil
			Draw.changeTool('pencil');
			
			// Add mouse event listeners..
			canvas.addEventListener('mousedown', onMouseCanvas, false);
			canvas.addEventListener('mousemove', onMouseCanvas, false);
			canvas.addEventListener('mouseup',   onMouseCanvas, false);
			
			// Add touch event listener
			canvas.addEventListener('touchstart', onTouchCanvas, false);
			canvas.addEventListener('touchmove',  onTouchCanvas, false);
			canvas.addEventListener('touchend',   onTouchCanvas, false);
		},
		changeColor: function(hexColor) {
			color = hexColor;
		},
		getColor: function() {
			return color;
		},
		changeLineWidth: function(width) {
			lineWidth = width;
			context.lineWidth = width;
		},
		changeTool: function(toolName) {
			var selectedTool = null;
			for (var i in TOOLS) {
				if (TOOLS[i][0] == toolName) {
					selectedTool = TOOLS[i][1];
					break;
				}
			}
			
			if (selectedTool != null)
				tool = new ActionListener(selectedTool);
			
			return selectedTool != null;
		},
		draw: function(item) {
			var drawFunction = null;
			for (var i in TOOLS) {
				if (TOOLS[i][0] == item.action) {
					drawFunction = TOOLS[i][1].drawItem;
					break;
				}
			}
			
			if (drawFunction != null)
				drawFunction(item);
		},
		drawAll: function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			var items = History.getItems();
			for (var i in items) {
				if (items[i].undo == false)
					Draw.draw(items[i]);
			}
		},
		
		clearAll : function () {
			if(!window.myLampOn) {
				lampNotOn();
				return;
			}
			
			
			actionData = {
				id: Client.getMyId(),
				action: 'clearAll',
			}
			
			Client.send(actionData);
			actionData = null;
			
			context.clearRect(0,0, canvas.width, canvas.height);
		},
		
		drawText : function(str, fs) {
			context.fillStyle = fs;
			//context.font
			//context.textBaseLine
			context.font = '30px sans-serif';
			context.fillText(str, 10, ((nInputLine * 40)+50));
			nInputLine = (nInputLine+1)%12;
			
		},
		
		sendText : function(str) {
			if(!window.myLampOn) {
				lampNotOn();
				return;
			}
			
			actionData = {
				id: Client.getMyId(),
				action: 'drawText',
				undo: false,
				lineWidth: lineWidth,
				color: context.strokeStyle,
				data: [{msg:str}]
			}
			Client.send(actionData);
			actionData = null;
			
			context.fillStyle = context.strokeStyle;
			//context.font
			//context.textBaseLine
			context.font = '30px sans-serif';
			context.fillText(str, 10, ((nInputLine * 40)+50));
			nInputLine = (nInputLine+1)%12;
			
		}
	};
}();

