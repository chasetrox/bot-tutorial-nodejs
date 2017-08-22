var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

function respond() {
  console.log("Hit post response");
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = new Regexp('^@coinbot ');

  // responds to strings starting with "@coinbot " (w/ space)
  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage("I can hear you");
    var botResponse = botResponseHandler(request.text.slice(9)); // cuts after @coinbot
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function botResponseHandler(query) {
  var tokens = query.split(' ');
  // requests for specific price
  if ((new Regexp('^price ').match(query))) {
    // apiRequest('/data/price', {'fsym': tokens[1], 'tsyms': 'USD'},
    //           function (responseObj) {
    //               postMessage("1 " + tokens[1] + " = "+ responseObj.USD + "USD.");
    //           });
    postMessage("I will price you");
  } else if ((new Regexp('^convert ').match(query))) {
    // if (tokens.length < 1) { postMessage("convert requires 2 currencies")}
    // apiRequest('/data/price', {'fsym': tokens[1], 'tsyms': tokens[2]},
    //           function (responseObj) {
    //               postMessage("1 " + tokens[1] + " = "+ responseObj[tokens[2]] + tokens[2] +".");
    //           });
    postMessage("I will convert you");
  }

}

function postMessage(botResponse) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
exports.botRes = botResponseHandler;

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
      console.log(responseString);
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
