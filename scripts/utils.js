var _calculateBarBlocks = function(sum, value) {
    var count = Math.floor(value/sum*20);   // 100% is 20 blocks
    return voteBar(count);
};

var _formatMessage = function(fields) {
    var message = bold('🏆 Top Result 🏆: ' + fields[0].title.titleize()) + '\n\n\n';
    var sum = fields.reduce(function(pv, cv) { return parseInt(pv) + parseInt(cv.value); }, 0);

    for (var i = 0; i < fields.length; i++) {
        var option  = fields[i];
        message += bold(option.title.titleize()) + ':\n' + bold(Math.floor(option.value/sum*100)) + '% - ';

        if (option.value == 0) {
            message += inlineBlock('😭') + '\n\n';
        } else {
            message += _calculateBarBlocks(sum, option.value) + '\n\n';
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
        return a.value > b.value ? 1 : -1;
    });

    var title = "Poll Results for " + info.title.titleize();

    var attachment = [{
            "fallback": title.titleize(),
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
            "title" : ((index+1).toString() + ". " + opts)).titleize(),
            "short" : false
        };
    });

    var attachment = [{
            "fallback": params.title.titleize(),
            "color": "#d4484d",    // good, warning, danger, or HEX value
            "title": params.title.titleize(),
            "fields": fields,
            "footer": "Cast your vote using the slash command /poll vote [option]."
    }];
    var message = {
        "response_type": "in_channel",
        "attachments": attachment
    };
    return message;
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

var voteBar = function(count) {
    var voteBar = '`';
    for (var i = 0; i < count; i++) {
        voteBar += '█';
    }
    voteBar += '`';

    return voteBar;
};


var validToken = function(token) {
    var validToken = process.env.SLACK_TOKEN;
    return validToken ? token === validToken : true;
};

module.exports = {
    openResponse : openResponse,
    resultResponse : resultResponse,
    validToken: validToken
};
