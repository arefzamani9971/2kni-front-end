import localFont from 'next/font/local';

/** IRANSansX D4 (Persian digits) from @dukani/design-tokens; sets --font-iransansx used by the --dukani-font-family token. */
export const iranSansX = localFont({
  src: [
    { path: '../../../../packages/shared/design-tokens/fonts/IRANSansX-LightD4.woff2', weight: '300' },
    { path: '../../../../packages/shared/design-tokens/fonts/IRANSansX-RegularD4.woff2', weight: '400' },
    { path: '../../../../packages/shared/design-tokens/fonts/IRANSansX-MediumD4.woff2', weight: '500' },
    { path: '../../../../packages/shared/design-tokens/fonts/IRANSansX-DemiBoldD4.woff2', weight: '600' },
    { path: '../../../../packages/shared/design-tokens/fonts/IRANSansX-BoldD4.woff2', weight: '700' },
    { path: '../../../../packages/shared/design-tokens/fonts/IRANSansX-ExtraBoldD4.woff2', weight: '800' },
  ],
  variable: '--font-iransansx',
  display: 'swap',
  fallback: ['Tahoma', 'system-ui', 'sans-serif'],
});
