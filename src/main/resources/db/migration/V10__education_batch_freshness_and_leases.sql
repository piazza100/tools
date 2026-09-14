CREATE TABLE tools_education_job_leases (
 job_name VARCHAR(40) PRIMARY KEY,
 owner_id VARCHAR(40) NULL,
 lease_until TIMESTAMP NULL
);
INSERT INTO tools_education_job_leases(job_name) VALUES ('NEIS_DAILY'),('SCHOOLINFO');

CREATE TABLE tools_school_collection_freshness (
 education_office_code VARCHAR(20) NOT NULL,
 school_code VARCHAR(20) NOT NULL,
 last_success_date DATE NULL,
 last_attempt_at TIMESTAMP NULL,
 last_status VARCHAR(16) NOT NULL DEFAULT 'READY',
 PRIMARY KEY(education_office_code,school_code)
);
ALTER TABLE tools_neis_daily_batch_state ADD COLUMN last_completed_date DATE NULL;
ALTER TABLE tools_schoolinfo_batch_state ADD COLUMN anchor_year SMALLINT NOT NULL DEFAULT 2026;
UPDATE tools_schoolinfo_batch_state SET anchor_year=YEAR(CURRENT_DATE);
