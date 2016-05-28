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
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      var args = queryObj.arg || [];
      client.query(queryObj.query, args, function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
      });
    });
}

var open = function() {

};

var close = function() {

};

var vote = function(option_id) {

};

var show = function() {

};

module.exports = {
    open: open,
    close: close,
    vote: vote,
    show: show
};
