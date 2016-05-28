CREATE TABLE poll(
	team_id INT,
	channel_id INT,
	title VARCHAR,
	PRIMARY KEY(team_id, channel_id)
);

CREATE TABLE options(
	id SERIAL,
	team_id INT,
	channel_id INT,
	option VARCHAR,
	votes INT,
	PRIMARY KEY(id, team_id, channel_id)
);

CREATE TABLE votes(
	team_id INT,
	channel_id INT,
	user_id INT,
	option_id INT,
	PRIMARY KEY(team_id, channel_id, user_id)
);