import localFont from 'next/font/local';

export const rcentzTypography = localFont({
  src: [
    { path: '../../public/fonts/rcentz/RcentzDisplay-Normal.woff', weight: '400', style: 'normal' },
    { path: '../../public/fonts/rcentz/RcentzDisplay-Regular.woff', weight: '500', style: 'normal' },
    { path: '../../public/fonts/rcentz/RcentzDisplay-Bold.woff', weight: '700', style: 'normal' },
    { path: '../../public/fonts/rcentz/RcentzDisplay-Bolder.woff', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-rcentz-display',
  fallback: ['Arial', 'sans-serif']
});
