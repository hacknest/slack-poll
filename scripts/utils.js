var resultResponse = function (info, options) {
    var fields = options.map(function (opts, index) {
        return {
            "title" : opts.option,
            "value" : opts.count,
            "short" : false
        };
    });

    fields.sort(function (a, b) {
        return a.count > b.count ? 1 : -1;
    });

    fields[0].title = "🏆" + fields[0].title + "🏆";

    var title = "Poll result: " + options[0].option + " has won";

    var attachment = [{
            "fallback": title,
            "color": "#44cfaa",    // good, warning, danger, or HEX value
            "pretext": "Your poll result",
            "title": "Result",
            "text": title,
            "fields": fields
    }];
    var message = {
        "response_type": "in_channel",
        "attachments": attachment
    };
    return message;
};

var displayResultResponse = function (params) {
    var fields = params.opts.map(function (opts, index) {
        return {
            "title" : (index+1).toString() + ". " + opts,
            "short" : false
        };
    });

    var attachment = [{
            "fallback": params.title,
            "color": "#d4484d",    // good, warning, danger, or HEX value
            "title": params.title,
            "fields": fields
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
}

var voteBar = function(count) {
    var voteBar = '`';
    for (var i = 0; i < count; i++) {
        voteBar += '█';
    }
    voteBar += '`';

    return voteBar;
}


var validToken = function(token) {
    var validToken = process.env.SLACK_TOKEN;
    return validToken ? token === validToken : true;
};

module.exports = {
    displayResultResponse : displayResultResponse,
    resultResponse : resultResponse,
    validToken: validToken
};
