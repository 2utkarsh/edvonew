import { readFileSync } from "fs";
import { join } from "path";

export default function AdminBlogsPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/blogs.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
