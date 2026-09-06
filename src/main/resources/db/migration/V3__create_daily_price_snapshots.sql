CREATE TABLE tools_price_collection_runs (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 business_date DATE NOT NULL,
 started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 finished_at TIMESTAMP NULL,
 status VARCHAR(16) NOT NULL,
 item_count INT NOT NULL DEFAULT 0,
 error_message VARCHAR(1000) NULL,
 UNIQUE KEY tools_uk_price_run_date (business_date)
);

CREATE TABLE tools_price_items (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 source_item_code VARCHAR(40) NOT NULL,
 variety_code VARCHAR(40) NOT NULL DEFAULT '',
 grade_code VARCHAR(40) NOT NULL DEFAULT '',
 item_name VARCHAR(100) NOT NULL,
 variety_name VARCHAR(100) NULL,
 grade_name VARCHAR(100) NULL,
 display_unit VARCHAR(40) NOT NULL,
 market_type VARCHAR(20) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY tools_uk_price_item (source_item_code,variety_code,grade_code,market_type)
);

CREATE TABLE tools_daily_price_snapshots (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 item_id BIGINT NOT NULL,
 price_date DATE NOT NULL,
 original_price DECIMAL(18,4) NOT NULL,
 normalized_kg_price DECIMAL(18,4) NULL,
 day_ago_price DECIMAL(18,4) NULL,
 week_ago_price DECIMAL(18,4) NULL,
 month_ago_price DECIMAL(18,4) NULL,
 year_ago_price DECIMAL(18,4) NULL,
 collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT tools_fk_daily_price_item FOREIGN KEY(item_id) REFERENCES tools_price_items(id),
 UNIQUE KEY tools_uk_daily_price_item_date (item_id,price_date),
 INDEX tools_idx_daily_price_date (price_date,item_id)
);

CREATE TABLE tools_price_raw_responses (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 collection_run_id BIGINT NOT NULL,
 page_no INT NOT NULL,
 response_json JSON NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT tools_fk_price_raw_run FOREIGN KEY(collection_run_id) REFERENCES tools_price_collection_runs(id) ON DELETE CASCADE,
 UNIQUE KEY tools_uk_price_raw_page (collection_run_id,page_no)
);
