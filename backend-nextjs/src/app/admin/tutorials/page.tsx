import { readFileSync } from "fs";
import { join } from "path";

export default function AdminTutorialsPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/tutorials.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
