var pg = require('../node_modules/pg');

/*
* queryObj = {
*   query: String,
*   arg: Array of escaped variables (optional)
* }
*
*/
var query = function(queryObj) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query(queryObj.query, queryObj.arg, function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result.rows[0].number);
        //output: 1
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
