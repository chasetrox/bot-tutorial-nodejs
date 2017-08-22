var http, director, cool, bot, router, server, port, querystring;

var HTTPS = require('https');
http        = require('http');
director    = require('director');
cool        = require('cool-ascii-faces');
querystring = require('querystring');
bot         = require('./bot.js');

router = new director.http.Router({
  '/' : {
    post: bot.respond,
    get: ping
  }
});

server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

function ping() {


  body = {
    fsym: 'ETH',
    tsyms: 'BTC'
  };
  var p = '/data/price';
  console.log(JSON.stringify(apiRequest(p, body)));

  this.res.writeHead(200);
  this.res.end("Hey, I'm Cool Guy.");
}

function apiRequest(endpoint, body) {
  var options, body, coinReq;

  var p = endpoint + '?' + querystring.stringify(body);
  options = {
    hostname: 'min-api.cryptocompare.com',
    path: p,
    method: 'GET'
  };

  coinReq = HTTPS.request(options, function(res) {
    res.setEncoding('utf-8');
    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      console.log("end");
      var responseObject = JSON.parse(responseString);
      return responseObject;
    });
  })
  coinReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
    return JSON.parse({'error': 'Something went wrong.'});
  });
  coinReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
    return JSON.parse({'error': 'API timed out'});
  });
  coinReq.end();
}
