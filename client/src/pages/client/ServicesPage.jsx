import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { T, useLang } from '../../context/LanguageContext';
import { CATEGORIES, getLabel } from '../../data/mockData';
import './ServicesPage.css';

const ServicesPage = () => {
  const { lang } = useLang();
  const [query, setQuery] = useState('');

  const filtered = CATEGORIES.filter(cat =>
    getLabel(cat.name, lang).toLowerCase().includes(query.toLowerCase()) ||
    getLabel(cat.desc, lang).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="services-page">
      {/* ── Hero Bar ── */}
      <section className="sp-hero">
        <div className="container">
          <div className="sp-hero-inner">
            <div className="sp-hero-text">
              <div className="sp-overline"><T pt="Todos os serviços" en="All services" sv="Alla tjänster" /></div>
              <h1>
                <T pt="O que precisas hoje?" en="What do you need today?" sv="Vad behöver du idag?" />
              </h1>
              <p>
                <T
                  pt="Profissionais verificados para todos os serviços domésticos — rápido, fixo e garantido."
                  en="Verified professionals for all home services — fast, fixed price and guaranteed."
                  sv="Verifierade proffs för alla hemtjänster — snabbt, fast pris och garanterat."
                />
              </p>
            </div>
            <div className="sp-search-bar">
              <Search size={20} className="sp-search-icon" />
              <input
                type="text"
                placeholder={lang === 'sv' ? 'Sök tjänst…' : lang === 'en' ? 'Search service…' : 'Pesquisar serviço…'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="sp-search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="sp-grid-section">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="sp-empty">
              <p><T pt="Nenhuma categoria encontrada." en="No categories found." sv="Inga kategorier hittades." /></p>
            </div>
          ) : (
            <>
              <p className="sp-results-count">
                {filtered.length} <T pt="categorias disponíveis" en="categories available" sv="kategorier tillgängliga" />
              </p>
              <div className="sp-categories-grid">
                {filtered.map(cat => (
                  <Link
                    key={cat.slug}
                    to={`/client/services/${cat.slug}`}
                    className="sp-cat-card"
                  >
                    <div className="sp-cat-img-wrap">
                      <img src={cat.image} alt={getLabel(cat.name, lang)} loading="lazy" />
                      <div className="sp-cat-overlay" />
                      <div className="sp-cat-icon-badge"><cat.Icon size={22} /></div>
                    </div>
                    <div className="sp-cat-body">
                      <h3 className="sp-cat-name">{getLabel(cat.name, lang)}</h3>
                      <p className="sp-cat-desc">{getLabel(cat.desc, lang)}</p>
                      <div className="sp-cat-footer">
                        <div className="sp-cat-meta">
                          <span className="sp-cat-subs">{cat.subCount} <T pt="serviços" en="services" sv="tjänster" /></span>
                          <span className="sp-cat-pros">{cat.proCount} <T pt="profissionais" en="professionals" sv="proffs" /></span>
                        </div>
                        <div className="sp-cat-price">
                          <span className="sp-cat-price-from"><T pt="A partir de" en="From" sv="Från" /></span>
                          <span className="sp-cat-price-val">€{cat.startingFrom.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="sp-cat-cta">
                        <T pt="Ver serviços" en="View services" sv="Se tjänster" />
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Bottom Trust ── */}
      <section className="sp-trust">
        <div className="container sp-trust-inner">
          <div className="sp-trust-item">
            <strong><T pt="Preço fixo antes de confirmar" en="Fixed price before confirming" sv="Fast pris innan bekräftelse" /></strong>
            <span><T pt="Sem surpresas ni orçamentos" en="No price surprises" sv="Inga prisöverraskningar" /></span>
          </div>
          <div className="sp-trust-divider" />
          <div className="sp-trust-item">
            <strong><T pt="Cancelamento gratuito" en="Free cancellation" sv="Gratis avbokning" /></strong>
            <span><T pt="Até 24h antes do serviço" en="Up to 24h before service" sv="Upp till 24h innan" /></span>
          </div>
          <div className="sp-trust-divider" />
          <div className="sp-trust-item">
            <strong><T pt="Suporte em tempo real" en="Real-time support" sv="Support i realtid" /></strong>
            <span><T pt="Equipa disponível durante o serviço" en="Team available during service" sv="Team tillgängligt under tjänst" /></span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
