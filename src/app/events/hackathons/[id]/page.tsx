import { EventActionPage } from '@/components/events/EventActionPage';

export default async function HackathonEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventActionPage eventId={id} type="hackathon" />;
}
