import Navigation from '@/components/Navigation';
import ResourceDetail from '@/components/ResourceDetail';

interface ResourcePageProps {
  params: {
    id: string;
  };
}

export default function ResourcePage({ params }: ResourcePageProps) {
  return (
    <>
      <Navigation />
      <ResourceDetail resourceId={parseInt(params.id)} />
    </>
  );
} 