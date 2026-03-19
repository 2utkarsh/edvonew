interface PropertyField {
   type: 'text' | 'icon' | 'textarea' | 'file' | 'image' | 'url' | 'array' | 'object' | 'boolean' | 'number' | 'select' | 'contents';
   label: string;
   name: string;
   value: any;
   options?: { label: string; value: any }[];
   fields?: PropertyField[];
   isArray?: boolean;
}
