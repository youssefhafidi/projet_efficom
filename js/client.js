var citation=false;
/* fonctions standard */
function addSmiley (txt) {
		 var m = $("#message").val();
		 $("#message").val(m+' '+txt).focus();
		
		 }
		 
function citer(m){
	citation = m;
	$("#citationWrapper").append('<h4 style=" margin: 10px 0 0;padding-left:30px">Citation : '+citation+'</h4>')
						 .show()
						 .append("<a id='close' title='annuler la citation' onClick='annuleCitation()'><i class='icon-remove'></i></a>");
	$("#users,#messages").css({"padding-bottom":"100px"});
}
function annuleCitation(){
	citation = false;
	$("#citationWrapper").empty().hide();
	$("#users,#messages").css({"padding-bottom":"50px"});
}
function redim(){
	if( $(window).width() < '768')
	{
		$("#form,#messages").css({"left":0});
		$("#messages").css({"margin-right":0});
	}

	else
	{
		$("#form,#messages").css({"left":"65px"});
		$("#messages").css({"margin-right":"65px"});             
	}
}
$(window).resize(function(){redim();});
function menu(){
	$(".collapse .nav").empty();
	$('#users img').each(function(){
			var nom = $(this).attr('class');
			var src = $(this).attr('src');
			$(".collapse .nav").append("<li><a><img style='float:left;height:20px;padding-right:5px;' src='"+src+"'/>"+nom+"</a></li>");
	});
}
/* */
(function($){
	
	var socket = io.connect('http://localhost:1337');
	var msgtpl = $('#msgtpl').html();
	var lastmsg= false;
	

	$('#msgtpl').remove();

	$('#loginform').submit(function(event){
		event.preventDefault();
		socket.emit('login', {
			username : $('#username').val(),
			mail     : $('#mail').val()
		})
	});

	socket.on('logged', function(){
		$('#login').fadeOut();
		$('#message').focus();
	});

	/**
	* Envoi de message
	**/
	$('#form').submit(function(event){
	//alert(citation);
		event.preventDefault();
		if ( $('#message').val() != "" ){ 
		
			if(!citation)	{ socket.emit('newmsg', {message: $('#message').val() }); }
			else			{ socket.emit('newmsg', {message: $('#message').val(),citation: citation }) }
			
		}
		else{alert('Vous devez écrire quelque chose !')}
		$('#message').val('');
		$('#message').focus();
	});
	
	
	
	socket.on('newmsg', function(message){

		if(lastmsg != message.user.id){
			$('#messages').append('<div class="sep"></div>');
			lastmsg = message.user.id;
		}
		if(typeof me != 'undefined'){
			alert('ez');
			/*
			var monCommentaire = new comModel();
			monCommentaire.pseudo 	= message.user.username;
			monCommentaire.contenu 	= message.message;
			// On le sauvegarde dans MongoDB 
			monCommentaire.save(function (err) {
			  if (err) { throw err; }
			  console.log('Commentaire ajouté avec succès !');
			  
			});
			*/
		}
		$('#messages').append('<div class="message">' + Mustache.render(msgtpl, message) + '</div>');
		$(".message").each(function(){
			var val = $(this).html();
			val = val.replace("[content]","<img  style='position:relative;display:inline' src=img/smiley.gif>");
			val = val.replace("[simpson]","<img  style='position:relative;display:inline' src=img/smiley2.gif>");
			val = val.replace("[debile]","<img  style='position:relative;display:inline' src=img/smiley3.gif>");
			val = val.replace("[coeur]","<img  style='position:relative;display:inline' src=img/smiley4.gif>");
			$(this).html(val);
		});
		
		$('#messages').animate({scrollTop : $('#messages').prop('scrollHeight') }, 500);
		annuleCitation();
		
	});


	/**
	* Gestion des connectés
	**/
	socket.on('newusr', function(user){
		$('#users').append('<img src="' + user.avatar + '" id="' + user.id + '" class="'+ user.username +' ">');
		menu();
	})

	socket.on('disusr', function(user){
		$('#' + user.id).remove();
	})
	$('#normal-button').toolbar({
	content: '#user-toolbar-options',
	position: 'top'
});

	redim();
	
})(jQuery);
