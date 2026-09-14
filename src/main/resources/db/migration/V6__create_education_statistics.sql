CREATE TABLE tools_education_collection_runs (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 business_date DATE NOT NULL,
 source VARCHAR(32) NOT NULL,
 status VARCHAR(16) NOT NULL,
 item_count INT NOT NULL DEFAULT 0,
 error_message VARCHAR(1000),
 started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 finished_at TIMESTAMP NULL,
 UNIQUE KEY uk_education_run_date_source (business_date, source)
);

CREATE TABLE tools_education_schools (
 education_office_code VARCHAR(16) NOT NULL,
 school_code VARCHAR(16) NOT NULL,
 education_office_name VARCHAR(100) NOT NULL,
 school_name VARCHAR(150) NOT NULL,
 school_kind VARCHAR(50) NOT NULL,
 location_name VARCHAR(100) NOT NULL,
 address VARCHAR(300) NOT NULL,
 coeducation_type VARCHAR(50) NOT NULL,
 homepage_url VARCHAR(500) NOT NULL,
 foundation_type VARCHAR(50) NOT NULL,
 status VARCHAR(30) NOT NULL,
 opened_on DATE NULL,
 source_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 last_seen_date DATE NOT NULL,
 PRIMARY KEY (education_office_code, school_code),
 KEY ix_education_school_name (school_name),
 KEY ix_education_school_region_kind (location_name, school_kind)
);
