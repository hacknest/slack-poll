var express = require('express');
var fs = require('fs');
var pg = require('pg');
var poll = require('./scripts/poll');
var app = express();
var poll = require('./scripts/poll');
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));
//For parsing body of POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/', function(req, res) {
	poll.doPost(req, res);
    // res.send('Hello world!');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));

    //Initialize the database
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error('Could not connect to postgres', err);
		}

		//Check for existence of the poll table
		client.query('SELECT to_regclass(\'poll\')', function(err, result) {
			if (!err && result.rows[0].to_regclass) {
				done();
				return;
			}

			//Create tables
			fs.readFile('./resources/init.sql', 'utf8', function(err, data) {
				if (err) {
					done();
					return console.error('Could not read init.sql', err);
				}

				client.query(data, function (err, result) {
					if (err) {
						return console.log('Unable to initialize SQL database');
					}

					console.log('Successfully initialized SQL database');
				});
				done();
			});
		});
	});
});
