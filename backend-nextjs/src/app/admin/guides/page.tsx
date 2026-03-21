import { readFileSync } from "fs";
import { join } from "path";

export default function AdminGuidesPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/guides.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
