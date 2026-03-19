interface User extends TableCommon {
   name: string;
   email: string;
   status: number | null;
   social_links: { host: string; profile_link: string }[] | null;
   role: string;
   about: string | null;
   photo: string | null;
   email_verified_at: string | null;
   password: string;
   instructor_id: number | null;
   remember_token?: string;
}

