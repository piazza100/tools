export const educationLinks=[
 {path:'/data/education',label:'교육 통계 홈'},
 {path:'/data/education/schools',label:'학교 검색'},
 {path:'/data/education/regions',label:'지역 비교'},
 {path:'/data/education/meals-schedules',label:'급식·학사일정'},
 {path:'/data/education/trends',label:'학생 수 추이·증감'},
 {path:'/data/education/disclosures',label:'전체 공시 자료'},
 {path:'/data/education/collection-status',label:'수집 현황'},
] as const
export const metricLabels:Record<string,string>={student_count:'학생 수',class_count:'학급 수',teacher_count:'교원 수',students_per_class:'학급당 학생 수',students_per_teacher:'교원 1인당 학생 수',male_students:'남학생 수',female_students:'여학생 수',library_books:'도서관 장서',books_per_student:'학생 1인당 장서',meal_students:'급식 학생 수',meal_rate:'급식 참여율',after_school_programs:'방과후 프로그램 수',after_school_students:'방과후 참여 학생 수'}
export const apiTypeLabels:Record<string,string>={'09':'학급·학생·교원 현황','63':'성별 학생 수','22':'교원 현황','58':'도서관 현황','34':'급식 현황','59':'방과후학교 현황'}
export const schoolPath=(office:string,school:string)=>`/data/education/school/${encodeURIComponent(office)}/${encodeURIComponent(school)}`
