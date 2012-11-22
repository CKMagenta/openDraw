// JavaScript Document
$(document).bind("makeUI", function() {
	var receivers = Array();
	receivers.push({"name":"수신자1", "color":"#000"});
	receivers.push({"name":"수신자2", "color":"#F00"});
	receivers.push({"name":"수신자3", "color":"#0F0"});
	receivers.push({"name":"수신자4", "color":"#00F"});
	receivers.push({"name":"수신자5", "color":"#06F"});
	var buttonWidth = (800/receivers.length);
	var templete = "";
	for(var i=0; i<receivers.length; i++) {
		var rec = receivers[i];
		//templete += '<li color="' + rec.color + '" onmousedown="selCol(this)" style="width:'+buttonWidth+'px">';
		if(i==0) 	{templete += '<li color="' + rec.color + '" class="buttonOn" onmousedown="selCol(this)" style="width:'+buttonWidth+'px">';} 
		else 		{templete += '<li color="' + rec.color + '" class="buttonOff" onmousedown="selCol(this)" style="width:'+buttonWidth+'px">';}
		templete += 	'<a class="receiverButton"  src="#">';
		templete +=			'<div class="receiverButtonImageWraper">';
		templete +=				'<img src="./images/selector.png" value="'+ rec.color +'" ';
		templete +=					'width="' + (buttonWidth*0.7) +'" height="'+ (buttonWidth*0.5) +'" />';
		templete +=			'</div>';
		templete +=			'<div class="receiverButtonColor" style="width:' + (buttonWidth*0.6) +'px; ';
		templete +=												'height:'+ 30 +'px; background-color:'+ rec.color +'" ></div>';
		templete +=			'<div class="receiverButtonColorBackground" style="width:' + (buttonWidth*0.6) +'px; ';
		templete +=												'height:'+ 30 +'px; " ></div>';


		templete +=		'</a>';
		templete += 	'<div class="receiverName">'+ rec.name +'</div>';
		templete += '</li>';
	}

	$("ul#colors").append(templete);
	
	templete = "";
	for(var i=0; i<receivers.length; i++) {
		templete +=	'<li value="off" onmousedown="setEntered(this)" style="width:'+ buttonWidth +'px" >';
		templete +=		'<img src="./images/off.png" />';
		templete +=	'</li>';
	}
	
	$("ul#entered").append(templete);
	
	var deviceWidth = $(window).width();
	var zoomLev = deviceWidth<800?$(window).width()/800:1;
	$("html").css("zoom", zoomLev);
	window.zoomLev = zoomLev;
	/*
	var minW = $(document).width();
	
	$(function () {
		//CheckSizeZoom();
		$('#window').css('visibility', 'visible');
	});
	*/
	//$(window).resize(CheckSizeZoom);
	
	
	$(window).resize(function(e) {
		
		if( $(window).width() < 800 ) {
			$("#inputWindow").css("display","none");	
		} else {
		var marginWidth = $(window).width() - 822;
		var buttonWidth = 0;//50;
		var inputWidth = marginWidth - buttonWidth;
			$("#inputWindow").css({width:marginWidth});
			$("#inputWindow  #inputText").css({width:inputWidth});
			//$("#inputWindow  input:submit").css({width:buttonwidth});
		
		}	
	});
	
	$(window).resize();
	
	
	$("#inputForm").submit(function(e) {
		
		Draw.sendText($(this).find("input:text").val());
		$(this).find("input:text").val("");
		
		
		
		
		return false;
	});
	
	$("#clear").click(function(e) {
		Draw.clearAll();
	});
	
});

function CheckSizeZoom() {
	if ($(window).width()<800) { //$(window).width() < minW
		var zoomLev = $(window).width() / minW;
		if (typeof (document.body.style.zoom) != "undefined") {
			$(document.body).css('zoom', zoomLev);
			window.zoomLev = 1;//zoomLev;
		} else {
		// Mozilla doesn't support zoom, use -moz-transform to scale and compensate for lost width
			$('#window').css('-moz-transform', "scale(" + zoomLev + ")");
			$('#window').width($(window).width() / zoomLev + 10);
			$('#window').css('position', 'relative');
			$('#window').css('left', (($(window).width() - minW - 16) / 2) + "px");
			$('#window').css('top', "-19px");
			$('#window').css('position', 'relative');
			window.zoomLev = zoomLev;
		}
	} else {
		$(document.body).css('zoom', '');
		$('#window').css('position', '');
		$('#window').css('left', "");
		$('#window').css('top', "");
		$('#window').css('-moz-transform', "");
		$('#window').width("");
	}
}
	
$(document).ready(function() {
	
	Draw.initialize();
	Client.initialize();
});

function lampNotOn() {
	$("#notice-message").text("자신의 위치를 표시해 주세요");
	$("#notice").fadeIn(400).delay(2000).fadeOut(400);
	//$("#notice-message").text("");	
};