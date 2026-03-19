interface LanguagesProperty extends TableCommon {
   name: string;
   group: string;
   properties: Record<string, string>;
   language: Language;
}

