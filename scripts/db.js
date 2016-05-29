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
            return callback(null, result);
        });
    });
};

var insertRow = function(params, callback) {
    var sQuery =
        'INSERT INTO ' + params.table + ' (' + params.attr + ') VALUES (';

    for (i = 1; i <= params.values.length; i++) {
        sQuery += '$' + i + ', ';
    }

    sQuery += ')';

    var queryObj = {
        query: sQuery,
        arg: params.values
    };

    query(queryObj, function(err, result) {
        callback(err, result);
    });
};

module.exports = {
    query: query,
    insertRow: insertRow
};
