const Quote = ({ className = '' }: { className?: string }) => {
   return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
         <path
            d="M20 12C13.373 12 8 17.373 8 24v12h16V24h-8c0-4.418 3.582-8 8-8V12h-4Zm20 0c-6.627 0-12 5.373-12 12v12h16V24h-8c0-4.418 3.582-8 8-8V12h-4Z"
            fill="currentColor"
         />
      </svg>
   );
};

export default Quote;
