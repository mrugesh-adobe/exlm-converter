import { getMetadata } from '../dom-utils.js';
import {
  SCHEMA_ORG_CONTEXT,
  WEB_PAGE_TYPE,
  AUDIENCE_TYPE,
  SOFTWARE_APPLICATION_TYPE,
  ADOBE_PUBLISHER,
  toIsoDate,
  getCsvValues,
  dedupeStrings,
  getFirstNonEmpty,
  getPageTitle,
  resolveCanonicalUrl,
  getLanguageFromPath,
  addIfPresent,
} from '../schema-helpers.js';

const ARTICLE_TYPE_MAP = {
  Documentation: 'HowTo',
  Certification: 'HowTo',
  Tutorial: 'TechArticle',
  Troubleshooting: 'TechArticle',
};

const DEFAULT_TYPE = 'HowTo';

const buildOrderedSchema = ({
  type,
  canonicalUrl,
  headline,
  description,
  inLanguage,
  dateCreated,
  datePublished,
  dateModified,
  image,
  audienceType,
  about,
  keywords,
}) => {
  const schema = {};

  addIfPresent(schema, '@context', SCHEMA_ORG_CONTEXT);
  addIfPresent(schema, '@type', type);
  addIfPresent(schema, '@id', `${canonicalUrl}#/schema`);
  addIfPresent(schema, 'url', canonicalUrl);
  addIfPresent(schema, 'headline', headline);
  addIfPresent(schema, 'description', description);
  addIfPresent(schema, 'inLanguage', inLanguage);
  addIfPresent(schema, 'dateCreated', dateCreated);
  addIfPresent(schema, 'datePublished', datePublished);
  addIfPresent(schema, 'dateModified', dateModified);
  addIfPresent(schema, 'image', image);
  addIfPresent(schema, 'publisher', ADOBE_PUBLISHER);

  if (audienceType.length > 0) {
    addIfPresent(schema, 'audience', {
      '@type': AUDIENCE_TYPE,
      audienceType,
    });
  }

  if (about.length > 0) {
    addIfPresent(
      schema,
      'about',
      about.map((name) => ({
        '@type': SOFTWARE_APPLICATION_TYPE,
        name,
      })),
    );
  }

  addIfPresent(schema, 'keywords', keywords);
  addIfPresent(schema, 'mainEntityOfPage', {
    '@type': WEB_PAGE_TYPE,
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: headline,
    description,
  });

  return schema;
};

export const buildArticleSchema = (document, path) => {
  const canonicalUrl = resolveCanonicalUrl(document, path);
  const headline = getFirstNonEmpty(
    getMetadata(document, 'title'),
    getMetadata(document, 'og:title'),
    getMetadata(document, 'twitter:title'),
    getPageTitle(document),
  );
  const description = getFirstNonEmpty(
    getMetadata(document, 'description'),
    getMetadata(document, 'og:description'),
    getMetadata(document, 'twitter:description'),
    headline,
  );
  const contentType = getMetadata(document, 'coveo-content-type');
  const type = ARTICLE_TYPE_MAP[contentType] || DEFAULT_TYPE;
  const inLanguage = getLanguageFromPath(path);

  if (!canonicalUrl || !headline || !description) return null;

  const dateModified = toIsoDate(
    getFirstNonEmpty(
      getMetadata(document, 'modified-time'),
      getMetadata(document, 'last-update'),
      getMetadata(document, 'published-time'),
    ),
  );
  const datePublished = toIsoDate(
    getFirstNonEmpty(getMetadata(document, 'published-time'), dateModified),
  );
  const dateCreated = toIsoDate(
    getFirstNonEmpty(getMetadata(document, 'build-date'), datePublished),
  );
  const image = getFirstNonEmpty(
    getMetadata(document, 'og:image:secure_url'),
    getMetadata(document, 'og:image'),
    getMetadata(document, 'twitter:image'),
  );
  const audienceType = dedupeStrings(
    getCsvValues(getMetadata(document, 'role')),
  );
  const about = dedupeStrings(getCsvValues(getMetadata(document, 'solution')));
  const keywords = dedupeStrings(
    getCsvValues(getMetadata(document, 'keywords')).concat(
      getCsvValues(getMetadata(document, 'feature')),
    ),
  );

  return buildOrderedSchema({
    type,
    canonicalUrl,
    headline,
    description,
    inLanguage,
    dateCreated,
    datePublished,
    dateModified,
    image,
    audienceType,
    about,
    keywords,
  });
};
