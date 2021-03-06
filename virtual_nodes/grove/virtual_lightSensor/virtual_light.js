module.exports = function(RED) {
    function LightVirtual(config) {
        RED.nodes.createNode(this, config);
       
        //sensor value range 
        this.range = 150;
        //delay between emissions
        this.interval = config.interval;
        this.signal = config.signal;
        //a status bar that appears below the node
        this.status({fill: "red", shape: "ring", text: "no signal"});
        var node = this;
        var v_signal;
        var is_on = false;
        var loop;

        //periodically switch between HIGH/MEDIUM/LOW values
        if (this.signal === 'CYCLE') {
            var values = [0, (0.25*node.range), (0.5*node.range), (0.75*node.range), node.range];
            var i = 0;
        }

        var emit = function emit() {
            if (node.signal === 'CYCLE') {
                v_signal = values[i];
                if (i == 4) {
                    i = 0;
                } else {
                    i++;
                }
            } else if (node.signal === 'RANDOM') {
                v_signal = Math.floor(Math.random()*node.range);
                console.log("Virtual signal: " + v_signal);
            }
            msg = {payload: v_signal};
            //change status
            var textTemp = "Detect light value is " + v_signal;
            node.status({fill: "green", shape: "dot", text: textTemp});
            node.send(msg);
        }

        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            if ((msg.payload === "toggle") || (msg.payload == 1)) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    loop = setInterval(emit, node.interval);
                }
                
            }//switch off
            else {
                if (is_on == true) {
                    is_on = false;
                    node.status({fill: "red", shape: "ring", text: "no signal"});
                    clearInterval(loop);
                }
            }
        });

        //clean up when re-deploying
        this.on('close', function() {
            //without this, old intervals aren't cleared and run forever
            clearInterval(loop);
        });
    }
    
    RED.nodes.registerType("LightSensor", LightVirtual);
}
