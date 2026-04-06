import { getMetadata } from './dom-utils.js';

export const EXL_HOST = 'https://experienceleague.adobe.com';
export const SCHEMA_ORG_CONTEXT = 'https://schema.org';
export const WEB_PAGE_TYPE = 'WebPage';
export const AUDIENCE_TYPE = 'Audience';
export const SOFTWARE_APPLICATION_TYPE = 'SoftwareApplication';
const EPOCH_ISO_DATE = '1970-01-01';

export const ADOBE_PUBLISHER = {
  '@type': 'Organization',
  name: 'Adobe',
  url: `${EXL_HOST}/`,
};

export const toIsoDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const isoDate = date.toISOString().slice(0, 10);
  return isoDate === EPOCH_ISO_DATE ? '' : isoDate;
};

export const getCsvValues = (value = '') =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const dedupeStrings = (values = []) => [...new Set(values)];

export const getFirstNonEmpty = (...values) =>
  values.find((value) => typeof value === 'string' && value.trim()) || '';

export const getPageTitle = (document) =>
  document.querySelector('title')?.textContent?.trim() || '';

export const resolveCanonicalUrl = (document, path) => {
  const rawUrl = getFirstNonEmpty(
    document.head
      ?.querySelector('link[rel="canonical"]')
      ?.getAttribute('href')
      ?.trim(),
    getMetadata(document, 'og:url'),
    `${EXL_HOST}${path}`,
    getMetadata(document, 'publish-url'),
  );

  try {
    const parsed = new URL(rawUrl);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch (e) {
    return rawUrl;
  }
};

export const getLanguageFromPath = (path = '') => {
  const lang = path.split('/')[1];
  return lang || 'en';
};

export const addIfPresent = (target, key, value) => {
  if (value === '' || value === undefined || value === null) return;
  if (Array.isArray(value) && value.length === 0) return;
  target[key] = value;
};
