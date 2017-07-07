var express = require("express");

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"

var server = express();
var bodyParser = require("body-parser");
server.use(express.static("http"));
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json());

server.post("/log/:game", function(req, res) {
//    console.log( req.params );
//    console.log( req.query );
    console.log( req.body );
//    console.log( req.param("logentry") );
    var entry = JSON.parse( req.body.logentry );
    var game = req.params.game; // TEST var
    var fs = require("fs");
    fs.appendFile( "http/" + game + "/log.jsonl", req.body.logentry + "\n", function(err) { if (err) throw err; });

    res.type("text/plain");
    res.write("Logentry: " + entry.id + " for game: " + game + " received");
    res.write("OK");
    res.end();
});

server.get("/log/:game", function(req, res) {
    var game = req.params.game; // TEST var
    var fs = require("fs");
    var data = "";
    fs.readFile( "http/" + game + "/log.jsonl", data, function(err) { if (err) throw err; });

    res.type("text/plain");
    res.write(data);
    res.end();
});
4

server.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});

