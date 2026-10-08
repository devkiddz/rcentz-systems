import { SystemsInformationPage } from '@/features/systems/components/SystemsInformationPage';
import { informationPages } from '@/features/systems/content/information-pages';

export const metadata = {
  title: 'Our tools',
  description: informationPages['tools'].description
};
export default function Page() {
  return <SystemsInformationPage slug="tools" />;
}
