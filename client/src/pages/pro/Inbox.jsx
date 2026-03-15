import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { T, useLang } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { MessageSquare, Send, Search, Circle, Clock, Image, Paperclip, Smile, CheckCheck } from 'lucide-react';
import './Inbox.css';

const MOCK_THREADS = [
  { id: 1, name: 'Mariana Silva', initials: 'MS', lastMsg: 'Obrigada! Estou a aguardar confirmação.', time: '10:32', unread: 2, online: true },
  { id: 2, name: 'Carlos Fonseca', initials: 'CF', lastMsg: 'Pode ser às 14h de sexta?', time: 'Ontem', unread: 0, online: false },
  { id: 3, name: 'Ana Rodrigues', initials: 'AR', lastMsg: 'Perfeito, até amanhã então!', time: 'Ter', unread: 0, online: true },
  { id: 4, name: 'Pedro Matos', initials: 'PM', lastMsg: 'Ficou excelente, muito obrigado.', time: 'Seg', unread: 0, online: false },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, from: 'other', text: 'Bom dia! Tenho uma torneira a pingar na cozinha.', time: '10:15', status: 'read' },
    { id: 2, from: 'me', text: 'Olá Mariana! Posso ir esta quinta às 10h. Funciona?', time: '10:20', status: 'read' },
    { id: 3, from: 'other', text: 'Sim, quinta às 10h está óptimo!', time: '10:28', status: 'read' },
    { id: 4, from: 'other', text: 'Obrigada! Estou a aguardar confirmação.', time: '10:32', status: 'delivered' },
  ],
  2: [
    { id: 1, from: 'other', text: 'Preciso de instalar 3 tomadas novas no escritório.', time: 'Ontem 13:00', status: 'read' },
    { id: 2, from: 'me', text: 'Sem problema, vejo disponibilidade e respondo.', time: 'Ontem 13:45', status: 'read' },
    { id: 3, from: 'other', text: 'Pode ser às 14h de sexta?', time: 'Ontem 14:02', status: 'delivered' },
  ],
  3: [
    { id: 1, from: 'other', text: 'Tem disponibilidade para montar uns móveis IKEA?', time: 'Ter 09:00', status: 'read' },
    { id: 2, from: 'me', text: 'Claro! Amanhã de manhã serve?', time: 'Ter 09:10', status: 'read' },
    { id: 3, from: 'other', text: 'Perfeito, até amanhã então!', time: 'Ter 09:15', status: 'read' },
  ],
  4: [
    { id: 1, from: 'me', text: 'Trabalho terminado. Boa sorte com o novo quarto!', time: 'Seg 17:00', status: 'read' },
    { id: 2, from: 'other', text: 'Ficou excelente, muito obrigado.', time: 'Seg 17:30', status: 'read' },
  ],
};

const AUTO_REPLIES = [
  'Ok, combinado!', 'Perfeito, obrigado!', 'Vou verificar e respondo já.',
  'Boa, até lá então!', 'Sem problema, pode contar comigo.',
];

const Inbox = () => {
  const { lang } = useLang();
  const { addToast } = useNotifications();
  const [activeThread, setActiveThread] = useState(1);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, activeThread, typing]);

  const filteredThreads = threads.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!draft.trim() || !activeThread) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg = { id: Date.now(), from: 'me', text: draft.trim(), time: timeStr, status: 'sent' };
    setMessages(prev => ({ ...prev, [activeThread]: [...(prev[activeThread] || []), newMsg] }));
    setThreads(prev => prev.map(t => t.id === activeThread ? { ...t, lastMsg: draft.trim(), time: timeStr, unread: 0 } : t));
    setDraft('');

    // Mark as delivered after 1s
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeThread]: (prev[activeThread] || []).map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
      }));
    }, 1000);

    // Simulate typing + auto-reply if thread contact is online
    const thread = threads.find(t => t.id === activeThread);
    if (thread?.online) {
      setTimeout(() => setTyping(true), 1500);
      setTimeout(() => {
        setTyping(false);
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        const replyMsg = { id: Date.now() + 1, from: 'other', text: reply, time: timeStr, status: 'delivered' };
        setMessages(prev => ({ ...prev, [activeThread]: [...(prev[activeThread] || []), replyMsg] }));
        setThreads(prev => prev.map(t => t.id === activeThread ? { ...t, lastMsg: reply, time: timeStr } : t));
        addToast(`${thread.name}: "${reply}"`, 'info');
      }, 3500);
    }
  };

  const currentThread = threads.find(t => t.id === activeThread);
  const currentMessages = messages[activeThread] || [];

  return (
    <div className="inbox-page">
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
          <aside className="inbox-sidebar">
            <div className="inbox-search-wrap">
              <Search size={14} />
              <input className="inbox-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'pt' ? 'Pesquisar…' : 'Search…'} />
            </div>
            <div className="inbox-thread-list">
              {filteredThreads.map(t => (
                <button key={t.id} className={`inbox-thread ${activeThread === t.id ? 'active' : ''}`}
                  onClick={() => { setActiveThread(t.id); setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unread: 0 } : th)); }}>
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

          <main className="inbox-chat">
            {currentThread ? (
              <>
                <div className="inbox-chat-header">
                  <div className="inbox-chat-avatar">{currentThread.initials}</div>
                  <div>
                    <p className="inbox-chat-name">{currentThread.name}</p>
                    <p className="inbox-chat-status">
                      {typing ? (
                        <span className="inbox-typing"><T pt="A escrever" en="Typing" sv="Skriver" /><span className="inbox-typing-dots"><span /><span /><span /></span></span>
                      ) : currentThread.online ? (
                        <><Circle size={8} className="online-dot" /><T pt="Online" en="Online" sv="Online" /></>
                      ) : (
                        <T pt="Offline" en="Offline" sv="Offline" />
                      )}
                    </p>
                  </div>
                </div>
                <div className="inbox-messages">
                  {currentMessages.map(msg => (
                    <motion.div key={msg.id} className={`inbox-bubble-wrap ${msg.from === 'me' ? 'mine' : 'theirs'}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                      <div className={`inbox-bubble ${msg.from === 'me' ? 'mine' : 'theirs'}`}>
                        {msg.text}
                        <span className="inbox-bubble-time">
                          {msg.time}
                          {msg.from === 'me' && <CheckCheck size={12} className={`inbox-check ${msg.status === 'read' ? 'read' : ''}`} />}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {typing && (
                    <motion.div className="inbox-bubble-wrap theirs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="inbox-bubble theirs inbox-typing-bubble">
                        <span className="inbox-typing-dots"><span /><span /><span /></span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="inbox-compose">
                  <div className="inbox-compose-actions">
                    <button className="inbox-compose-icon" type="button"><Paperclip size={16} /></button>
                    <button className="inbox-compose-icon" type="button"><Image size={16} /></button>
                  </div>
                  <input className="inbox-compose-input" type="text" value={draft} onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={lang === 'pt' ? 'Escrever mensagem…' : lang === 'sv' ? 'Skriv ett meddelande…' : 'Write a message…'} />
                  <button className="inbox-compose-icon" type="button"><Smile size={16} /></button>
                  <button className="inbox-send-btn" onClick={handleSend} disabled={!draft.trim()}><Send size={16} /></button>
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
