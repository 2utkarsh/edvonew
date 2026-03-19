interface Notification extends TableCommon {
   type: string;
   read_at: string | null;
   created_at: string;
   data: { title: string; body: string; url?: string };
   notifiable_id: number;
   notifiable_type: string;
}
