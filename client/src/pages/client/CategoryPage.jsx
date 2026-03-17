import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ArrowRight, Users } from 'lucide-react';
import { T, useLang } from '../../context/LanguageContext';
import { CATEGORIES, SUBCATEGORIES, getLabel } from '../../data/mockData';
import PageMeta from '../../components/ui/PageMeta';
import './CategoryPage.css';

const CategoryPage = () => {
  const { category } = useParams();
  const { lang } = useLang();

  const cat = CATEGORIES.find(c => c.slug === category);
  const subs = SUBCATEGORIES[category] || [];

  if (!cat) {
    return (
      <div className="cp-not-found container">
        <h2><T pt="Categoria não encontrada." en="Category not found." sv="Kategori ej hittad." /></h2>
        <Link to="/client/services" className="btn-primary">
          <T pt="← Voltar aos serviços" en="← Back to services" sv="← Tillbaka till tjänster" />
        </Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      <PageMeta title={cat ? getLabel(cat.name, lang) : 'Category'} />
      {/* ── Hero ── */}
      <section className="cp-hero" style={{ backgroundImage: `url(${cat.image})` }}>
        <div className="cp-hero-overlay" />
        <div className="container cp-hero-inner">
          <Link to="/client/services" className="cp-back-btn">
            <ArrowLeft size={15} />
            <T pt="Voltar" en="Back" sv="Tillbaka" />
          </Link>
          <div className="cp-hero-content">
            <div className="cp-hero-icon"><cat.Icon size={32} /></div>
            <h1>{getLabel(cat.name, lang)}</h1>
            <p>{getLabel(cat.desc, lang)}</p>
            <div className="cp-hero-meta">
              <span><strong>{subs.length}</strong> <T pt="serviços" en="services" sv="tjänster" /></span>
              <span className="cp-hero-dot">·</span>
              <span><Users size={14} /> <strong>{cat.proCount}</strong> <T pt="profissionais" en="professionals" sv="proffs" /></span>
              <span className="cp-hero-dot">·</span>
              <span><T pt="A partir de" en="From" sv="Från" /> <strong>€{cat.startingFrom.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subcategory list ── */}
      <section className="cp-subs-section">
        <div className="container">
          <h2 className="cp-subs-title">
            <T pt="Escolhe o tipo de serviço" en="Choose the type of service" sv="Välj typ av tjänst" />
          </h2>
          <div className="cp-subs-grid">
            {subs.map(sub => (
              <Link
                key={sub.slug}
                to={`/client/services/${category}/${sub.slug}`}
                className="cp-sub-card"
              >
                <div className="cp-sub-top">
                  <div className="cp-sub-icon"><cat.Icon size={20} /></div>
                  <div className="cp-sub-price-wrap">
                    <span className="cp-sub-from"><T pt="A partir de" en="From" sv="Från" /></span>
                    <span className="cp-sub-price">€{sub.price.toFixed(2)}</span>
                  </div>
                </div>
                <h3 className="cp-sub-name">{getLabel(sub.name, lang)}</h3>
                <p className="cp-sub-desc">{getLabel(sub.shortDesc, lang)}</p>
                <div className="cp-sub-footer">
                  <div className="cp-sub-duration">
                    <Clock size={13} />
                    <span>{getLabel(sub.duration, lang)}</span>
                  </div>
                  <div className="cp-sub-cta">
                    <T pt="Ver detalhes" en="View details" sv="Visa detaljer" />
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Trust ── */}
      <section className="cp-trust">
        <div className="container cp-trust-inner">
          <div className="cp-trust-item">
            <strong><T pt="Preço fixo garantido" en="Fixed price guaranteed" sv="Fast pris garanterat" /></strong>
            <span><T pt="Sabes o preço antes de confirmar" en="You know the price before confirming" sv="Du vet priset innan bekräftelse" /></span>
          </div>
          <div className="cp-trust-div" />
          <div className="cp-trust-item">
            <strong><T pt="Profissionais certificados" en="Certified professionals" sv="Certifierade proffs" /></strong>
            <span><T pt="Verificados por identidade e competências" en="Verified by identity and skills" sv="Verifierade med identitet och kompetens" /></span>
          </div>
          <div className="cp-trust-div" />
          <div className="cp-trust-item">
            <strong><T pt="Garantia de satisfação" en="Satisfaction guarantee" sv="Nöjdhetsgaranti" /></strong>
            <span><T pt="Se não ficares satisfeito, voltamos" en="If not satisfied, we come back" sv="Om inte nöjd, kommer vi tillbaka" /></span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
