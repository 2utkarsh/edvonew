import { readFileSync } from "fs";
import { join } from "path";

export default function AdminTeamPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/team.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
