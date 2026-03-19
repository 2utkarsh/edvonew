'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReactNode } from 'react';
import { SectionEditorProvider } from './context';
import EditForm from './form';

interface SectionEditorProps {
   section: PageSection;
   actionComponent: ReactNode;
}

const SectionEditor = ({ section, actionComponent }: SectionEditorProps) => {
   return (
      <SectionEditorProvider section={section}>
         <Dialog>
            <DialogTrigger asChild>{actionComponent}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle>Edit Section</DialogTitle>
               </DialogHeader>
               <EditForm />
            </DialogContent>
         </Dialog>
      </SectionEditorProvider>
   );
};

export default SectionEditor;
