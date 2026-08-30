CREATE TABLE tools_calculation_shares (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT NOT NULL,
 share_token VARCHAR(20) NOT NULL UNIQUE,
 calculator_type VARCHAR(40) NOT NULL,
 title VARCHAR(80) NOT NULL,
 input_json JSON NOT NULL,
 result_json JSON NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT tools_fk_share_user FOREIGN KEY(user_id) REFERENCES tools_users(id) ON DELETE CASCADE,
 INDEX tools_idx_share_user_created(user_id,created_at DESC)
);
