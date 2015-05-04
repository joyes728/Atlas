#!/usr/bin/env node
/*
var debug = require('debug')('iot-server');
var app = require('../../app');

var parseJSON = function(input) {
        var rpc;
      
        if(typeof(input) == "string") {
            rpc = JSON.parse(input);
        } else {
            rpc = input;
        }

        if(rpc && rpc.params) {
            var params = rpc.params;
            if(typeof params == 'string') {
                rpc.params = JSON.parse(params)
            }
        }

        return rpc;

    try {

    } catch(e) {
        return undefined;
    }
};

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {            
    console.log('Express server listening on port ' + server.address().port);
});
var io = require('socket.io').listen(server);
*/

//var io = require('../../../node-red/atlas_hook/').io;
var io = global.atlas.io;
var recvEvent = {};
var outputMap = {};


io.on('connection', function(socket) {
    console.log('a client connected');
    for(idx in recvEvent) {
        console.log('register ' + idx);
        socket.on(idx, recvEvent[idx]);
    }
});

module.exports = function(RED) {

    function remoteIotInput(config) {
 
        RED.nodes.createNode(this, config);

        var node = this;
        var name = config.name;

        node.log('register ' + name);

        recvEvent[name] = function(data) {
            if(typeof data == "object" && data["payload"] != undefined)
                node.send({'payload': data.payload});
            else
                node.send({'payload': data});
        };    

        this.on('close', function() {
            delete recvEvent[name];
        });
    };

    RED.nodes.registerType("iot-input", remoteIotInput);

    function remoteIotOutput(config) {

        RED.nodes.createNode(this, config);
        var node = this;
        var name = config.name;

        node.on('input', function(data) {
            if(typeof data == "object" && data['payload'] != undefined) {
                io.emit(name, data.payload);
            } else {
                io.emit(name, data);
            }
        });
    };

    RED.nodes.registerType("iot-output", remoteIotOutput);

    function dispImg(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var name = config.name;

        node.on('input', function(data) {
            if(typeof data == "object" && data['payload'] != undefined) {
                io.emit(name, data.payload);
            } else {
                io.emit(name, data);
            }
        });        
    }

    RED.nodes.registerType("dispImg", dispImg);

};

