var restify = require('restify');
var MongoClient = require('mongodb').MongoClient;

var mongolabUrl = "mongodb://heroku_app26368548:vsp63eoa5unic43qsdhgl07idk@ds045938.mongolab.com:45938/heroku_app26368548";

var database = null;

function getDeviceIPs(req, res, next) {
	if (database) {
		var collection = database.collection("device");
		var all = collection.find({});
		all.toArray(function(err, docs) {
			if (err) {
				console.error(err);
			} else {
				console.log(docs);
			}
		});
	}

  res.send('hello ' + req.params.name);
  next();
}

function postDeviveIP(req, res, next) {
	var name = req.params.name;
	console.log(name);

	var ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  console.log(ip);

  var timestamp = new Date().getTime();

  if (database) {
		var collection = database.collection("device");
		var all = collection.update(
			{name: name},
			{$push: {ips: ip}, $set: {timestamp: timestamp}},
			{upsert: true},
			function(err, docs) {
				if (err) {
					console.error(err);
				} else {
					console.log(docs);
				}
			}
		);
	}

	res.send('ip: ' + ip);
	next();
}

var server = restify.createServer();
// route
server.get('/device/:name', getDeviceIPs);
server.head('/device/:name', getDeviceIPs);
server.post('/device/:name', postDeviveIP);

var port = process.env.PORT || 5000;

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

MongoClient.connect(mongolabUrl, function(err, db) {
	if (err) {
		console.error(err);
	} else {
		database = db;
		console.log("db ok");
	}
});