ALTER TABLE tools_price_collection_runs
 ADD COLUMN attempt_count INT NOT NULL DEFAULT 1 AFTER status,
 ADD COLUMN forced_at TIMESTAMP NULL AFTER attempt_count;
