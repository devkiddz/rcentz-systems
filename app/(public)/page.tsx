import type { Metadata } from 'next';

import { ServicesHero } from '@/features/services/components/hero/ServicesHero';

import { SystemsOverviewSections } from '@/features/systems/components/SystemsOverviewSections';

export const metadata: Metadata = {
  title: 'Rcentz Systems',
  description:
    'Business applications, customer experiences and connected workflows built around your operations.',
};

export default function SystemsPage() {
  return (
    <>
      <ServicesHero />
      <SystemsOverviewSections />
    </>
  );
}
