var express = require('express');
var app = express();
var api = require('./api');

var queuedRequestsForGist = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  //console.log('requested /');
  res.sendfile('views/index.html');
});

// Get gist json
// /123.json
app.get(/^\/(\d+)[.]json$/, function(req, res) {
  var id = req.params[0];
  //console.log('requested download of gist with id ' + id);
  if (!queuedRequestsForGist[id])
    queuedRequestsForGist[id] = [];
  api.getGist(id, function(gist) {
    res.send(gist);
    var queuedRequests = queuedRequestsForGist[id];
    for (var i = 0; i < queuedRequests.length; i++) {
      //console.log('doing stuff because gist has been downloaded');
      queuedRequests[i]();
    }
  });
  delete queuedRequestsForGist[id];
});

// Get gist index.html
// /d/123/
app.get(/^\/d\/(\d+)\/$/, function(req, res) {
  var id = req.params[0];
  //console.log('requested gist index.html page with id ' + id);
  var filename = 'index.html';
  //console.log('Still downloading gist: ' + gistDownloadQueue[id]);
  if (!queuedRequestsForGist[id])
    queuedRequestsForGist[id] = [];
  queuedRequestsForGist[id].push(function() {
    api.getFile(id, filename, function(content) { res.send(content); }, function(file) { res.sendfile(file); });
  });
});

// Get gist file
// /d/123/file
app.get(/^\/d\/(\d+)\/(\S+)$/, function(req, res) {
  var id = req.params[0];
  var filename = req.params[1];
  //console.log('requested gist file "' + filename + '" with id ' + id);
  api.getFile(id, filename, function(content) { res.send(content); }, function(file) { res.sendfile(file); });
});

// Get gist page
// /123
app.get(/^\/(\d+)$/, function(req, res) {
  var id = req.params[0];
  //console.log('requested gist page with id ' + id);
  res.sendfile('views/gist.html');
});

// Get user page
// /username
app.get(/^\/(\w+)$/, function(req, res){
  //console.log('requested user');
  res.send('TODO: Get user with name ' + req.params[0]);
});

app.get('*', function(req, res){
  console.log('requested *');
  console.log(req.params);
  res.send('Nothing to see here, move along!');
});

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port ' + port);