CREATE TABLE tools_schoolinfo_disclosures (
 api_type VARCHAR(8) NOT NULL,
 publication_year SMALLINT NOT NULL,
 school_code VARCHAR(20) NOT NULL,
 row_key CHAR(64) NOT NULL,
 school_kind_code VARCHAR(8) NOT NULL,
 region_code VARCHAR(12) NOT NULL,
 region_name VARCHAR(120) NOT NULL,
 school_name VARCHAR(180) NOT NULL,
 payload JSON NOT NULL,
 collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (api_type,publication_year,school_code,row_key),
 KEY ix_schoolinfo_region_type (publication_year,region_code,api_type),
 KEY ix_schoolinfo_school (school_code,publication_year)
);

CREATE TABLE tools_schoolinfo_metrics (
 publication_year SMALLINT NOT NULL,
 school_code VARCHAR(20) NOT NULL,
 region_code VARCHAR(12) NOT NULL,
 school_kind_code VARCHAR(8) NOT NULL,
 metric_code VARCHAR(40) NOT NULL,
 metric_value DECIMAL(18,4) NOT NULL,
 collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (publication_year,school_code,metric_code),
 KEY ix_schoolinfo_metric_region (publication_year,metric_code,region_code)
);

CREATE TABLE tools_schoolinfo_batch_state (
 id TINYINT PRIMARY KEY,
 next_scope_index INT NOT NULL DEFAULT 0,
 completed_cycles INT NOT NULL DEFAULT 0,
 last_started_at TIMESTAMP NULL,
 last_finished_at TIMESTAMP NULL,
 last_status VARCHAR(16) NOT NULL DEFAULT 'READY',
 last_error VARCHAR(1000) NULL,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO tools_schoolinfo_batch_state(id) VALUES(1);
