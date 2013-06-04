var http = require('http');
var md5 = require('MD5');

httpServer = http.createServer(function(req, res){
	console.log('Un utilisateur a affiché la page');
});

httpServer.listen(1337);

var io = require('socket.io').listen(httpServer);

/* DEBUT BDD */
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/tchat', function(err) {
  if (err) { throw err; }
}); //mongoose.connection.close();

var comSchema = new mongoose.Schema({
  pseudo : { type : String },
  contenu : String,
  date : { type : Date, default : Date.now }
});

// Création du Model
var comModel = mongoose.model('commentaires', comSchema);

/* Je delete la base
comModel.remove({ pseudo : 'Gauvain' }, function (err) {
  if (err) { throw err; }
  console.log('Commentaires avec pseudo Gauvain supprimés !');
});
*/

comModel.find(null, function (err, comms) {
  if (err) { throw err; }
  console.log(comms);
});

/* FIN BDD */


var users = {};
var messages = [];
var history = 3;

io.sockets.on('connection', function(socket){

	var me = false;
	console.log('Nouvel utilisateur');

	for(var k in users){
		socket.emit('newusr', users[k]);
	}
	for(var k in messages){
		socket.emit('newmsg', messages[k]);
	}

	/**
	* On a reçu un message
	**/
	socket.on('newmsg', function(message,citation){
		
		message.user = me;
		date = new Date();
		if (citation) { message.citation = citation; };
		message.h = date.getHours();
		message.m = date.getMinutes();
		messages.push(message);
		if(messages.length > history){
			messages.shift();
		}
		io.sockets.emit('newmsg', message);

	});

	/**
	* Je me connecte
	**/
	socket.on('login', function(user){
		me = user;
		me.id = md5(user.mail);	// On génère une clef unique par utilisateur (basé sur le mail)
		me.avatar = 'https://gravatar.com/avatar/' + md5(user.mail) + '?s=50';
		me.mail = null; 		// On ne renvoit pas l'email publiquement
		me.username = user.username;
		socket.emit('logged');
		users[me.id] = me;
		io.sockets.emit('newusr', me);
	
	});

	/**
	* Je quitte le tchat
	**/
	socket.on('disconnect', function(){
		if(!me){
			return false;
		}
		delete users[me.id];
		io.sockets.emit('disusr', me);
	})

});
