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
            callback(null, result);
        });
    });
};

var open = function() {
    // open poll
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

module.exports = {
    open: open,
    close: close,
    vote: vote,
    results: results
};
