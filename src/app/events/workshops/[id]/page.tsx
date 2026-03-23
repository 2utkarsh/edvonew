import { EventActionPage } from '@/components/events/EventActionPage';

export default async function WorkshopEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventActionPage eventId={id} type="workshop" />;
}
