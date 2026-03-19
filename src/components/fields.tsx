import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Contents from './index';

interface FieldsProps {
   field: PropertyField;
   onChange: (value: any) => void;
}

const Fields = ({ field, onChange }: FieldsProps) => {
   if (field.type === 'contents') {
      return <Contents field={field} section_slug={field.name} onChange={onChange} />;
   }

   return (
      <div className="space-y-2">
         <Label>{field.label}</Label>
         {field.type === 'textarea' ? (
            <Textarea value={String(field.value ?? '')} onChange={(e) => onChange(e.target.value)} />
         ) : (
            <Input value={String(field.value ?? '')} onChange={(e) => onChange(e.target.value)} />
         )}
      </div>
   );
};

export default Fields;
