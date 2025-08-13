import Navigation from '@/components/Navigation';
import EventDetail from '@/components/EventDetail';

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  return (
    <>
      <Navigation />
      <EventDetail eventId={params.id} />
    </>
  );
}
