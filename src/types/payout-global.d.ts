interface Payout extends TableCommon {
   amount: number;
   status: string;
   payout_method: string;
   transaction_id: string;
   session_id: string;
   user_id: number;
   user: User;
}

