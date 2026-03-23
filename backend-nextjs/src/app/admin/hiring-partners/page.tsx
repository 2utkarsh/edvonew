import { readFileSync } from 'fs';
import { join } from 'path';

export default function HiringPartnersAdminPage() {
  const html = readFileSync(join(process.cwd(), 'public/admin/hiring-partners.html'), 'utf-8');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
