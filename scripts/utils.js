var resultResponse = function (info, options) {
    var fields = options.map(function (opts, index) {
        return {
            "title" : index === 0 ? "🏆" + opts.option + "🏆" : opts.option,
            "value" : opts.count,
            "short" : false
        };
    });

    var title = "Poll result: " + options[0].option + " has won the " + info.rows[0].title + ".";

    var attachment = [{
            "fallback": title,
            "color": "good",    // good, warning, danger, or HEX value
            "pretext": "❤ Your poll result!! ❤",
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
            "color": "danger",    // good, warning, danger, or HEX value
            "title": params.title,
            "fields": fields
    }];
    var message = {
        "response_type": "in_channel",
        "attachments": attachment
    };
    return message;
};

var validToken = function(token) {
    var validToken = process.env.SLACK_TOKEN;
    return validToken ? token === validToken : true;
};

module.exports = {
    displayResultResponse : displayResultResponse,
    resultResponse : resultResponse,
    validToken: validToken
};
