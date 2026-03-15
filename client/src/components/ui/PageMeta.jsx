import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../../context/LanguageContext';

const SITE = '70.30 — Serviços Domésticos';
const DEFAULT_DESC = {
  pt: 'A plataforma que une gerações. Serviços domésticos de confiança em Portugal.',
  en: 'The platform that connects generations. Trusted home services in Portugal.',
  sv: 'Plattformen som förenar generationer. Pålitliga hemtjänster i Portugal.',
};

/**
 * PageMeta — sets <title>, description, and Open Graph tags per page.
 *
 * Usage: <PageMeta title="Serviços" description="Browse services" />
 */
const PageMeta = ({ title, description, image, path }) => {
  const { lang } = useLang();
  const fullTitle = title ? `${title} | ${SITE}` : SITE;
  const desc = description || DEFAULT_DESC[lang] || DEFAULT_DESC.en;
  const url = path ? `https://josemiguelferrazguedes.github.io/70-30-app/${path}` : '';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <html lang={lang} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default PageMeta;
