import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Travel Planner - WanderAI',
  description: 'Create your perfect travel itinerary with AI assistance',
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}