// http://w1.c1.rada.gov.ua/pls/radan_gs09/ns_golos?g_id=4589

var player_background_img = $(".footer_mask").css("background-image");
var player_background_pos = $(".footer_mask").css("background-position");
$("#vid").val("1"); sel_vid_gol();
$("#header, .head_gol, #menu_gol, #zal_frack + div, #00, #01, #10, #footer, #zal_frack").fadeOut().remove();
var player = $("<div>&nbsp;</div>");
$("#11 ul").first().append(player);
player.css("position", "absolute");
player.css("width", "30px");
player.css("height", "50px");
player.css("top", "600px");
player.css("left", "400px");
player.css("background-image", player_background_img);
player.css("background-position", player_background_pos);
player.css("background-repeat", "no-repeat");
player=player[0];
player.left = 400;
$(".main").css("margin-left", "200px");



var targets_by_y = {};
$("#11 li").each(function(){
var top = (parseInt($(this).css("top"))-60);
var left = parseInt($(this).css("left"));
this.style.top = top+"px";
this.style.left = left+"px";

this.top = top;

var bottom = top+parseInt($(this).css("height"));
this.left = left;
this.right = this.left+parseInt($(this).css("width"));

if(!targets_by_y[bottom]) {
targets_by_y[bottom] = new Array();
}
targets_by_y[bottom].push(this);
});


var fire, handle;
/*var speed = 0;
setInterval(function() { speed=speed/2; }, 200);
$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
            speed++;
            speed=speed*1.35;
            player.left = player.left-parseInt(speed);
			player.style.left=player.left+"px";
        break;
        case 39: // right
            speed++;
            speed=speed*1.35;
            player.left = player.left+parseInt(speed);
			player.style.left=player.left+"px";
        break;
        case 38: // up
        	fire();
        break;
        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});*/

var canfire = true;
var color=0;
var colors=["red","green","blue","cyan","magenta","#E0E000","black"];

fire = function() {
if(canfire) {
canfire = false;
setTimeout(function() { canfire = true; }, 50);
var x = player.left;
var y = 600;
var projectile = $("<div>&nbsp;</div>");
var width = 3;


$("#11 ul").first().append(projectile);
projectile.css("position", "absolute");
projectile.css("width", width+"px");
projectile.css("height", "5px");
projectile.css("top", y+"px");
var left = (x+14);
projectile.css("left", left+"px");
projectile.css("background-color", colors[(color++)%colors.length]);
if(color>colors.length) { color = 0 };
projectile = projectile[0];
projectile.coord = y;
projectile.x = left;
projectile.width = width;
var handlerInterval = setInterval(function() { handle(projectile) }, 10);
projectile.handlerInterval = handlerInterval;
}
}


var game_over = function(restext) {
alert(restext);
canfire = false;
setTimeout(function() { canfire = false; }, 100);
$(player).remove();
clearInterval(firebackInterval);
clearInterval(moveHandler);
}

var destroy = function(it) { clearInterval(it.handlerInterval); $(it).remove(); } 

handle = function(it) {
if(it.coord<=-30) { destroy(it); } else {
it.coord-=3;
var targets = targets_by_y[it.coord] || targets_by_y[it.coord+1] || targets_by_y[it.coord+2];
if(targets) {
var rowstoremove=[];
for(var i in targets) {
  var target = targets[i];
  if(it.x+it.width>target.left+delta && it.x<target.right+delta) {
  	destroy(it);
  	$(target).remove();
  	targets.splice(i, 1);
  }
}
if(targets.length<1) {
delete targets_by_y[it.coord];
delete targets_by_y[it.coord+1];
delete targets_by_y[it.coord+2];
}
var len = 0;
for(var i in targets_by_y) { len++ }
if(len<1) {
setTimeout(function() { game_over("Game over! You win (sort of).") }, 3000);
}
}
it.style.top=it.coord+"px";
}
}

function win() {
for(j=0;j<80;j++) { player.left=30+j*10; for(i=0;i<30;i++) { fire(); canfire=true; } }
player.style.left=player.left+"px";
}

var handle_fireback;
var fireback = function(){
var len = 0;
for(var i in targets_by_y) { len++ }
if(len>0) {
var idx = parseInt(Math.random()*len);
var t = targets_by_y[Object.keys(targets_by_y)[idx]];
while(!t || t.length<1) {
var key = Object.keys(targets_by_y)[idx++%len];
t = targets_by_y[key];
}
t = t[parseInt(Math.random()*t.length)];
var proj=$("<div>&#128163;</div>")[0];
proj.style.position="absolute";
proj.style.color="#F03030";
proj.style["font-size"]="24px";
var y = parseInt($(t).css("top"));
proj.style.top=y+"px";
proj.y = y;
var x = parseInt($(t).css("left"))+4;
proj.x = x;
proj.speed = 2+parseInt(Math.random()*3);
proj.style.left=x+"px";
proj.style['text-align']="center";
proj.style['z-index']="100";
$("#11 ul").first().append(proj);
proj.width=parseInt($(proj).css("width"));
proj.height=parseInt($(proj).css("height"));
handle_fireback_interval = setInterval(function() { handle_fireback(proj); }, 30);
proj.handlerInterval = handle_fireback_interval;
}
}

handle_fireback = function(it) {
it.y+=it.speed;
it.x+=3-Math.round(Math.random()*6);
it.style.top= it.y+"px";
it.style.left= it.x+"px";
if(it.y+it.height>600) {
if(it.y+it.height>630) { destroy(it); } else {
var player_right = player.left+30;
if(it.x+it.width>player.left && it.x<player_right) {
destroy(it);
game_over("Game over! You loose.");
}
}
}
}

var firebackInterval = setInterval(fireback, 800);

var delta =0;
var moveHandler = setInterval(function() {
var mul = parseInt(Date.now()/1000)%50>25?-1:1;
if(delta<-100 && mul<0) mul = 2;
if(delta>100 && mul>0) mul = -2;
 delta+=mul*Math.random()*7;
 $("#11 li").each(function(){ this.style.left=this.left+delta+"px"; });
}, 300);

$(document).click(fire);

$(document).mousemove(function( event ) {
  player.left = event.clientX-200-34-15;
  player.style.left=player.left+"px";
});
