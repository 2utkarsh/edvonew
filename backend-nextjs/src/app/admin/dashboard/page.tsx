import { readFileSync } from 'fs';
import { join } from 'path';

export default function AdminDashboardPage() {
  if (typeof window === 'undefined') {
    const html = readFileSync(join(process.cwd(), 'public/admin/dashboard.html'), 'utf-8');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return null;
}

