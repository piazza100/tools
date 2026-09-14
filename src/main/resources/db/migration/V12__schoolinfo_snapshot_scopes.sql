ALTER TABLE tools_schoolinfo_disclosures ADD COLUMN scope_region_code VARCHAR(10) NOT NULL DEFAULT '', ADD COLUMN scope_kind_code VARCHAR(8) NOT NULL DEFAULT '';
UPDATE tools_schoolinfo_disclosures SET scope_region_code=LEFT(region_code,5),scope_kind_code=school_kind_code;
CREATE INDEX ix_schoolinfo_scope ON tools_schoolinfo_disclosures(api_type,publication_year,scope_region_code,scope_kind_code);
ALTER TABLE tools_schoolinfo_metrics ADD COLUMN source_api_type VARCHAR(8) NOT NULL DEFAULT '';
UPDATE tools_schoolinfo_metrics SET source_api_type=CASE WHEN metric_code IN ('male_students','female_students') THEN '63' WHEN metric_code IN ('library_books','books_per_student') THEN '58' WHEN metric_code IN ('meal_students','meal_rate') THEN '34' WHEN metric_code IN ('after_school_programs','after_school_students') THEN '59' ELSE '09' END;
