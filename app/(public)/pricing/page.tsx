import { SystemsInformationPage } from '@/features/systems/components/SystemsInformationPage';
import { informationPages } from '@/features/systems/content/information-pages';

export const metadata = {
  title: 'Scope & pricing',
  description: informationPages['pricing'].description
};
export default function Page() {
  return <SystemsInformationPage slug="pricing" />;
}
