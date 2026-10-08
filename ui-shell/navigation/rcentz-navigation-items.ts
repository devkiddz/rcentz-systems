export const rcentzNavigationItems = [
  {
    label: 'Products',
    children: [
      { label: 'Explore products', href: 'https://products.rcentz.cc' }
    ]
  },
  {
    label: 'Solutions',
    children: [
      { label: 'Business applications', href: '/solutions' },
      { label: 'How we work', href: '/how-we-work' },
      { label: 'Our tools', href: '/tools' },
      { label: 'Remote delivery', href: '/remote-delivery' }
    ]
  },
  {
    label: 'Resources',
    children: [
      { label: 'Docs', href: 'https://rcentz.cc/docs', group: 'Learn' },
      {
        label: 'Knowledge base',
        href: 'https://rcentz.cc/knowledge-base',
        group: 'Learn'
      },
      { label: 'Blog', href: 'https://rcentz.cc/blog', group: 'Learn' },
      {
        label: 'Changelog',
        href: 'https://rcentz.cc/changelog',
        group: 'Learn'
      },
      { label: 'Business applications', href: '/solutions', group: 'Build' },
      { label: 'Our tools', href: '/tools', group: 'Build' },
      { label: 'How we work', href: '/how-we-work', group: 'Build' },
      { label: 'Start a project', href: '/start-project', group: 'Build' },
      {
        label: 'Products',
        href: 'https://products.rcentz.cc',
        group: 'Explore'
      },
      {
        label: 'About Rcentz',
        href: 'https://rcentz.cc/about',
        group: 'Explore'
      },
      {
        label: 'GitHub',
        href: 'https://github.com/devkiddz/rcentz-systems',
        group: 'Explore'
      }
    ]
  },
  { label: 'Company', href: 'https://rcentz.cc/about' },
  { label: 'Pricing', href: '/pricing' }
] as const;
