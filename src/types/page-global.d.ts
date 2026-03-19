interface Page extends TableCommon {
   name: string;
   slug: string;
   type: string;
   title: string;
   description: string;
   meta_description: string;
   meta_keywords: string;
   active: boolean;
   sort: number;
   sections: PageSection[];
}

