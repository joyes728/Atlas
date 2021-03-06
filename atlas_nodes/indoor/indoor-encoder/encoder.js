module.exports = function(RED){ 
    var checkPin = require("../../extends/check_pin");
    var groveSensor = require("jsupm_rotaryencoder");
    function GroveEncoder(config) {
        RED.nodes.createNode(this, config);
        this.digitalPinA = config.digitalPinA;
        this.digitalPinB = config.digitalPinB;
        this.interval = config.interval;
        var node = this;
        node.digitalPinA = node.digitalPinA>>>0;
        node.digitalPinB = node.digitalPinB>>>0;
        var keyA = 'P'+node.digitalPinA;
        var keyB = 'P'+node.digitalPinB;
        if (checkPin.getDigitalPinValue(keyA)==1){
            node.status({fill: "red", shape: "dot", text: "pin A repeat"});
            console.log('Encoder digital pinA ' + node.digitalPinA +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(keyA)==0){
            checkPin.setDigitalPinValue(keyA, 1);
            node.status({fill: "blue", shape: "ring", text: "pin A check pass"});
            console.log('Button digital pinA ' + node.digitalPinA +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pinA' + node.digitalPinA + ' key value' + checkPin.getDigitalPinValue(keyA));
            return;
        }

        if (checkPin.getDigitalPinValue(keyB)==1){                                        
            node.status({fill: "red", shape: "dot", text: "pin B repeat"});              
            console.log('Encoder digital pinB ' + node.digitalPinB +' repeat');        
            return;                                                      
        }                                                                
        else if (checkPin.getDigitalPinValue(keyB)==0){
            checkPin.setDigitalPinValue(keyB, 1);                              
            node.status({fill: "blue", shape: "ring", text: "pin A B check pass"});
            console.log('Button digital pinB ' + node.digitalPinB +' OK');
        }                                                                 
        else{                                                             
            node.status({fill: "blue", shape: "ring", text: "Unknown"});                                   
            console.log('unknown pinB' + node.digitalPinB + ' key value' + checkPin.getDigitalPinValue(keyB));
            return;                 
        } 
        var is_on = false;
        var waiting;
        var encoder = new groveSensor.RotaryEncoder(node.digitalPinA,node.digitalPinB);
        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            var payload = msg.payload>>>0;
            console.log("recv msg: " + payload);
            if (payload) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    waiting = setInterval(readencodervalue,node.interval);
                }
            }//switch off
            else {
                if (is_on == true) {
                    is_on = false;
                    node.status({fill: "red", shape: "ring", text: "no signal"});
                    clearInterval(waiting);
                    encoder.initPosition();
                }
            }
        });
        this.on('close', function() {
            node.status({fill: "red", shape: "ring", text: "no signal"});
            clearInterval(waiting);
            checkPin.initDigitalPin();  //init pin
        });
        function readencodervalue()
        {
            var position = encoder.position();
            node.status({fill: "red", shape: "dot", text: "position value is " + position});
            var msg = { payload:position };
            node.send(msg);
        }
    }
    RED.nodes.registerType("Encoder", GroveEncoder);
}
