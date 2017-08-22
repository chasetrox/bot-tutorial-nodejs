var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var querystring = require('querystring');

var botID = process.env.BOT_ID;

function respond() {
  console.log("Hit post response");
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = new RegExp('^@coinbot');

  // responds to strings starting with "@coinbot " (w/ space)
  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    // cuts after @coinbot[space]
    console.log("invoked correctly")
    var botResponse = botResponseHandler(request.text.slice(9));
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function botResponseHandler(query) {
  console.log("in handler with query: " + query);
  var tokens = query.split(' ').map(function (s) { return s.toUpperCase()});
  // requests for specific price
  if (tokens[0] === 'price') {
    apiRequest('/data/price', {'fsym': tokens[1], 'tsyms': 'USD'},
              function (responseObj) {
                if (responseObj.USD != undefined) {
                  postMessage("1 " + tokens[1] + " = "+ responseObj.USD + "USD.");
                }
              }, postMessage);
  } else if (tokens[0] === 'convert') {
    if (tokens.length < 2) { postMessage("convert requires 2 currencies"); return; }
    apiRequest('/data/price', {'fsym': tokens[1], 'tsyms': tokens[2]},
              function (responseObj) {
                  console.log(responseObj[tokens[2]]);
                  postMessage("1 " + tokens[1] + " = "+ responseObj[tokens[2]] + tokens[2] +".");
              }, postMessage);
  } else if (tokens[0] === 'help') {
    postMessage("Hi, I'm coinbot. \n To ask me for something, type @coinbot [query] \n Right now, I can give you the price of a currency")
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

function apiRequest(endpoint, body, success, failure) {
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
      success(responseObject);
    });
  })
  coinReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
    failure("something went terribly wrong: " + JSON.stringify(err));
  });
  coinReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
    failure("API timed out.");
  });
  coinReq.end();
}

exports.respond = respond;
