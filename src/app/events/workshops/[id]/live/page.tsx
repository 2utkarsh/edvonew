import { EventLiveRedirectPage } from '@/components/events/EventActionPage';

export default async function WorkshopLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventLiveRedirectPage eventId={id} type="workshop" />;
}
