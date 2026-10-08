import { SystemsInformationPage } from '@/features/systems/components/SystemsInformationPage';
import { informationPages } from '@/features/systems/content/information-pages';

export const metadata = {
  title: 'Remote delivery',
  description: informationPages['remote-delivery'].description
};
export default function Page() {
  return <SystemsInformationPage slug="remote-delivery" />;
}
