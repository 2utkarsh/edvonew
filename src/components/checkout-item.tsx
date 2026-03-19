interface Props {
   from?: 'api' | 'web';
   item: 'exam' | 'course';
   item_id: number | string;
   children: React.ReactNode;
   className?: string;
}

const CheckoutItem = ({ from = 'web', item, item_id, children, className }: Props) => {
   return (
      <a href={route('payments.index', { from, item, id: item_id })} className={className}>
         {children}
      </a>
   );
};

export default CheckoutItem;
