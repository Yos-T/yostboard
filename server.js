var express = require('express');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var server = express();

server.use(express.static('http'));

server.get('/log', function(req, res) {
    res.type('text/plain');
    res.write('Hello!')
    res.end();
});

server.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});

