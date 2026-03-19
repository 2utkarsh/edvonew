interface Language extends TableCommon {
   code: string;
   name: string;
   nativeName: string;
   is_active: boolean;
   is_default: boolean;
   properties: LanguagesProperty[];
}

