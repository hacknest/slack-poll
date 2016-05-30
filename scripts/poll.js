var db = require('./db');
var utils = require('./utils');
var POLL_TIMEOUT = 600000; // 10 minutes

var _setClosePollTimer = function(params) {
    var timeout =  setTimeout(function() {
        results(params, function(err, result) {
            if (err || result === null) {
                console.log("Poll has been closed or an error has occurred");
                return;
            }

            var message = {
                "response_type" : "in_channel",
                "text" : "Poll was automatically closed."
            };

            var callback = function() {
                utils.sendReply(params.request_url, message);
            };
            close(params, callback);
        });
    }, POLL_TIMEOUT);
};

var open = function(params, callback) {
    if (params.opts.length === 0) {
        return callback(null, { text: "Please specify options for the poll" });
    }
    var sQuery =
        'SELECT channel_id FROM poll WHERE team_id = $1';

    var queryObj = {
        query: sQuery,
        arg: [params.team_id]
    };

    db.query(queryObj, function(err, result) {
        if (err) {
            return callback(err, null);
        }

        var pollRow = {
            table: 'poll',
            attr: 'team_id, channel_id, title, user_id',
            values: [params.team_id, params.channel_id, params.title, params.user_id]
        };

        var addOptions = function() {
            // add options
            for (var i = 1; i <= params.opts.length; i++) {
                var optionRow = {
                    table: 'options',
                    attr: 'id, team_id, channel_id, option',
                    values: [i, params.team_id, params.channel_id, params.opts[i - 1]]
                };

                db.insertRow(optionRow, function() {});
            }
        };

        if (result.rowCount > 0) {
            return close(params, function() {
                // create poll
                db.insertRow(pollRow, function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }

                    addOptions();
                    var message = utils.openResponse(params);
                    callback(null, { text: 'Posting your poll now' });

                    utils.sendReply(params.response_url, message);
                    // _setClosePollTimer(params);
                });
            });
        }

        db.insertRow(pollRow, function(err, result) {
            if (err) {
                return callback(err, null);
            }

            addOptions();
            var message = utils.openResponse(params);
            callback(null, { text: 'Posting your poll now' });

            utils.sendReply(params.response_url, message);
            // _setClosePollTimer(params);
        });
    });
};

var close = function(params, callback) {
    // tear down DB row
    var oQuery = {
        query : 'DELETE FROM poll WHERE team_id = $1 AND channel_id = $2',
        arg: [params.team_id, params.channel_id]
    };

    db.query(oQuery, callback);
};

var vote = function(params, callback) {
    //Check if specified option is valid
    var oQuery = {
        query : 'SELECT * FROM options WHERE id = $1 AND team_id = $2 AND channel_id = $3',
        arg: [params.id, params.team_id, params.channel_id]
    };

    db.query(oQuery, function(err, results) {
        if (err) {
            console.log('Unable to retrieve results from options', err);
            return callback(err, null);
        }

        if (results.rowCount === 0) {
            return callback(null, {text : 'Either no poll is open or you have specified an invalid option'});
        }

        //Valid option. Now check if user has already voted
        oQuery.query = 'SELECT * FROM votes WHERE team_id = $1 AND channel_id = $2 AND user_id = $3';
        oQuery.arg = [params.team_id, params.channel_id, params.user_id];

        db.query(oQuery, function(err, results) {
            if (err) {
                console.log('Unable to retrieve results from votes', err);
                return callback(err, null);
            }

            if (results.rowCount === 1) {
                //User has already voted, update vote
                var optionId = results.rows[0].option_id;
                oQuery.query = 'UPDATE votes SET option_id = $1 WHERE team_id = $2 AND channel_id = $3 AND user_id = $4';
                oQuery.arg = [optionId, params.team_id, params.channel_id, params.user_id];
                db.query(oQuery, function(err, results) {
                    if (err) {
                        console.log('Unable to update vote', err);
                        return callback(err, null);
                    }

                    return callback(null, { text: 'Successfully updated your vote' });
                });
            } else {
                //User hasn't voted yet, insert into table
                var options = {
                    table : 'votes',
                    attr : 'team_id, channel_id, user_id, option_id',
                    values : [params.team_id, params.channel_id, params.user_id, params.id]
                };

                db.insertRow(options, function(err, results) {
                    if (err) {
                        console.log('Unable to insert vote', err);
                        return callback(err, null);
                    }

                    return callback(null, { text: 'Successfully cast your vote' });
                });
            }
        });
    });
};

var results = function(params, callback) {
    var sQuery =
        'SELECT title FROM poll WHERE team_id = $1 AND channel_id = $2';

    var queryObj = {
        query: sQuery,
        arg: [params.team_id, params.channel_id]
    };

    db.query(queryObj, function(err, pollInfo) {
        if (err) {
            return callback(err, null);
        }

        if (pollInfo.rowCount === 0) {
            return callback(null, { text: 'No poll is currently open.' });
        }

        queryObj.query = '(SELECT COUNT(*), option FROM options INNER JOIN votes ' +
                             'ON options.team_id = votes.team_id AND ' +
                             'options.channel_id = votes.channel_id ' +
                             'AND options.id = votes.option_id ' +
                             'WHERE options.team_id = $1 AND ' +
                             'options.channel_id = $2 GROUP BY option) ' +
                         'UNION ALL ' +
                         '(SELECT 0, option FROM options WHERE NOT EXISTS ' +
                            '(SELECT * FROM votes WHERE '+
                            'votes.option_id = options.id AND ' +
                            'votes.team_id = options.team_id AND ' +
                            'votes.channel_id = options.channel_id) AND ' +
                            'options.team_id = $1 AND ' +
                            'options.channel_id = $2)';

        db.query(queryObj, function(err, optionsInfo) {
            if (err) {
                return callback(err, null);
            }

            var message = utils.resultResponse(pollInfo, optionsInfo.rows);
            callback(null, { text: 'Posting results of poll now' });

            utils.sendReply(params.response_url, message);
        });
    });
};

var doPost = function(req, res) {
    var fields = req.body.text.split(' ');
    var command = fields[0].toLowerCase();
    var params = {
        "team_id" : req.body.team_id,
        "team_domain" : req.body.team_domain,
        "channel_id" : req.body.channel_id,
        "channel_name" : req.body.channel_name,
        "user_id" : req.body.user_id,
        "user_name" : req.body.user_name,
        "command" : req.body.command,
        "text" : req.body.text,
        "response_url" : req.body.response_url
    };
    var callback = function (err, result) {
        if (err)
            res.send('An error has occurred');
        else
            res.json(result);
    };

    switch (command) {
        case "open":
            var options = req.body.text.split(':');
            if (options.length !== 2) {
                return res.send('Invalid format used. Please use /poll help for more information');
            }

            var title = options[0].substring(options[0].indexOf(' ')).trim();
            var opts = options[1].split(',').map(function(s) { return s.trim(); });

            params.title = title;
            params.opts = opts;
            open(params, callback);
            break;
        case "close":
            results(params, function(err, result) {
                if (err) {
                    console.error('Failed to retrieve results', err);
                    return callback(err, null);
                }
                close(params, function() {});
                callback(err, result);
            });
            break;
        case "vote":
            var id = fields[1];
            if (isNaN(id)) {
                return res.send('Please specify a valid option number.');
            }
            params.id = id;
            vote(params, callback);
            break;
        case "help":
            var message = {
                "text": "You can open a poll by /poll open [title]:[opt1], [opt2], [opt3], ..." +
                        "\nYou can close a poll by /poll close" +
                        "\nYou can cast a vote by /poll vote [option number]"
            };
            res.json(message);
            break;
        default:
            var result = {
                "text": "No command " + command + " found"
            };
            res.json(result);
            break;
    }
};

module.exports = {
    open: open,
    close: close,
    vote: vote,
    results: results,
    doPost : doPost
};
