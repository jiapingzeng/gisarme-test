$(function(){function e(e){var n=$("#activities");n.append('<li class="collection-item">'+a(e)+"</li>"),n.scrollTop(n[0].scrollHeight)}function a(e){return e.replace(/</g,"&lt;").replace(/>/g,"&gt;")}function n(){for(var e,a=[],n=window.location.href.slice(window.location.href.indexOf("?")+1).split("&"),i=0;i<n.length;i++)e=n[i].split("="),a.push(e[0]),a[e[0]]=e[1];return a}var i=io();i.on("connected",function(a){console.log("connected to server"),e("You have connected")}),i.on("user connected",function(a){e(a.player.username+" is connected")}),i.on("user disconnected",function(a){e(a.player.username+" has disconnected")}),i.on("message",function(a){e(a.player?a.player.username+": "+a.message:a.message)}),i.on("game created",function(e){console.log(e.game.id),$("#gameLink").val("http://gisar.me/sudoku?id="+e.game.id),$("#gameLink").focus().select(),$("#copyLink").removeClass("disabled"),$("#player1").text(e.player.username),$("#gameBanner").removeClass("hide")}),i.on("game joined",function(e){$("#player1").text(e.player.username),$("#gameBanner").removeClass("hide")}),i.on("join failed",function(e){$("#createGame").removeClass("disabled"),$("#joinGame").removeClass("disabled"),Materialize.toast("game not found",5e3)}),i.on("player joined",function(e){$("#player2").text(e.player.username)});var o=!1;n().id&&($("#createGame").addClass("disabled"),$("#joinGame").addClass("disabled"),i.emit("join game",{id:n().id})),$("#input").keydown(function(a){if(13==a.which){var n=$("#input").val();a.preventDefault(),o?n.trim()&&i.emit("send message",{message:n}):(i.emit("set username",{username:n}),e("You have set your name to "+n),$("#input").attr("placeholder","enter message"),o=!0),$("#input").val("")}}),$("#createGame").on("click",function(){$("#createGame").addClass("disabled"),i.emit("create game")}),$("#joinGame").on("click",function(){$("#createGame").addClass("disabled"),$("#joinGame").addClass("disabled"),gameId=$("#gameId").val(),i.emit("join game",{id:gameId})}),$("#copyLink").on("click",function(){$("#gameLink").select();try{var e=document.execCommand("copy"),a=e?"link copied":"copy failed";Materialize.toast(a,5e3)}catch(e){Materialize.toast("unknown error",5e3)}})});