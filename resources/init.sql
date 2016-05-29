CREATE TABLE poll(
	team_id INT,
	channel_id INT,
	title VARCHAR NOT NULL,
	PRIMARY KEY(team_id, channel_id)
);

CREATE TABLE options(
	id INT,
	team_id INT,
	channel_id INT,
	option VARCHAR NOT NULL,
	votes INT DEFAULT 0,
	PRIMARY KEY(id, team_id, channel_id)
);

CREATE TABLE votes(
	team_id INT,
	channel_id INT,
	user_id INT,
	option_id INT NOT NULL,
	PRIMARY KEY(team_id, channel_id, user_id)
);