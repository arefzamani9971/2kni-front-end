import type { MarketingTranslator } from './ui/i18n/types';
export function createMarketingContent(t: MarketingTranslator) {
  /** Copy of LAND-D01 (Figma 274:3). Kept in one place so marketing can edit text without touching layout. */
  const NAV_LINKS = [
    { href: '#features', label: t('features') },
    { href: '#seller', label: t('forSeller') },
    { href: '#buyer', label: t('forBuyer') },
    { href: '#about', label: t('about') },
  ] as const;

  const HERO = {
    title: t('title'),
    lead: t('lead'),
    note: t('note'),
    visual: {
      label: t('todaySales'),
      amount: t('sampleSales'),
      rows: [t('barcodeSale'), t('sampleLowStock'), t('sampleOrders')],
    },
  } as const;

  const FEATURES = {
    title: t('featuresTitle'),
    lead: t('featuresLead'),
    items: [
      { title: t('quickSaleTitle'), text: t('quickSaleText'), tone: 'shop' },
      { title: t('inventoryTitle'), text: t('inventoryText'), tone: 'shop' },
      { title: t('ordersTitle'), text: t('ordersText'), tone: 'customer' },
    ],
  } as const;

  const AUDIENCES = {
    seller: { title: t('sellerTitle'), text: t('sellerText'), cta: t('sellerCta') },
    buyer: { title: t('buyerTitle'), text: t('buyerText'), cta: t('buyerCta') },
  } as const;

  const TRUST = {
    title: t('trustTitle'),
    text: t('trustText'),
    cta: t('trustCta'),
  } as const;

  const FOOTER = { domain: '2kni.ir', tagline: t('tagline') } as const;

  return { NAV_LINKS, HERO, FEATURES, AUDIENCES, TRUST, FOOTER };
}
