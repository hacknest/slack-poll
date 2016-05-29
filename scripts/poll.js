var pg = require('pg');
/*
* Query wrapper that connects to the database and accepts a queryObj
* @param queryObj - A JSON structure that consists of a query String
*                   and an array of values be to escaped.
*
*                   var queryObj = {
*                       query: String,
*                       arg: Array of escaped variables (optional)
*                   }
*
*/

var DELIMITER = ' ';

var query = function(queryObj, callback) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            console.error('error fetching client from pool', err);
            return callback(err, null);
        }
        var args = queryObj.arg || [];
        client.query(queryObj.query, args, function(err, result) {
            // client back to the pool
            done();
            if (err) {
                console.error('error running query', err);
                return callback(err, null);
            }
            console.log(result);
            return callback(null, result);
        });
    });
};

var pgInsertRow(params, callback) {

    var sQuery =
        'INSERT INTO $1 ($2) VALUES ($3)';

    var columns =
    var queryObj = {
        query: sQuery,
        arg: [params.table, params.attr, params.values]
    };
    query(sQuery, function(err, result) {
        callback(err, result);
    });
};

var open = function(params, callback) {
    var sQuery =
        'SELECT channel_id FROM poll WHERE team_id = $1';

    var queryObj = {
        query: sQuery,
        arg: [params.team_id]
    };

    query.(queryObj, function(err, result) {
        if (err) {
            return callback(false);
        }

        var createRow = function() {
            var row = {
                table: 'poll',
                attr: 'team_id, channel_id, title',
                values: params.team_id + ', ' + params.channel_id + ', ' + params.title
            }

            pgInsertRow(row, function(err, result) {
                if (err) {
                    return callback(false);
                }
                return callback(result)
            });
        };

        if (result.rowCount > 0) {
            return close(createRow());
        }

        return createRow();
    });
};

var close = function(params) {
    // tear down DB row
};

var vote = function(params) {

};

var results = function(params, callback) {
    var sQuery =
        'SELECT title FROM poll WHERE team_id = $1 AND channel_id = $2';

    var queryObj = {
        query: sQuery,
        arg: [params.team_id, params.channel_id]
    };

    query(queryObj, function(err, pollInfo) {
        if (err || pollInfo.rowCount === 0) {
            return callback(err, null);
        }

        queryObj.query = 'SELECT option, votes FROM options WHERE team_id = $1 AND channel_id = $2';

        query(queryObj, function(err, optionsInfo) {
            if (err) {
                return callback(err, null);
            }

            var message = {
                "response_type": "in_channel",
                "text": pollInfo.rows[0].title,
                "attachments": []
            };

            optionsInfo.rows.forEach(function(item) {
                message.attachments.push({"text" : item.option + ", Votes: " + item.votes});
            });

            callback(message);
        });
    });
};

var doPost = function(req, res) {
	var fields = req.params.text.split(DELIMITER);
	var command = fields[0].toLowerCase();
	var params = {
		"title" : title,
		"team_id" : req.params.team_id,
		"team_domain" : req.params.team_domain,
		"channel_id" : req.params.channel_id,
		"channel_name" : req.params.channel_name,
		"user_id" : req.params.user_id,
		"user_name" : req.params.user_name,
		"command" : req.params.command,
		"text" : req.params.text,
		"response_url" : req.params.response_url
	}
	var callback = function (err, result) {
		if (err)
			return;
		res.json(result);
	}

	switch (command) {
		case "open":
			var title = fields[1];
			var opts = fields.splice(2, fields.length - 1);
			open(params, callback);
			break;
		case "close":
			result(params, callback);
			break;
		case "vote":
			vote(params, callback);
			break;
		default:
			var result = {
			    "text": "No command " + command + "found"
			}
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
