var resultResponse = function (info, options) {
    var fields = options.map(function (opts, index) {
        return {
            "title" : index === 0 ? "🏆" + opts.option + "🏆", opts.option,
            "value" : opts.counts,
            "short" : false
        }
    });

    var title = "Poll result: " + options[0].option " has won the " + info.rows[0].title + ".";

    var attachment = {
            "fallback": title,
            "color": "good",    // good, warning, danger, or HEX value
            "pretext": "❤ Your poll result!! ❤",
            "title": "Result",
            "text": title,
            "fields": fields
    }
    var message = {
        "response_type": "in_channel",
        "attachments": attachement
    };
    return message;
};

var displayResultResponse = function (params) {
    var options = params.opts.map(function (opts, index) {
        return {
            "title" : index.toString() + ". :" + opts.option,
            "short" : false
        }
    });

    var title = "You poll:" + params.title;
    var attachment = {
            "fallback": title,
            "color": "danger",    // good, warning, danger, or HEX value
            "title": title,
            "fields": fields
    }
    var message = {
        "response_type": "in_channel",
        "attachments": attachement
    };
    return message;
}

module.exports = {
    displayResultResponse : displayResultResponse,
    resultResponse : resultResponse
};