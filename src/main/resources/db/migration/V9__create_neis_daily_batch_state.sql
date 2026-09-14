CREATE TABLE tools_neis_daily_batch_state (
 id TINYINT PRIMARY KEY,
 next_school_offset INT NOT NULL DEFAULT 0,
 completed_cycles INT NOT NULL DEFAULT 0,
 last_started_at TIMESTAMP NULL,
 last_finished_at TIMESTAMP NULL,
 last_status VARCHAR(16) NOT NULL DEFAULT 'READY',
 last_error VARCHAR(1000) NULL,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO tools_neis_daily_batch_state(id) VALUES(1);
