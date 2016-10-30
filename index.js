var net = require('net');
var TelnetInput = require('telnet-stream').TelnetInput;
var TelnetOutput = require('telnet-stream').TelnetOutput;
var _ = require('underscore');

var telnetInput;
var telnetOutput;

function randomInterval(start, end) {
    var num = 0;
    while (num < start || num > end) {
        num = Math.floor(Math.random() * end);
    }
    return num;
}

const _triggers = {
    'Please enter an account name': 'username\npassword',
    'Your preparations for the rejuvenate spell have been completed': 'cast rejuvenate',
    'pulses|woven the forces': 'prepare rejuvenate'
};

var triggers = {};

for (var key in _triggers) {
    triggers[ key ] = debounceFactory(key, _triggers[ key ]);
}

const aliases = {
    '^9': 'x e\nx w\nx n\nx s\nx sw\nx se\nx nw\nx ne',
    '^1': 'get axes from pack',
    '^2': 'prepare rejuvenate'
};

function debounceFactory(inputStr, outputStr) {
    return _.debounce(function() {
        telnetOutput.write(outputStr + '\n');
        triggers[ inputStr ] = debounceFactory(inputStr, outputStr);
    }, randomInterval(2000, 6000));
}

var socket = net.createConnection(8000, 'mud.accursed-lands.com', function() {
    telnetInput = new TelnetInput();
    telnetOutput = new TelnetOutput();

    socket.pipe(telnetInput).pipe(process.stdout);
    process.stdin.pipe(telnetOutput).pipe(socket);


    //Aliases
    telnetOutput.on('data', function(data) {
        var readStr = data.toString();
        var writeStr;

        for (var key in aliases) {
            var match = readStr.match(key);
            if (match && match.length) {
                telnetOutput.write(aliases[key] + '\n');
            }
        }
    });

    //triggers
    telnetInput.on('data', function(data) {

        var readStr = data.toString();

        for (var key in triggers) {
            var match = readStr.match(key);
            if (match && match.length) {
                triggers[ key ]();
            }
        }
    });
});
