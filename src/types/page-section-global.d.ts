interface PageSection extends TableCommon {
   name: string;
   slug: string;
   title?: string;
   sub_title?: string;
   description?: string;
   thumbnail?: string;
   video_url?: string;
   background_image?: string;
   background_color?: string;
   flags: Record<string, boolean>;
   properties: {
      array: any[];
      contents: any[];
      [key: string]: any;
   };
   active: boolean;
   sort: number;
   page_id: number;
   page?: Page;
}
