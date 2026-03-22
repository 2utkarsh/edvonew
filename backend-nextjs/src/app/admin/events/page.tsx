import { readFileSync } from "fs";
import { join } from "path";

export default function AdminEventsPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/events.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
