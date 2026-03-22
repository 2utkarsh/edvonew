import { readFileSync } from "fs";
import { join } from "path";

export default function AdminCourseReviewsPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/course-reviews.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
