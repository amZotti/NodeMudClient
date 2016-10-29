var net = require('net');
var TelnetInput = require('telnet-stream').TelnetInput;
var TelnetOutput = require('telnet-stream').TelnetOutput;

var socket = net.createConnection(8000, 'mud.accursed-lands.com', function() {
    var telnetInput = new TelnetInput();
    var telnetOutput = new TelnetOutput();

    socket.pipe(telnetInput).pipe(process.stdout);
    process.stdin.pipe(telnetOutput).pipe(socket);

    //Aliases
    telnetOutput.on('data', function(data) {
        var readStr = data.toString();
        var writeStr;

        if (readStr.match(/^9/)) {
            writeStr = 'x e\nx w\nx n\nx s\nx sw\nx se\nx nw\nx ne';
        } else if (readStr.match(/^1/)) {
            writeStr = 'get axes from pack';
        }

        if (typeof writeStr === 'string') {
            telnetOutput.write(writeStr + '\n');
        }

    });

    //triggers
    telnetInput.on('data', function(data) {

        var readStr = data.toString();
        var writeStr;

        if (readStr.match(/Please enter an account name/g)) {
            writeStr = 'username\npassword';
        }


        if (typeof writeStr === 'string') {
            telnetOutput.write(writeStr + '\n');
        }

    });
});
