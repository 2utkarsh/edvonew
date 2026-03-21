import { readFileSync } from 'fs';
import { join } from 'path';

export default function AdminCoursesPage() {
  const html = readFileSync(join(process.cwd(), 'public/admin/courses.html'), 'utf-8');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
