interface Instructor extends TableCommon {
   skills: string;
   designation: string;
   biography: string;
   resume: string;
   user_id: number;
   user: User;
   status: 'pending' | 'approved' | 'rejected';
   payout_methods: Settings[];
   courses: Course[];
   courses_count: number;
   total_reviews_count: number;
   total_average_rating: number;
   total_enrollments_count: number;
   exams: Exam[];
   exams_count: number;
   total_exam_reviews_count: number;
   total_exam_average_rating: number;
   total_exam_instructors_count: number;
}

