import { SystemsInformationPage } from '@/features/systems/components/SystemsInformationPage';
import { informationPages } from '@/features/systems/content/information-pages';

export const metadata = {
  title: 'How we work',
  description: informationPages['how-we-work'].description
};
export default function Page() {
  return <SystemsInformationPage slug="how-we-work" />;
}
