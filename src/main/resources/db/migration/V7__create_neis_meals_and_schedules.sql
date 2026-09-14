CREATE TABLE tools_school_meals (
 education_office_code VARCHAR(16) NOT NULL,
 school_code VARCHAR(16) NOT NULL,
 meal_date DATE NOT NULL,
 meal_code VARCHAR(10) NOT NULL,
 meal_name VARCHAR(50) NOT NULL,
 menu_text TEXT NOT NULL,
 origin_text TEXT NOT NULL,
 calorie_text VARCHAR(50) NOT NULL,
 nutrition_text TEXT NOT NULL,
 collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (education_office_code,school_code,meal_date,meal_code),
 KEY ix_school_meals_date (meal_date)
);

CREATE TABLE tools_school_schedules (
 education_office_code VARCHAR(16) NOT NULL,
 school_code VARCHAR(16) NOT NULL,
 academic_year SMALLINT NOT NULL,
 event_date DATE NOT NULL,
 event_name VARCHAR(300) NOT NULL,
 event_content TEXT NOT NULL,
 grade_scope VARCHAR(100) NOT NULL,
 collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (education_office_code,school_code,event_date,event_name),
 KEY ix_school_schedules_date (event_date)
);
