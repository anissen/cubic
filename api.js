var https = require("https");//,
    //secret = require("./secret");

var gists = {};

module.exports = (function () {

  var module = {},
      gists = {};

  module.getGist = function(gistId, callback) {
    var downloadError = function() {
      console.log("ERROR!");
      callback(null);
      return;
    };

    https.get({
      host: "api.github.com",
      path: "/gists/" + gistId  //+ "?client_id=" + secret.id + "&client_secret=" + secret.secret
    }, function(response) {
      var gist = [];
      response.setEncoding("utf-8");
      response
          .on("data", function(chunk) { gist.push(chunk); })
          .on("end", function() {
            var s = response.statusCode;
            if ((s < 200 || s > 300) && s !== 304) {
              return downloadError();
            }

            // Parse the gist response.
            try {
              gist = JSON.parse(gist.join(""));
            } catch (e) {
              return downloadError();
            }

            gists[gist.id] = {
              //history: [{version: commit}],
              files: gist.files,
              updated_at: gist.updated_at,
              description: gist.description,
              user: gist.user ? {login: gist.user.login} : {login: "anonymous"},
              id: gist.id
            };

            callback(gist);
          });
    }).on("error", function (err, gist) { downloadError(); });
  };

  module.getFile = function(gistId, filename, contentCallback, fileCallback) {
    var gist = gists[gistId];
    var filedata = gist.files[filename];
    //console.log('delayed file data (index)', filedata);
    if (filedata) {
      contentCallback(filedata.content);
    } else {
      fileCallback('public/default/' + filename);
    }
  };

  function getUser(userId, callback) {

  }

  return module;
}());
