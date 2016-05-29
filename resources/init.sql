CREATE TABLE poll(
	team_id VARCHAR,
	channel_id VARCHAR,
	title VARCHAR NOT NULL,
	user_id VARCHAR NOT NULL,
	PRIMARY KEY(team_id, channel_id)
);

CREATE TABLE options(
	id INT,
	team_id VARCHAR,
	channel_id VARCHAR,
	option VARCHAR NOT NULL,
	PRIMARY KEY(id, team_id, channel_id),
	FOREIGN KEY (team_id, channel_id) REFERENCES poll(team_id, channel_id) ON DELETE CASCADE
);

CREATE TABLE votes(
	team_id VARCHAR,
	channel_id VARCHAR,
	user_id VARCHAR,
	option_id INT NOT NULL,
	PRIMARY KEY(team_id, channel_id, user_id),
	FOREIGN KEY (team_id, channel_id) REFERENCES poll(team_id, channel_id) ON DELETE CASCADE
);