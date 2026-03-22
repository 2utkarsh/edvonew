import { readFileSync } from "fs";
import { join } from "path";

export default function AdminChallengesPage() {
  const html = readFileSync(join(process.cwd(), "public/admin/challenges.html"), "utf-8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
