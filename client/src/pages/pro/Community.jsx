import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { T, useLang } from '../../context/LanguageContext';
import { Search, Star, MapPin, Briefcase, Users, Filter, ChevronRight } from 'lucide-react';
import { mentorSearchAPI } from '../../services/api';
import imgCommunity from '../../assets/images/community.webp';
import './Community.css';

const MOCK_PROS = [
  { id: 1, name: 'Vítor Costa', initials: 'VC', role: 'MENTOR', skills: ['Canalização', 'Reparações'], location: 'Lisboa', rating: 4.9, reviews: 47, yearsExp: 18, bio: 'Canalizador com 18 anos de experiência em Lisboa.' },
  { id: 2, name: 'Manuel Rodrigues', initials: 'MR', role: 'MENTOR', skills: ['Eletricidade', 'Instalação'], location: 'Porto', rating: 4.8, reviews: 62, yearsExp: 22, bio: 'Electricista certificado, especializado em instalações industriais.' },
  { id: 3, name: 'João Ferreira', initials: 'JF', role: 'MENTOR', skills: ['Carpintaria', 'Montagem'], location: 'Braga', rating: 4.7, reviews: 33, yearsExp: 15, bio: 'Carpinteiro especializado em móveis à medida.' },
  { id: 4, name: 'Ana Sousa', initials: 'AS', role: 'MENTOR', skills: ['Pintura', 'Reparações'], location: 'Lisboa', rating: 4.9, reviews: 28, yearsExp: 12, bio: 'Pintora de interiores e exteriores com acabamentos premium.' },
  { id: 5, name: 'Luís Martins', initials: 'LM', role: 'APPRENTICE', skills: ['Montagem', 'Jardim'], location: 'Cascais', rating: 4.5, reviews: 11, yearsExp: 2, bio: 'Aprendiz motivado, especialização em montagem de móveis.' },
  { id: 6, name: 'Rita Neves', initials: 'RN', role: 'APPRENTICE', skills: ['Limpeza', 'Manutenção'], location: 'Sintra', rating: 4.6, reviews: 8, yearsExp: 1, bio: 'Aprendiz com foco em serviços domésticos de qualidade.' },
];

const ROLE_FILTER = [
  { key: 'ALL', pt: 'Todos', en: 'All', sv: 'Alla' },
  { key: 'MENTOR', pt: 'Mestres', en: 'Masters', sv: 'Mästare' },
  { key: 'APPRENTICE', pt: 'Aprendizes', en: 'Apprentices', sv: 'Lärlingar' },
];

const RoleTag = ({ role }) => (
  <span className={`community-role-tag ${role === 'MENTOR' ? 'mentor' : 'apprentice'}`}>
    {role === 'MENTOR' ? <T pt="Mestre" en="Master" sv="Mästare" /> : <T pt="Aprendiz" en="Apprentice" sv="Lärling" />}
  </span>
);

const StarRating = ({ value }) => (
  <span className="community-stars">
    <Star size={13} fill="currentColor" />
    <strong>{value.toFixed(1)}</strong>
  </span>
);

const Community = () => {
  const { lang } = useLang();
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await mentorSearchAPI.search({});
        if (!cancelled) {
          const results = Array.isArray(data) ? data : data.results || [];
          if (results.length > 0) {
            setPros(results.map(p => ({
              id: p.id,
              name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username,
              initials: (`${p.first_name || p.username || '?'}`[0] + `${p.last_name || ''}`[0] || '?').toUpperCase(),
              role: p.user_type || 'MENTOR',
              skills: p.skills?.map(s => s.name) || [],
              location: p.city || '',
              rating: p.avg_rating || 0,
              reviews: p.review_count || 0,
              yearsExp: p.years_of_experience || 0,
              bio: p.bio || '',
            })));
          } else {
            setPros(MOCK_PROS);
          }
        }
      } catch {
        if (!cancelled) setPros(MOCK_PROS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = pros.filter(p => {
    const matchRole = roleFilter === 'ALL' || p.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.skills.some(s => s.toLowerCase().includes(q)) || p.location.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const masterCount = pros.filter(p => p.role === 'MENTOR').length;
  const apprenticeCount = pros.filter(p => p.role === 'APPRENTICE').length;

  return (
    <div className="community-page">
      {/* Hero */}
      <div className="community-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(25,55,48,0.88) 0%, rgba(13,43,34,0.75) 60%, rgba(25,55,48,0.88) 100%), url(${imgCommunity})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
        <div className="container community-hero-inner">
          <div className="community-hero-text">
            <p className="community-overline"><T pt="Rede de profissionais" en="Professional network" sv="Professionellt nätverk" /></p>
            <h1><T pt="Comunidade 70-30" en="70-30 Community" sv="70-30 Gemenskapen" /></h1>
            <p><T pt="Encontra e conecta-te com Mestres e Aprendizes da plataforma." en="Find and connect with Masters and Apprentices on the platform." sv="Hitta och anslut med Mästare och Lärlingar." /></p>
          </div>
          <div className="community-hero-counters">
            <div className="community-counter"><Users size={20} /><strong>{masterCount}</strong><span><T pt="Mestres" en="Masters" sv="Mästare" /></span></div>
            <div className="community-counter"><Briefcase size={20} /><strong>{apprenticeCount}</strong><span><T pt="Aprendizes" en="Apprentices" sv="Lärlingar" /></span></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="community-filters-bar">
        <div className="container community-filters-inner">
          <div className="community-search-wrap">
            <Search size={16} className="community-search-icon" />
            <input
              className="community-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'pt' ? 'Pesquisar por nome, especialidade ou localização…' : lang === 'sv' ? 'Sök namn, specialitet eller plats…' : 'Search name, skill or location…'}
            />
          </div>
          <div className="community-role-filters">
            <Filter size={15} className="community-filter-icon" />
            {ROLE_FILTER.map(f => (
              <button key={f.key} className={`community-filter-btn ${roleFilter === f.key ? 'active' : ''}`} onClick={() => setRoleFilter(f.key)}>
                {f[lang] || f.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container community-grid-container">
        {loading ? (
          <div className="community-loading"><T pt="A carregar profissionais…" en="Loading professionals…" sv="Laddar proffs…" /></div>
        ) : filtered.length === 0 ? (
          <div className="community-empty"><Users size={40} strokeWidth={1.5} /><p><T pt="Nenhum resultado encontrado." en="No results found." sv="Inga resultat hittades." /></p></div>
        ) : (
          <div className="community-grid">
            {filtered.map((pro, i) => (
              <motion.div
                key={pro.id}
                className="community-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <div className="community-card-top">
                  <div className="community-card-avatar">{pro.initials}</div>
                  <div className="community-card-meta">
                    <h3 className="community-card-name">{pro.name}</h3>
                    <RoleTag role={pro.role} />
                  </div>
                  {pro.rating > 0 && <StarRating value={pro.rating} />}
                </div>
                {pro.bio && <p className="community-card-bio">{pro.bio}</p>}
                <div className="community-card-info">
                  {pro.location && <span className="community-info-item"><MapPin size={12} />{pro.location}</span>}
                  {pro.yearsExp > 0 && <span className="community-info-item"><Briefcase size={12} />{pro.yearsExp} <T pt="anos exp." en="yrs exp." sv="års erfarenhet" /></span>}
                  {pro.reviews > 0 && <span className="community-info-item"><Star size={12} />{pro.reviews} <T pt="avaliações" en="reviews" sv="omdömen" /></span>}
                </div>
                {pro.skills.length > 0 && (
                  <div className="community-card-skills">
                    {pro.skills.slice(0, 3).map(s => <span key={s} className="community-skill-tag">{s}</span>)}
                    {pro.skills.length > 3 && <span className="community-skill-more">+{pro.skills.length - 3}</span>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
