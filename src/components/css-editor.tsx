'use client';

import { Textarea } from '@/components/ui/textarea';

interface CssEditorProps {
  value: string;
  setValue: (value: string) => void;
}

const CssEditor = ({ value, setValue }: CssEditorProps) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-slate-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        CSS
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=":root {&#10;  --primary: #2563eb;&#10;}"
        className="min-h-[320px] resize-y border-0 rounded-none font-mono text-sm focus-visible:ring-0"
      />
    </div>
  );
};

export default CssEditor;
