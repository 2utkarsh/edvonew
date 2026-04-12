import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const ckeditor4LicenseKey = process.env.CKEDITOR4_LICENSE_KEY?.trim();
  const ckeditor5LicenseKey = process.env.CKEDITOR5_LICENSE_KEY?.trim();

  return (
    <>
      {ckeditor4LicenseKey ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__EDVO_CKEDITOR4_LICENSE_KEY__ = ${JSON.stringify(ckeditor4LicenseKey)};`,
          }}
        />
      ) : null}
      {ckeditor5LicenseKey ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__EDVO_CKEDITOR5_LICENSE_KEY__ = ${JSON.stringify(ckeditor5LicenseKey)};`,
          }}
        />
      ) : null}
      {children}
    </>
  );
}
