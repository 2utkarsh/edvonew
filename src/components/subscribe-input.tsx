import { useLang } from '@/hooks/use-lang';
import { cn } from '@/lib/utils';
import { FormEventHandler } from 'react';
import ButtonGradientPrimary from './button-gradient-primary';
import InputError from './input-error';
import { useState } from 'react';
import { buildApiUrl } from '@/lib/backend-api';

interface SubscribeInputProps {
   className?: string;
   buttonText?: string;
}

const SubscribeInput = ({ className, buttonText }: SubscribeInputProps) => {
   const { input } = useLang();
   const [email, setEmail] = useState('');
   const [error, setError] = useState<string>('');

   const submit: FormEventHandler = (e) => {
      e.preventDefault();
      setError('');

      fetch(buildApiUrl('/api/subscribes'), {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email }),
      })
         .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
               const message = (data as any)?.message || (data as any)?.error || 'Failed to subscribe';
               throw new Error(message);
            }
            setEmail('');
         })
         .catch((err: any) => {
            setError(err?.message || 'Failed to subscribe');
         });
   };

   return (
      <form onSubmit={submit} className={cn('relative z-10', className)}>
         <div className="bg-background text-primary flex items-center justify-between gap-2 rounded-md border border-gray-400">
            <input
               type="email"
               name="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="h-[50px] w-full px-4 focus:outline-0"
               placeholder={input.email_placeholder}
            />
            <ButtonGradientPrimary type="submit" shadow={false} className="mr-1">
               {buttonText || 'Subscribe'}
            </ButtonGradientPrimary>
         </div>

         <InputError message={error} />
      </form>
   );
};

export default SubscribeInput;
