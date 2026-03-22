import { readFileSync } from "fs";
import { join } from "path";

export default function AdminJobSuccessStoriesPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/job-success-stories.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
