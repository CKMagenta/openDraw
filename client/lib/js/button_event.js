
//button highlighting
function setCName_sel(d, o) {

	var selbtns = document.getElementById(d).childNodes;
	for(var i=0; i<selbtns.length;i++) {
		if($(selbtns[i]).hasClass('buttonOn')) {
			$(selbtns[i]).removeClass("buttonOn");
			$(selbtns[i]).addClass("buttonOff");
		}
		/*
		if(selbtns[i].className == 'buttonOn') { 
			selbtns[i].className='buttonOff'; 
		}
		*/
	}
	//o.className = 'buttonOn';
	$(o).removeClass("buttonOff");
	$(o).addClass("buttonOn");
	
	

}

function selCol(o, e, context) {
	//button highlighting
	setCName_sel('colors', o);

	// set color
	//Draw.changeColor(o.style.background);
		
	Draw.changeColor($(o).attr('color'));
}

function setEntered(o, e, context) {
	var index = $("#toolbar ul#entered").children("li").index(o);
	if(window.myLampIndex == undefined || window.myLampIndex == null || window.myLampIndex < 0) {
		if(window.isLampOn && window.isLampOn[index] == true) return;
		window.myLampIndex = index;
		if(!window.myLampOn) {
			$(o).children("img").attr("src","./images/on.png");
			
			
			var actionData = {
				id: Client.getMyId(),
				action: 'lampOn',
				lampIndex : index
			}
			Client.send(actionData);
			window.myLampOn = true;
		}
		
	} else {
		if(window.myLampOn && window.myLampIndex == index) {
			$(o).children("img").attr("src","./images/off.png");
			
			var actionData = {
				id: Client.getMyId(),
				action: 'lampOff',
				lampIndex : index
			}
			Client.send(actionData);
			
			window.myLampOn = false;
			window.myLampIndex = null;
		}
	}
}
function setLampOn(lampIndex) {
	if(!window.isLampOn) window.isLampOn = Array();
	window.isLampOn[lampIndex] = true;
	$("#toolbar ul#entered").children("li:nth-child("+(lampIndex+1)+")").children("img").attr("src","./images/on.png");
	;
}
function setLampOff(lampIndex) {
	window.isLampOn[lampIndex] = false;
	$("#toolbar ul#entered").children("li:nth-child("+(lampIndex+1)+")").children("img").attr("src","./images/off.png");
}
function selTool(o) {
	var newtool = o.id;
	document.getElementById('container').className = newtool;

	//button highlighting
	setCName_sel('buttons', o);

	// set tool
	Draw.changeTool(newtool);
}

function selSetting(o, linewidth) {
	//button highlighting
	setCName_sel('settings', o);

	// set line width	
	Draw.changeLineWidth(linewidth)
}

function resetTool(o) {
	setCName_sel("buttons",o);
	o.className = "";
}


