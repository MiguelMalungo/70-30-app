import React, { useState, useEffect } from 'react';
import { T, useLang } from '../../context/LanguageContext';
import {
  Users, Flag, Shield, BarChart3, Tag, Ban,
  CheckCircle, XCircle, Loader, AlertTriangle, Eye,
  TrendingUp, Search, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';

/* ── Mock data ── */
const MOCK_USERS = [
  { id: 1, username: 'vitor_costa', name: 'Vítor Costa', email: 'vitor@example.com', role: 'MENTOR', status: 'active', flagged: false, joined: '2026-01-08' },
  { id: 2, username: 'ana_sousa', name: 'Ana Sousa', email: 'ana@example.com', role: 'MENTOR', status: 'active', flagged: true, joined: '2026-01-10' },
  { id: 3, username: 'luis_martins', name: 'Luís Martins', email: 'luis@example.com', role: 'APPRENTICE', status: 'active', flagged: false, joined: '2026-01-15' },
  { id: 4, username: 'sofia_torres', name: 'Sofia Torres', email: 'sofia@example.com', role: 'APPRENTICE', status: 'banned', flagged: false, joined: '2026-01-20' },
  { id: 5, username: 'pedro_matos', name: 'Pedro Matos', email: 'pedro@example.com', role: 'MENTEE', status: 'active', flagged: false, joined: '2026-02-01' },
];

const MOCK_CATEGORIES = [
  { id: 1, slug: 'canalizacao', name: 'Canalização', active: true, proCount: 24 },
  { id: 2, slug: 'eletricidade', name: 'Eletricidade', active: true, proCount: 18 },
  { id: 3, slug: 'carpintaria', name: 'Carpintaria', active: true, proCount: 21 },
  { id: 4, slug: 'pintura', name: 'Pintura', active: true, proCount: 16 },
  { id: 5, slug: 'montagem', name: 'Montagem', active: true, proCount: 30 },
  { id: 6, slug: 'jardim', name: 'Jardim', active: false, proCount: 8 },
];

const STATS = [
  { icon: Users, label: { pt: 'Total utilizadores', en: 'Total users', sv: 'Totalt användare' }, value: '163' },
  { icon: BarChart3, label: { pt: 'Reservas este mês', en: 'Bookings this month', sv: 'Bokningar denna månad' }, value: '412' },
  { icon: TrendingUp, label: { pt: 'Receita (mês)', en: 'Revenue (month)', sv: 'Intäkter (månad)' }, value: '€18.4k' },
  { icon: Flag, label: { pt: 'Sinalizados', en: 'Flagged', sv: 'Flaggade' }, value: '2' },
];

const AdminDashboard = () => {
  const { lang } = useLang();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState(MOCK_USERS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  const filteredUsers = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = async (userId) => {
    setActionLoading(`ban-${userId}`);
    try {
      const u = users.find(u => u.id === userId);
      await api.post(`/users/${userId}/flag/`, { action: u.status === 'banned' ? 'unban' : 'ban' });
    } catch { /* fall through */ }
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u
    ));
    setActionLoading(null);
  };

  const toggleFlag = async (userId) => {
    setActionLoading(`flag-${userId}`);
    try {
      await api.post(`/users/${userId}/flag/`, { action: 'flag' });
    } catch { /* fall through */ }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, flagged: !u.flagged } : u));
    setActionLoading(null);
  };

  const toggleCategory = (catId) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, active: !c.active } : c));
  };

  const getRoleColor = (role) => ({
    MENTOR: 'admin-role-mentor', APPRENTICE: 'admin-role-apprentice',
    MENTEE: 'admin-role-mentee', ADMIN: 'admin-role-admin',
  }[role] || 'admin-role-mentee');

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-hero">
        <div className="container admin-hero-inner">
          <div className="admin-hero-text">
            <p className="admin-overline"><T pt="Administração" en="Administration" sv="Administration" /></p>
            <h1><T pt="Painel de controlo" en="Control panel" sv="Kontrollpanel" /></h1>
            <p><T pt="Gere utilizadores, categorias e monitoriza a plataforma." en="Manage users, categories and monitor the platform." sv="Hantera användare, kategorier och övervaka plattformen." /></p>
          </div>
          <div className="admin-hero-stats">
            {STATS.map((s, i) => (
              <div key={i} className="admin-stat">
                <s.icon size={18} />
                <strong>{s.value}</strong>
                <span>{s.label[lang] || s.label.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <div className="container admin-tabs-inner">
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={15} /><T pt="Utilizadores" en="Users" sv="Användare" />
          </button>
          <button className={`admin-tab ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>
            <Tag size={15} /><T pt="Categorias" en="Categories" sv="Kategorier" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container admin-content">
        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2><T pt="Gestão de utilizadores" en="User management" sv="Användarhantering" /></h2>
              <div className="admin-search-wrap">
                <Search size={14} />
                <input
                  className="admin-search"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === 'pt' ? 'Pesquisar utilizadores…' : 'Search users…'}
                />
              </div>
            </div>
            <div className="admin-table">
              {filteredUsers.map(u => (
                <div key={u.id} className={`admin-user-row ${u.flagged ? 'flagged' : ''} ${u.status === 'banned' ? 'banned' : ''}`}>
                  <div className="admin-user-main" onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>
                    <div className="admin-user-avatar">{u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                    <div className="admin-user-info">
                      <span className="admin-user-name">{u.name}</span>
                      <span className="admin-user-email">{u.email}</span>
                    </div>
                    <span className={`admin-role-badge ${getRoleColor(u.role)}`}>{u.role}</span>
                    {u.flagged && <span className="admin-flag-icon"><AlertTriangle size={14} /></span>}
                    {u.status === 'banned' && <span className="admin-ban-icon"><Ban size={14} /></span>}
                    {expandedUser === u.id ? <ChevronUp size={16} className="admin-chevron" /> : <ChevronDown size={16} className="admin-chevron" />}
                  </div>
                  {expandedUser === u.id && (
                    <div className="admin-user-expanded">
                      <div className="admin-user-detail"><strong><T pt="Utilizador" en="Username" sv="Användarnamn" />:</strong> {u.username}</div>
                      <div className="admin-user-detail"><strong><T pt="Entrou em" en="Joined" sv="Gick med" />:</strong> {u.joined}</div>
                      <div className="admin-user-actions">
                        <button
                          className={`admin-action-btn ${u.flagged ? 'unflag' : 'flag'}`}
                          onClick={() => toggleFlag(u.id)}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === `flag-${u.id}` ? <Loader size={13} className="spin" /> : <Flag size={13} />}
                          {u.flagged ? <T pt="Remover sinalização" en="Remove flag" sv="Ta bort flagga" /> : <T pt="Sinalizar" en="Flag user" sv="Flagga" />}
                        </button>
                        <button
                          className={`admin-action-btn ${u.status === 'banned' ? 'unban' : 'ban'}`}
                          onClick={() => toggleBan(u.id)}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === `ban-${u.id}` ? <Loader size={13} className="spin" /> : u.status === 'banned' ? <CheckCircle size={13} /> : <Ban size={13} />}
                          {u.status === 'banned' ? <T pt="Desbanir" en="Unban" sv="Avbanna" /> : <T pt="Banir" en="Ban user" sv="Banna" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories Tab ── */}
        {tab === 'categories' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2><T pt="Gestão de categorias" en="Category management" sv="Kategorihantering" /></h2>
            </div>
            <div className="admin-cat-grid">
              {categories.map(cat => (
                <div key={cat.id} className={`admin-cat-card ${cat.active ? '' : 'inactive'}`}>
                  <div className="admin-cat-info">
                    <Tag size={16} className="admin-cat-icon" />
                    <div>
                      <p className="admin-cat-name">{cat.name}</p>
                      <p className="admin-cat-slug">/{cat.slug} · {cat.proCount} <T pt="profissionais" en="professionals" sv="proffs" /></p>
                    </div>
                  </div>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={cat.active} onChange={() => toggleCategory(cat.id)} />
                    <span className="admin-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
