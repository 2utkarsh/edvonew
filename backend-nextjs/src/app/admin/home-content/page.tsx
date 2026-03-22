import { readFileSync } from "fs";
import { join } from "path";

export default function AdminHomeContentPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/home-content.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
