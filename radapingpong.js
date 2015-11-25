// http://w1.c1.rada.gov.ua/pls/radan_gs09/ns_golos?g_id=4723

var total_width = 900;

var ball_width = ball_height = 8;
var ball_corner_check_offset = 0; // 1;
var player_default_left = 400;
var player_top = 650;
var player_default_width = 100;
var player_min_width = 30;
var player_height = 50;

var left_margin = 200;

var ball_speed = 3;
var ball_move_interval = 10;

var default_strength_by_type = [5,3,1];
var targets_count = 0;

var total_ball_count = 0;
var lives_count = 25;

var onTargetHit = new Array();
var onTargetCountChange = new Array();
var onBallAdd = new Array();
var onBallRemove = new Array();
var onGameOver = new Array();

var player_background_img = $(".footer_mask").css("background-image");
var player_background_pos = $(".footer_mask").css("background-position");

$("#vid").val("1"); sel_vid_gol();
$("#header, .head_gol, #menu_gol, #zal_frack + div, #00, #01, #10, #footer, #zal_frack").fadeOut().remove();
$("#PlsqlBody, .main").width(total_width+"px");
$(".main").css("margin-left", left_margin+"px").css("padding", "0px").css("height", player_top+player_height+"px").css("background-color", "#F9F9FF");
$("#page").css("background-color", "grey");
$("ul.karta_zal").each(function() { 
	this.style.position = "absolute";
	this.style.left = "0px"; 
});
$("#PlsqlBody > ul").css("position", "relative");

var targets_by_top = {};
var targets_by_bottom = {};
var targets_by_left = {};
var targets_by_right = {};

var all_targets_count = 0;
var coord_props = ["top", "left", "width", "height"];
$("#11 li").each(function(){
	var elem = this;
	for(var i in coord_props) {
		var prop = coord_props[i];
		elem[prop] = parseInt($(elem).css(prop));
		if(prop==="top") {
			elem[prop]=elem[prop]-30;
		}
//		$(elem).css(prop, elem[prop]);
		elem.style[prop] = elem[prop]+"px";
	}
	this.right = this.left+this.width;
	this.bottom = this.top+this.height;
	
	if(!targets_by_top[elem.top]) targets_by_top[elem.top] = new Array();
	if(!targets_by_bottom[elem.top+elem.height]) targets_by_bottom[elem.top+elem.height] = new Array();
	if(!targets_by_left[elem.left]) targets_by_left[elem.left] = new Array();
	if(!targets_by_right[elem.left+elem.width]) targets_by_right[elem.left+elem.width] = new Array();
	
	var spaceOccupied = false;
	for(var idx in targets_by_top[elem.top]) {
		if(targets_by_top[elem.top][idx].left == this.left) {
			spaceOccupied = true;
		}
	}		
	
	if(!spaceOccupied) {	
		targets_by_top[elem.top].push(this);
		targets_by_bottom[elem.top+elem.height].push(this);
		targets_by_left[elem.left].push(this);
		targets_by_right[elem.left+elem.width].push(this);

		if(this.title) {
			this.type = 0;
		} else if((""+$(this).css("background-image")).length>0 && $(this).css("background-image")!="none") {
			this.type = 1;
			targets_count++;
		} else {
			this.type = 2;
			targets_count++;
		}
	
		this.strength = default_strength_by_type[this.type];
		this.initialStrength = this.strength;
		this.numid = ++all_targets_count;
	} else {
		this.remove();
	}
});

var player = $("<div>&nbsp;</div>");
$("#11 ul").first().append(player);
player=player[0];
player.style["position"] = "absolute";
player.style["border-top"] = "solid 2px black";
player.style["background-color"] = "yellow"
player.style["background-image"] = player_background_img;
player.style["background-position"] = "50% 50%"
player.style["background-repeat"] = "no-repeat";
player.top = player_top;
player.left = player_default_left;
player.width = player_default_width;
player.height = player_height;
player.speed = 0;
player.style["top"] = player.top + "px"
player.style["left"] = player_default_left + "px";
player.style["width"] = player_default_width + "px"
player.style["height"] = player.height + "px";
player.setWidth = function(width) {
	if(width>player_min_width) {
		this.width = width;
		this.style.width = width+"px";
		this.updatePosition();
	}
}
player.updatePosition = function() {
	player.left = lastMouseX-left_margin-player.width/2;
	if(player.left<0) { player.left = 0; }
	if(player.left+player.width>total_width) { player.left = total_width-player.width; }

	player.style.left=player.left+"px";
}

var lastLeft = player.left;
setInterval(function() {
	player.speed = parseInt((player.left-lastLeft)/3);
	lastLeft = player.left;
}, 1);


var lastMouseX = 0;
$(document).mousemove(function(event) {
	lastMouseX = event.clientX;
	player.updatePosition();
});

function runAll(arrayOfFunctions, args) {
	for(var fidx in arrayOfFunctions) { 
		arrayOfFunctions[fidx].apply(this, args);
	}
}

function checkTargetCollision(ball) {
//	var hsign = ball.hspeed>0? 1 : -1;
//	var vsign = ball.vspeed>0? 1 : -1;
	var	x = ball.left;
	var y = ball.top;
	var xt = x + ball.hspeed;
	var yt = y + ball.vspeed;
	var hsign = xt>x? 1 : -1; 
	var vsign = yt>y? 1 : -1;
	
	ball.right = x + ball.width;
	ball.bottom = y + ball.height;
	
	var odd = false;
	while(x!=xt || y!=yt) {		
		var effective_x = x + (hsign>0? ball.width : 0);
		var effective_y = y + (vsign>0? ball.height : 0);

		var targets_h = vsign>0? targets_by_top : targets_by_bottom;
		var targets_h_match = targets_h[effective_y] || targets_h[effective_y-1] || targets_h[effective_y+1];
		if(targets_h_match) {
			for(var ti in targets_h_match) {
				var target = targets_h_match[ti];
				if(ball.left>=target.left-1 && ball.left<=target.right+1 || ball.right>=target.left-1 && ball.right<=target.right+1) {
					// Check corners - we must be offset by at least one of the coordinates - otherwise it's ball's corner
					var delta = Math.abs((hsign>0? target.top : target.bottom) - effective_y) 
						+ Math.abs((vsign>0? target.left : target.right) - effective_x);
					if(delta>=ball_corner_check_offset) { // offset by at least ball_corner_check_offset
						target.vhit = true;
						target.hhit = false;
						return target;
					}				
				}
			}
		}

		var targets_v = hsign>0? targets_by_left : targets_by_right;
		var targets_v_match = targets_v[effective_x] || targets_v[effective_x-1] || targets_v[effective_x+1];
		if(targets_v_match) {
			for(var tvi in targets_v_match) {
				var targetv = targets_v_match[tvi];
				if(ball.top>=targetv.top-1 && ball.top<=targetv.bottom+1 || ball.bottom>=targetv.top-1 && ball.bottom<=targetv.bottom+1) {
					// Check corners - we must be offset by at least one of the coordinates - otherwise it's ball's corner
					var deltav = Math.abs((hsign>0? targetv.top : targetv.bottom) - effective_y)
						+ Math.abs((vsign>0? targetv.left : targetv.right) - effective_x);
					if(deltav>=ball_corner_check_offset) { // offset by at least ball_corner_check_offset
						targetv.vhit = false;
						targetv.hhit = true;
						return targetv;
					}				
				}
			}
		}
		if(x!=xt) x+=hsign;
		if(y!=yt) y+=vsign;
		odd = !odd;
	}
	return null;
}

function checkPlayerCollision(bottom, left, right) {
	return (bottom+0 == player.top || bottom+0 == player.top+1) 
		&& (left>player.left && left<player.left+player.width 
			|| right>player.left && right<player.left+player.width);
}

function gameLoose() {
	runAll(onGameOver);
	alert("Game over! You loose. :-(");
}

function gameWin() {
	runAll(onGameOver);
	alert("Game over! You win! :-)");
}

function deleteBall(ball) {
	clearInterval(ball.intBallMove);
	$(ball).remove();
	runAll(onBallRemove);
}

function createBall(x, y) {
	var ball=$("<div>&nbsp;</div>")
	$("#11 ul").first().append(ball);
	ball.css("position", "absolute").css("width", ball_width+"px").css("height", ball_height+"px").css("z-index", "1000");
	ball.css("background-image", "url('http://w1.c1.rada.gov.ua/site/Rs/ngol.png')");
	ball.css("background-position", "50% 50%").css("border", "0").css("margin", "0").css("padding", "0");
	ball = ball[0];
	ball.width = ball_width;
	ball.height = ball_height;
	ball.left = x || player.left+player.width/2-ball_width/2;
	ball.top = y || player_top-ball_height;
	ball.style.top = ball.top+"px";
	ball.style.left = ball.left+"px";
	ball.style.width = ball.width;
	ball.style.height = ball.height;
	ball.hspeed=ball_speed;
	ball.vspeed=-ball_speed;
	ball.powerball = false;
	ball.makePowerball = function(timeout) {
		ball.powerball = true;
		ball.style["background-image"]="url('http://w1.c1.rada.gov.ua/site/Rs/za.png')";
		setTimeout(function (){
			ball.style["background-image"]="url('http://w1.c1.rada.gov.ua/site/Rs/ngol.png')";
			ball.powerball = false;
		}, timeout || 5000);
	}
	
	ball.onBallMove=new Array();
	ball.onBallMove.push(function() { ball.style.top = ball.top+"px"; ball.style.left = ball.left+"px";  });
	ball.onBallMove.push(function() {
		if(ball.left<=0) { ball.hspeed = -ball.hspeed; }
		var right = ball.left+ball.width;
		if(right>=total_width) { ball.hspeed = -ball.hspeed; }
		if(ball.top<=0) { ball.vspeed = -ball.vspeed; }
		var bottom = ball.top+ball.height;
		if(bottom == player_top && checkPlayerCollision(bottom, ball.left, right) 
				|| bottom<player_top && bottom+ball.vspeed>player_top 
					&& checkPlayerCollision(bottom, ball.left+ball.hspeed, right+ball.hspeed)) {
			ball.vspeed = -ball.vspeed;
			ball.hspeed = ball.hspeed + player.speed;
			if(Math.abs(ball.hspeed)>ball_speed*2) {
				ball.hspeed = ball.hspeed>0? ball_speed*2 : -ball_speed*2;
			}
		}
		if(bottom>player.top+player.height) {
			if(invincibility) {
				ball.vspeed = -ball.vspeed;
			} else {
				deleteBall(ball);
			}
		}
	});
	
	ball.intBallMove = setInterval(function() {
		var target;
		while(target = checkTargetCollision(ball)) {
			if(target.vhit && !ball.powerball) ball.vspeed = -ball.vspeed;
			if(target.hhit && !ball.powerball) ball.hspeed = -ball.hspeed;
			runAll(onTargetHit, [ball, target]);
		}	
		ball.top+=ball.vspeed;
		ball.left+=ball.hspeed;
		runAll(ball.onBallMove);
	}, ball_move_interval);
	onGameOver.push(function() { clearInterval(ball.intBallMove); });
	
	runAll(onBallAdd);
	
	return ball;
}

onBallRemove.push(function() {
	total_ball_count--;
	if(total_ball_count<1) {
		decreaseLivesCount();
		if(lives_count<1) {
			gameLoose();
		} else {
			createBall();
		}
	}
});

onBallAdd.push(function() {
	total_ball_count++;
});

var updatePlayerWidthByBallCount = function() {
	if(total_ball_count>0) {
		this.setWidth(player_default_width/total_ball_count);
	}
}
//onBallAdd.push(updatePlayerWidthByBallCount);
//onBallRemove.push(updatePlayerWidthByBallCount);

function changeBatWidth(widthDelta, timeout) {
	var one_step_delta = changeBatWidth.delta_px; //5;

	widthDelta = 0 + widthDelta;
	if(widthDelta != 0) {
		var sign = widthDelta>0 ? 1 : -1;
		var widthChangeLeft = Math.abs(widthDelta);
		var widthResetLeft = 0;
		var selfInterval = setInterval(function () {
			if(widthChangeLeft-->0) {
				var before = player.width;
				player.setWidth(player.width+sign*one_step_delta);
				widthResetLeft+=player.width-before;
			} else {
				clearInterval(selfInterval);
				widthResetLeft = Math.abs(widthResetLeft)/one_step_delta;
				setTimeout(function () {
					var selfIntervalShrink = setInterval(function () {
						if(widthResetLeft-->0) {
							player.setWidth(player.width-sign*one_step_delta);
						} else {
							clearInterval(selfIntervalShrink);
						}		
					}, 1);
				}, timeout);
			}
		}, 1);

	}
}
changeBatWidth.delta_px = 5;



function deleteTarget(target) {
	function delFromArrByNumId(anarray, numid) {
		for(var idx in anarray) {
			if(anarray[idx].numid == numid) {
				anarray.splice(idx, 1);
				break;
			}
		}
	}
	delFromArrByNumId(targets_by_top[target.top], target.numid);
	delFromArrByNumId(targets_by_bottom[target.bottom], target.numid);
	delFromArrByNumId(targets_by_left[target.left], target.numid);
	delFromArrByNumId(targets_by_right[target.right], target.numid);
	$(target).remove();
	if(target.type!=0) {
		targets_count--;
	}
	runAll(onTargetCountChange);
}

onTargetHit.push(function(ball, target) {
	target.strength--;
	if(target.strength<1 || ball.powerball) {
		deleteTarget(target);
		if(target.type == 1) {
			randomPowerup(ball);
		}
	} else {
		target.style.opacity = target.strength/target.initialStrength;
	}
});

function showMessage(x, y, text) {
	var div = $("<div></div>");
	div.css("position", "absolute").css("left", x+"px").css("top", y+"px").css("font-size", "16pt");
	div.css("background-color", "#228822").css("color", "white").css("padding", "10px").css("border-radius", "10px");
	div.css("z-index", "2000").css("opacity", "0.7");
	div.text(text);
	$("body").append(div);
	setTimeout(function() { div.remove(); }, 3000);
}

var invincibility = false;
function setInvincibility() {
	setTimeout(function() {
		invincibility = false;
		$(".main").css("border-bottom", "none");
	}, 10000);
	invincibility = true;
	$(".main").css("border-bottom", "solid 2px black");
}

var powerupDisabled = false;
function randomPowerup(ball) {
	var choice = parseInt(Math.random()*100);
	if(!powerupDisabled && choice>76) {
		powerupDisabled = true;
		if(choice<80 && !invincibility) {
			setInvincibility();
			showMessage(ball.left, ball.top, "INVINCIBILITY!!!");
		} else if(choice>=85 && choice<90) {
			ball.makePowerball();
			showMessage(ball.left, ball.top, "Powerball!");
		} else if(choice>=90 && choice<95) {
			changeBatWidth(-8, 15000);
			showMessage(ball.left, ball.top, "Bad luck - bat shrinks for 15 sec :-(");
		} else if(choice>=95) {
			createBall(ball.left, ball.top);
			showMessage(ball.left, ball.top, "Extra ball!");
		} else {
			changeBatWidth(12, 20000);
			showMessage(ball.left, ball.top, "Yey! Bat grows for 20 sec!");
		}
		setTimeout(function() { powerupDisabled = false }, 5000);
	}
}

onTargetCountChange.push(function() {
	if(targets_count<1) {
		gameWin();
	}
});

var countDisplay = $("<h3></h3>");
$("body").append(countDisplay);
countDisplay.css("position", "fixed").css("left", "10px").css("top", "50px");
onTargetCountChange.push(function() {
	countDisplay.text("Targets left: "+targets_count);
});

var livesDisplay = $("<h2>Lives: "+lives_count+"</h2>");
$("body").append(livesDisplay);
livesDisplay.css("position", "fixed").css("left", "10px").css("top", "10px");
function decreaseLivesCount() {
	showMessage(10, 10, "Life lost! :-(");
	lives_count--;
	livesDisplay.text("Lives: "+lives_count);
	return lives_count;
}

runAll(onTargetCountChange);
createBall();

