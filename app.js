
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io');

var app = express()
  , server = require('http').createServer(app)
  , io = socketio.listen(server);

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('ip,', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/plist/:mode',routes.plist);
app.get('/qsheet/:year/:month/:shainNo',routes.qsheet);
app.get('/summary/:year/:month/:shainNo',routes.summary);
app.get('/entry',routes.entry);
app.get('/entry/:mode',routes.entry);
app.get('/entry_del/:year/:month/:shainNo',routes.entry_del);

app.post('/go',routes.go);
app.post('/entry_add',routes.entry_add);

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
//server.listen(app.get('port'), function(){
server.listen(app.get('port'), app.get('ip'), function(){
//console.log("server listening on port " + app.get('port'));
  console.log("server listening on port " + app.get('port')+ ",ip" + app.get('ip'));
});

io.sockets.on('connection', function(socket) {
  socket.on('entry add', function(data) {
    //io.sockets.emit('entry redisplay', { message: data.value });
    socket.broadcast.emit('entry redisplay', { message: data.value });
  });

  socket.on('polling', function(data) {
    io.sockets.emit('summary redisplay', { message: data.value });
  });
  //socket.on('message:send', function(data) {
  //	io.sockets.emit('message:receive', { message: data.message });
  //});

});
