var request = require('request');

var _formatMessage = function(fields) {
    var sum = fields.reduce(function(pv, cv) {
        return (parseInt(pv) + parseInt(cv.value));
    }, 0);

    if (sum === 0) {
        return italics('No votes have been cast.');
    }

    var message = bold('🏆 Top Vote 🏆: ' + toTitleCase(fields[0].title)) + '\n\n';
    for (var i = 0; i < fields.length; i++) {
        var option  = fields[i];
        message += bold(toTitleCase(option.title)) + ':\n' + bold(Math.floor(option.value/sum * 100)) + '% - ';

        if (option.value == 0) {
            message += inlineBlock('😭') + '\n\n';
        } else {
            message += voteBar(sum, option.value) + '\n\n';
        }
    }

    return message;
};

var resultResponse = function (info, options) {
    var fields = options.map(function (opts, index) {
        return {
            "title" : opts.option,
            "value" : opts.count,
            "short" : false
        };
    });

    fields.sort(function (a, b) {
        return a.value < b.value ? 1 : -1;
    });

    var title = 'Poll Results for \'' + toTitleCase(info.rows[0].title) + '\'';
    var attachment = [{
            "fallback": title,
            "color": "#44cfaa",    // good, warning, danger, or HEX value
            "title": title,
            "text": _formatMessage(fields),
			"mrkdwn_in": ["title", "text"]
    }];
    var message = {
        "response_type": "in_channel",
        "attachments": attachment
    };
    return message;
};

var openResponse = function (params) {
    var fields = params.opts.map(function (opts, index) {
        return {
            "title" : toTitleCase((index+1).toString() + ". " + opts),
            "short" : false
        };
    });

    var attachment = [{
            "fallback": toTitleCase(params.title),
            "color": "#d4484d",    // good, warning, danger, or HEX value
            "title": toTitleCase(params.title),
            "fields": fields,
            "footer": "Cast your vote using the slash command /poll vote [option]."
    }];
    var message = {
        "response_type": "in_channel",
        "attachments": attachment
    };
    return message;
};

var sendReply = function(url, message) {
    if (!url) {
        return console.error('No url specified for sendReply');
    }

    var options = {
        uri: url,
        method: 'POST',
        json: message
    };

    request(options, function (err, res, body) {
        if (err || res.statusCode != 200) {
            console.error('Unable to reply to response_url: ', err);
        }
    });
};

var bold = function(text) {
    return '*' + text + '*';
};

var italics = function(text) {
    return '_' + text + '_';
};

var strike = function(text) {
    return '~' + text + '~';
};

var inlineBlock = function(text) {
    return '`' + text + '`';
};

var blockQuote = function(text) {
    return '```' + text + '```';
};

var voteBar = function(total, votes) {
    var count = _voteBarCount(total, votes);
    if (count === 0) {
        return '';
    }

    var voteBar = '`';
    for (var i = 0; i < count; i++) {
        voteBar += '█';
    }
    voteBar += '`';

    return voteBar;
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

var _voteBarCount = function(sum, value) {
    return Math.floor(value/sum * 20);   // 100% is 20 blocks
};

var validToken = function(token) {
    var validToken = process.env.SLACK_TOKEN;
    return validToken ? token === validToken : true;
};

module.exports = {
    openResponse : openResponse,
    resultResponse : resultResponse,
    validToken: validToken,
    sendReply: sendReply
};
