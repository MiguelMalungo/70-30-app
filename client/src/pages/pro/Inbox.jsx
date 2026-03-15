import React, { useState } from 'react';
import { T, useLang } from '../../context/LanguageContext';
import { MessageSquare, Send, Search, Circle, Clock } from 'lucide-react';
import './Inbox.css';

const MOCK_THREADS = [
  { id: 1, name: 'Mariana Silva', initials: 'MS', lastMsg: 'Obrigada! Estou a aguardar confirmação.', time: '10:32', unread: 2, online: true },
  { id: 2, name: 'Carlos Fonseca', initials: 'CF', lastMsg: 'Pode ser às 14h de sexta?', time: 'Ontem', unread: 0, online: false },
  { id: 3, name: 'Ana Rodrigues', initials: 'AR', lastMsg: 'Perfeito, até amanhã então!', time: 'Ter', unread: 0, online: true },
  { id: 4, name: 'Pedro Matos', initials: 'PM', lastMsg: 'Ficou excelente, muito obrigado.', time: 'Seg', unread: 0, online: false },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, from: 'other', text: 'Bom dia! Tenho uma torneira a pingar na cozinha.', time: '10:15' },
    { id: 2, from: 'me', text: 'Olá Mariana! Posso ir esta quinta às 10h. Funciona?', time: '10:20' },
    { id: 3, from: 'other', text: 'Sim, quinta às 10h está óptimo!', time: '10:28' },
    { id: 4, from: 'other', text: 'Obrigada! Estou a aguardar confirmação.', time: '10:32' },
  ],
  2: [
    { id: 1, from: 'other', text: 'Preciso de instalar 3 tomadas novas no escritório.', time: 'Ontem 13:00' },
    { id: 2, from: 'me', text: 'Sem problema, vejo disponibilidade e respondo.', time: 'Ontem 13:45' },
    { id: 3, from: 'other', text: 'Pode ser às 14h de sexta?', time: 'Ontem 14:02' },
  ],
  3: [
    { id: 1, from: 'other', text: 'Tem disponibilidade para montar uns móveis IKEA?', time: 'Ter 09:00' },
    { id: 2, from: 'me', text: 'Claro! Amanhã de manhã serve?', time: 'Ter 09:10' },
    { id: 3, from: 'other', text: 'Perfeito, até amanhã então!', time: 'Ter 09:15' },
  ],
  4: [
    { id: 1, from: 'me', text: 'Trabalho terminado. Boa sorte com o novo quarto!', time: 'Seg 17:00' },
    { id: 2, from: 'other', text: 'Ficou excelente, muito obrigado.', time: 'Seg 17:30' },
  ],
};

const Inbox = () => {
  const { lang } = useLang();
  const [activeThread, setActiveThread] = useState(1);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [threads, setThreads] = useState(MOCK_THREADS);

  const filteredThreads = threads.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!draft.trim() || !activeThread) return;
    const newMsg = { id: Date.now(), from: 'me', text: draft.trim(), time: 'Agora' };
    setMessages(prev => ({ ...prev, [activeThread]: [...(prev[activeThread] || []), newMsg] }));
    setThreads(prev => prev.map(t => t.id === activeThread ? { ...t, lastMsg: draft.trim(), time: 'Agora', unread: 0 } : t));
    setDraft('');
  };

  const currentThread = threads.find(t => t.id === activeThread);
  const currentMessages = messages[activeThread] || [];

  return (
    <div className="inbox-page">
      {/* Header */}
      <div className="inbox-header">
        <div className="container inbox-header-inner">
          <MessageSquare size={22} />
          <h1><T pt="Mensagens" en="Messages" sv="Meddelanden" /></h1>
          {threads.reduce((s, t) => s + t.unread, 0) > 0 && (
            <span className="inbox-unread-badge">{threads.reduce((s, t) => s + t.unread, 0)}</span>
          )}
        </div>
      </div>

      <div className="container inbox-container">
        <div className="inbox-layout">
          {/* Thread list */}
          <aside className="inbox-sidebar">
            <div className="inbox-search-wrap">
              <Search size={14} />
              <input
                className="inbox-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'pt' ? 'Pesquisar…' : 'Search…'}
              />
            </div>
            <div className="inbox-thread-list">
              {filteredThreads.map(t => (
                <button
                  key={t.id}
                  className={`inbox-thread ${activeThread === t.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveThread(t.id);
                    setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unread: 0 } : th));
                  }}
                >
                  <div className="inbox-thread-avatar">
                    {t.initials}
                    {t.online && <span className="inbox-online-dot" />}
                  </div>
                  <div className="inbox-thread-info">
                    <div className="inbox-thread-top">
                      <span className="inbox-thread-name">{t.name}</span>
                      <span className="inbox-thread-time"><Clock size={11} />{t.time}</span>
                    </div>
                    <div className="inbox-thread-bottom">
                      <span className="inbox-thread-last">{t.lastMsg}</span>
                      {t.unread > 0 && <span className="inbox-thread-unread">{t.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Chat panel */}
          <main className="inbox-chat">
            {currentThread ? (
              <>
                <div className="inbox-chat-header">
                  <div className="inbox-chat-avatar">{currentThread.initials}</div>
                  <div>
                    <p className="inbox-chat-name">{currentThread.name}</p>
                    <p className="inbox-chat-status">
                      {currentThread.online
                        ? <><Circle size={8} className="online-dot" /><T pt="Online" en="Online" sv="Online" /></>
                        : <T pt="Offline" en="Offline" sv="Offline" />
                      }
                    </p>
                  </div>
                </div>
                <div className="inbox-messages">
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`inbox-bubble-wrap ${msg.from === 'me' ? 'mine' : 'theirs'}`}>
                      <div className={`inbox-bubble ${msg.from === 'me' ? 'mine' : 'theirs'}`}>
                        {msg.text}
                        <span className="inbox-bubble-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="inbox-compose">
                  <input
                    className="inbox-compose-input"
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={lang === 'pt' ? 'Escrever mensagem…' : lang === 'sv' ? 'Skriv ett meddelande…' : 'Write a message…'}
                  />
                  <button className="inbox-send-btn" onClick={handleSend} disabled={!draft.trim()}>
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="inbox-empty">
                <MessageSquare size={48} strokeWidth={1.5} />
                <p><T pt="Selecciona uma conversa" en="Select a conversation" sv="Välj ett samtal" /></p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
