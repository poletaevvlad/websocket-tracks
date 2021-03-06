var Socket = function(){
    var that = this;
    
    this.connectedOnce = false;

    this.wsAddress = "wss://" + location.host + "/server";
    this.ws = new WebSocket(this.wsAddress);
    this.code = "     ";
    this.role = "display";
    this.handlers = [];

    function wsOpen(){
        console.log("Connection opened...");
        that.ws.send("request_code");
        that.connectedOnce = true;
    }

    function wsClose(){
        if (! that.connectedOnce){
            console.log("Coudn't connect to the ws server. Retry in 1 second.");
            setTimeout(function(){
                that.ws = new WebSocket(that.wsAddress);
                that.ws.onopen = wsOpen;
                that.ws.onclose = wsClose;
                that.ws.onmessage = wsMessage;
            }, 1000);
        }else{
            that.onDisconnected();
        }
    }

    function wsMessage(message){
        var mes = message.data.split(" ");
        var command = mes[0];
        var i = 0;
        while (i < that.handlers.length && that.handlers[i].command != command){
            i++;
        }
        if (i == that.handlers.length){
            console.log("unknown command", command)
        }else{
            var handler = that.handlers[i];
            handler.handler(mes);
        }
    }

    this.ws.onopen = wsOpen;
    this.ws.onclose = wsClose;
    this.ws.onmessage = wsMessage;

    this.registerHandler("code", function(m){
        that.code = m[1];
        that.ws.send("hello " + that.code + " " + that.role);
        that.onHandshakeCompleted();
    })

    this.registerHandler("controller_connected", function(m){
        that.onControllerConnected();
        console.log("controller connected")
    })

    this.registerHandler("controller_disconnected", function(m){
        that.onControllerDisconnected();
        console.log("controller disconnected")
    })
}

Socket.prototype.registerHandler = function(command, handler){
    this.handlers.push({
        command: command,
        handler: handler
    })
}

Socket.prototype.onHandshakeCompleted = function(){}
Socket.prototype.onControllerConnected = function(){}
Socket.prototype.onControllerDisconnected = function(){}
Socket.prototype.onDisconnected = function(){}