var db = require('./db');
var DELIMITER = ' ';

var open = function(params, callback) {
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
            attr: 'team_id, channel_id, title',
            values: [params.team_id, params.channel_id, params.title]
        };

        var addOptions = function() {
            // add options
            for (i = 1; i < params.opts.length; i++) {
                var optionRow = {
                    table: 'option',
                    attr: 'id, team_id, channel_id, option',
                    values: [i, param.team_id, params.channel_id, params.opts.[i]]
                };

                db.insertRow(optionRow, function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    callback(err, result);
                });
            }
        };

        if (result.rowCount > 0) {
            return close(params, function() {
                // create poll
                db.insertRow(pollRow, function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    callback(err, result);
                });

                addOptions();
            });
        }

        db.insertRow(pollRow, function(err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(err, result);
        });

        addOptions();
        return;
    });
};

var close = function(params, callback) {
    // tear down DB row
    var oQuery = {
        query : 'DELETE FROM poll WHERE team_id = $1 AND channel_id = $2',
        arg: [params.team_id, params.channel_id]
    };

    db.query(oQuery, function() {
        oQuery.query = 'DELETE FROM options WHERE team_id = $1 AND channel_id = $2';
        db.query(oQuery, function() {
            oQuery.query = 'DELETE FROM votes WHERE team_id = $1 AND channel_id = $2';
            db.query(oQuery, callback);
        });
    });
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
            return callback(null, {text : 'Please specify a valid option for the poll'});
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
                console.log(options);
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
        if (err || pollInfo.rowCount === 0) {
            return callback(err, null);
        }

        queryObj.query = 'SELECT COUNT(*), option FROM options INNER JOIN votes ' + 
                         'ON options.team_id = votes.team_id AND options.channel_id = votes.team_id ' + 
                         'WHERE options.team_id = $1 AND options.channel_id = $2 GROUP BY option';

        db.query(queryObj, function(err, optionsInfo) {
            if (err) {
                return callback(err, null);
            }

            var message = {
                "response_type": "in_channel",
                "text": pollInfo.rows[0].title,
                "attachments": []
            };

            optionsInfo.rows.forEach(function(item) {
                message.attachments.push({"text" : item.option + ", Votes: " + item.count});
            });

            callback(null, message);
        });
    });
};

var doPost = function(req, res) {
    var fields = req.body.text.split(DELIMITER);
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
            var title = fields[1];
            var opts = fields.splice(2, fields.length - 1);
            params.title = title;
            params.opts = opts;
            open(params, callback);
            break;
        case "close":
            results(params, function(err, result) {
                console.error('Failed to retrieve results', err);
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
