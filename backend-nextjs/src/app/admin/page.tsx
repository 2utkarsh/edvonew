import { readFileSync } from 'fs';
import { join } from 'path';

export default function AdminLoginPage() {
  const html = readFileSync(join(process.cwd(), 'public/admin/login.html'), 'utf-8');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
