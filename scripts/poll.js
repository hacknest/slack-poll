var pg = require('../node_modules/pg');
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
var query = function(queryObj) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var args = queryObj.arg || [];
        client.query(queryObj.query, args, function(err, result) {
            // client back to the pool
            done();
            if (err) {
                return console.error('error running query', err);
            }
            console.log(result);
            return result;
        });
    });
}

var open = function() {
    // open poll
};

var close = function(params) {
    // tear down DB row
};

var vote = function(params) {

};

var results = function(params) {
    var query =
        'SELECT * FROM poll WHERE team_id = ' + params.team_id
        ' AND channel_id = ' + params.channel_id;

    var queryObj = {
        query: query
    };

    var result = query(queryObj);

    var message = '';
    return message;
};

module.exports = {
    open: open,
    close: close,
    vote: vote,
    results: results
};
