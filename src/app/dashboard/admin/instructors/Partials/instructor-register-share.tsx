'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Copy, QrCode, Share2 } from 'lucide-react';
import { loadScript } from '@/lib/backend-api';

declare global {
   interface Window {
      QRCode?: {
         toDataURL: (
            text: string,
            options?: Record<string, unknown>,
            callback?: (error: Error | null | undefined, url: string) => void
         ) => void;
      };
   }
}

const InstructorRegisterShare = () => {
   const [qrCodeUrl, setQrCodeUrl] = useState('');
   const [copied, setCopied] = useState(false);
   const [shareMessage, setShareMessage] = useState('');

   const registerUrl = useMemo(() => {
      if (typeof window === 'undefined') return '/auth/register?role=instructor';
      return `${window.location.origin}/auth/register?role=instructor`;
   }, []);

   useEffect(() => {
      let cancelled = false;

      async function generateQrCode() {
         if (typeof window === 'undefined') return;

         const loaded = await loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js');
         if (!loaded || typeof window.QRCode?.toDataURL !== 'function') return;

         window.QRCode.toDataURL(
            registerUrl,
            {
               width: 220,
               margin: 1,
               color: {
                  dark: '#0f172a',
                  light: '#ffffff',
               },
            },
            (error, url) => {
               if (!cancelled && !error && url) {
                  setQrCodeUrl(url);
               }
            }
         );
      }

      void generateQrCode();

      return () => {
         cancelled = true;
      };
   }, [registerUrl]);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(registerUrl);
         setCopied(true);
         setShareMessage('Instructor registration link copied.');
         window.setTimeout(() => setCopied(false), 2000);
      } catch {
         setShareMessage('Unable to copy the link on this browser.');
      }
   };

   const handleShare = async () => {
      try {
         if (navigator.share) {
            await navigator.share({
               title: 'EDVO Instructor Registration',
               text: 'Use this link to register as an instructor on EDVO.',
               url: registerUrl,
            });
            setShareMessage('Share sheet opened.');
            return;
         }

         await handleCopy();
      } catch {
         setShareMessage('Sharing was cancelled or not supported.');
      }
   };

   return (
      <Card className="border-primary/15 bg-gradient-to-br from-white to-primary/5">
         <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
               <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <QrCode className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle className="text-xl">Share Instructor Registration</CardTitle>
                  <CardDescription>Send this QR code or link to any instructor so they can open the instructor register form directly.</CardDescription>
               </div>
            </div>
         </CardHeader>
         <CardContent>
            <div className="grid gap-5 lg:grid-cols-[240px,1fr]">
               <div className="flex justify-center rounded-2xl bg-slate-50 p-4">
                  {qrCodeUrl ? (
                     <Image src={qrCodeUrl} alt="Instructor registration QR code" width={220} height={220} className="rounded-2xl border border-slate-200 bg-white p-3" unoptimized />
                  ) : (
                     <div className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                        Generating QR code...
                     </div>
                  )}
               </div>
               <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                     <p className="text-sm font-semibold text-slate-900">Shareable instructor link</p>
                     <p className="mt-2 break-all text-sm text-slate-600">{registerUrl}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     <Button type="button" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied' : 'Copy Link'}
                     </Button>
                     <Button type="button" variant="outline" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                        Share
                     </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                     Send the QR image on WhatsApp or email, or just copy the link and share it directly with the instructor.
                  </p>
                  {shareMessage ? <p className="text-sm font-medium text-primary">{shareMessage}</p> : null}
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

export default InstructorRegisterShare;
