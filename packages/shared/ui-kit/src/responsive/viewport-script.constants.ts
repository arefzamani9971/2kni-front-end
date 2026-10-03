import { VIEWPORT_ATTRIBUTE, VIEWPORT_DESKTOP_QUERY } from '@dukani/design-tokens';

export const PRE_PAINT = `(function(){try{var m=window.matchMedia&&window.matchMedia(${JSON.stringify(
  VIEWPORT_DESKTOP_QUERY,
)}).matches;document.documentElement.setAttribute(${JSON.stringify(VIEWPORT_ATTRIBUTE)},m?'desktop':'mobile')}catch(e){}})();`;
