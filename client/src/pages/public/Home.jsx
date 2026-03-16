import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LogIn, Search, CalendarClock, Home as HouseCheck,
    Droplets, Zap, Hammer, Paintbrush, Wrench,
    Leaf, Settings2, Plug, Gauge, Car, MoreHorizontal,
    Star, ShieldCheck, Headphones, ChevronDown, ArrowRight,
    Briefcase, BookOpen,
} from 'lucide-react';
import { useLang, T } from '../../context/LanguageContext';
import PageMeta from '../../components/ui/PageMeta';
import useAnalytics from '../../hooks/useAnalytics';
import './Home.css';

/* ── Images ────────────────────────────────────────────────── */
import heroImg from '../../assets/images/hero-mentorship.webp';
import communityImg from '../../assets/images/community.webp';
import carpinteiroImg from '../../assets/images/carpinteiro.webp';

import stepChoose from '../../assets/images/step-choose.webp';
import stepSchedule from '../../assets/images/step-schedule.webp';
import stepReceive from '../../assets/images/step-receive.webp';

import previewPlumbing from '../../assets/images/preview-plumbing.webp';
import previewAssembly from '../../assets/images/preview-assembly.webp';
import previewElectrical from '../../assets/images/preview-electrical.webp';

import catCanalizacao from '../../assets/images/cat-canalizacao.webp';
import catEletricidade from '../../assets/images/cat-eletricidade.webp';
import catCarpintaria from '../../assets/images/cat-carpintaria.webp';
import catPintura from '../../assets/images/cat-pintura.webp';
import catMontagem from '../../assets/images/cat-montagem.webp';
import catJardim from '../../assets/images/cat-jardim.webp';
import catReparacoes from '../../assets/images/cat-reparacoes.webp';
import catInstalacao from '../../assets/images/cat-instalacao.webp';
import catManutencao from '../../assets/images/cat-manutencao.webp';
import catExplicacoes from '../../assets/images/study.webp';
import catMecanica from '../../assets/images/mechanic.webp';
import catOutros from '../../assets/images/others.webp';

/* ── Translated data helper ──────────────────────────────────── */
const t = (lang, pt, en, sv) => ({ pt, en, sv })[lang] || en;

/* ── Component ─────────────────────────────────────────────── */
const Home = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const { lang } = useLang();
    const { trackPageView } = useAnalytics();

    useEffect(() => { trackPageView('home'); }, []);

    const pageTitle = lang === 'pt' ? 'Início' : lang === 'sv' ? 'Hem' : 'Home';

    /* ── Translated data ─── */
    const STEPS = [
        { img: stepChoose, num: '01', Icon: Search, title: t(lang, 'Escolhe o serviço', 'Choose the service', 'Välj tjänst'), desc: t(lang, 'Seleciona o tipo de serviço — canalização, carpintaria, pintura e muito mais. Preço fixo antes de confirmar.', 'Select the type of service you need — plumbing, carpentry, painting and much more. Fixed price before you confirm.', 'Välj den typ av tjänst du behöver — VVS, snickeri, målning och mycket mer. Fast pris innan du bekräftar.') },
        { img: stepSchedule, num: '02', Icon: CalendarClock, title: t(lang, 'Agenda a data', 'Schedule the date', 'Boka datum'), desc: t(lang, 'Escolhe quando é mais conveniente para ti. Disponibilidade em tempo real com confirmação instantânea.', "Choose when it's most convenient for you. Real-time availability with instant confirmation on your phone.", 'Välj när det passar dig bäst. Tillgänglighet i realtid med omedelbar bekräftelse.') },
        { img: stepReceive, num: '03', Icon: HouseCheck, title: t(lang, 'Recebe os profissionais', 'Receive the professionals', 'Ta emot proffsen'), desc: t(lang, 'Um Mentor experiente e o seu Aprendiz chegam a horas. Trabalho de qualidade, garantido pela plataforma.', 'An experienced Mentor and their Apprentice arrive on time. Quality work, guaranteed by the platform.', 'En erfaren Mentor och deras Lärling kommer i tid. Kvalitetsarbete, garanterat av plattformen.') },
    ];

    const PREVIEWS = [
        { img: previewPlumbing, title: t(lang, 'Reparação de canalização', 'Plumbing repair', 'VVS-reparation'), price: '€ 49.90' },
        { img: previewAssembly, title: t(lang, 'Montagem de móveis', 'Furniture assembly', 'Möbelmontering'), price: '€ 39.90' },
        { img: previewElectrical, title: t(lang, 'Instalação elétrica', 'Electrical installation', 'Elinstallation'), price: '€ 59.90' },
    ];

    const CATEGORIES = [
        { img: catCanalizacao, Icon: Droplets, label: t(lang, 'Canalização', 'Plumbing', 'VVS') },
        { img: catEletricidade, Icon: Zap, label: t(lang, 'Eletricidade', 'Electrical', 'El') },
        { img: catCarpintaria, Icon: Hammer, label: t(lang, 'Carpintaria', 'Carpentry', 'Snickeri') },
        { img: catPintura, Icon: Paintbrush, label: t(lang, 'Pintura', 'Painting', 'Målning') },
        { img: catMontagem, Icon: Wrench, label: t(lang, 'Montagem', 'Assembly', 'Montering') },
        { img: catJardim, Icon: Leaf, label: t(lang, 'Jardim', 'Gardening', 'Trädgård') },
        { img: catReparacoes, Icon: Settings2, label: t(lang, 'Reparações', 'Repairs', 'Reparationer') },
        { img: catInstalacao, Icon: Plug, label: t(lang, 'Instalação', 'Installation', 'Installation') },
        { img: catManutencao, Icon: Gauge, label: t(lang, 'Manutenção', 'Maintenance', 'Underhåll') },
        { img: catExplicacoes, Icon: BookOpen, label: t(lang, 'Explicações', 'Tutoring', 'Handledning') },
        { img: catMecanica, Icon: Car, label: t(lang, 'Mecânica Auto', 'Car Mechanics', 'Bilmekanik') },
        { img: catOutros, Icon: MoreHorizontal, label: t(lang, 'Outros', 'Others', 'Annat') },
    ];

    const REVIEWS_DATA = [
        { initials: 'MF', name: 'Maria Fernanda', location: t(lang, 'Lisboa · Canalização', 'Lisbon · Plumbing', 'Lissabon · VVS'), text: t(lang, 'O Sr. Vítor e o seu aprendiz foram impecáveis. A torneira pingava há semanas e resolveram em menos de uma hora. Recomendo!', 'Mr Vítor and his apprentice were impeccable. The tap had been dripping for weeks and they fixed it in less than an hour. Highly recommended!', 'Hr Vítor och hans lärling var oklanderliga. Kranen hade droppat i veckor och de fixade det på mindre än en timme.') },
        { initials: 'JR', name: 'João Rodrigues', location: t(lang, 'Porto · Carpintaria', 'Porto · Carpentry', 'Porto · Snickeri'), text: t(lang, 'Contratei para montar uma estante e acabei com reparações que nem sabia que precisava. O Manuel tem décadas de experiência.', "I hired them to assemble a bookshelf and ended up getting repairs I didn't even know I needed. Manuel has decades of experience.", 'Jag anlitade dem för att montera en bokhylla och fick reparationer jag inte visste att jag behövde.') },
        { initials: 'AS', name: 'Ana Sousa', location: t(lang, 'Braga · Pintura', 'Braga · Painting', 'Braga · Målning'), text: t(lang, 'Pintaram a sala toda num dia. O resultado ficou excelente e o preço muito mais justo do que qualquer orçamento que recebi.', 'They painted the entire living room in one day. The result was excellent and the price was much fairer than any quote I had received.', 'De målade hela vardagsrummet på en dag. Resultatet var utmärkt och priset mycket rimligare.') },
        { initials: 'CM', name: 'Carlos Mendes', location: t(lang, 'Setúbal · Eletricidade', 'Setúbal · Electrical', 'Setúbal · El'), text: t(lang, 'Tive um curto-circuito e precisei de ajuda urgente. Em menos de duas horas tinha um eletricista em casa. 100% profissionalismo.', 'I had a short circuit and needed urgent help. In less than two hours they had an electrician at my home. 100% professionalism.', 'Jag hade en kortslutning och behövde akut hjälp. På mindre än två timmar hade de en elektriker hemma hos mig.') },
    ];

    const TRUST_ITEMS = [
        { Icon: ShieldCheck, title: t(lang, 'Verificados e acreditados', 'Verified and accredited', 'Verifierade och ackrediterade'), desc: t(lang, 'Todos os Mentores passam por verificação de antecedentes e validação de competências antes de serem aceites.', 'All Mentors undergo background checks and skills validation before being accepted on the platform.', 'Alla Mentorer genomgår bakgrundskontroller och kompetensvalidering innan de accepteras.') },
        { Icon: Star, title: t(lang, 'Avaliações reais e verificadas', 'Real and verified reviews', 'Riktiga och verifierade omdömen'), desc: t(lang, 'Cada avaliação vem de um cliente real que usou o serviço. Transparência total, sem avaliações falsas.', 'Every review comes from a real customer who used the service. Full transparency, no fake reviews.', 'Varje omdöme kommer från en riktig kund som använde tjänsten. Full transparens.') },
        { Icon: Headphones, title: t(lang, 'Suporte humano, em tempo real', 'Human support, in real time', 'Mänskligt stöd i realtid'), desc: t(lang, 'A nossa equipa monitoriza cada serviço e está disponível para ajudar se algo correr mal. Nunca estás sozinho.', "Our team monitors every service and is available to help if something goes wrong. You're never alone.", 'Vårt team övervakar varje tjänst och finns tillgängligt om något går fel.') },
    ];

    const FAQS = [
        { q: t(lang, 'Como funciona o processo de marcação?', 'How does the booking process work?', 'Hur fungerar bokningsprocessen?'), a: t(lang, 'Escolhes o serviço, vês o preço fixo, selecionas data e hora, e confirmas. Um Mentor e o seu Aprendiz são atribuídos automaticamente. Recebes confirmação por notificação e SMS.', 'You choose the service, see the fixed price, select the date and time, and confirm the booking. A Mentor and their Apprentice are automatically assigned. You receive a confirmation by notification and SMS.', 'Du väljer tjänsten, ser det fasta priset, väljer datum och tid, och bekräftar. En Mentor och deras Lärling tilldelas automatiskt.') },
        { q: t(lang, 'Os profissionais são verificados?', 'Are the professionals verified?', 'Är yrkespersonerna verifierade?'), a: t(lang, 'Sim. Todos os Mentores passam por verificação de identidade, validação de competências profissionais e avaliação de antecedentes. Os Aprendizes são formados e supervisionados pelos Mentores.', 'Yes. All Mentors undergo identity verification, professional skills validation and background assessment. Apprentices are trained and supervised by Mentors on each service.', 'Ja. Alla Mentorer genomgår identitetsverifiering, professionell kompetensvalidering och bakgrundsbedömning.') },
        { q: t(lang, 'Qual é o custo dos serviços?', 'What is the cost of services?', 'Vad kostar tjänsterna?'), a: t(lang, 'Trabalhamos com preços fixos — sabes exatamente o que vais pagar antes de confirmar. Sem surpresas. Os preços começam a partir de €29.90.', "We work with fixed prices — you know exactly what you'll pay before confirming. No surprises. Prices start from €29.90.", 'Vi arbetar med fasta priser — du vet exakt vad du betalar innan du bekräftar. Inga överraskningar. Priser från €29.90.') },
        { q: t(lang, 'Posso cancelar ou reagendar?', 'Can I cancel or reschedule a service?', 'Kan jag avboka eller omboka?'), a: t(lang, 'Podes cancelar gratuitamente até 24h antes. Reagendamentos são sempre grátis. Em caso de cancelamento tardio, pode aplicar-se uma taxa nominal.', 'You can cancel for free up to 24 hours before the service. Reschedules are always free. Late cancellation may incur a nominal fee.', 'Du kan avboka gratis upp till 24 timmar innan. Ombokning är alltid gratis.') },
        { q: t(lang, 'Como me torno Mentor ou Aprendiz?', 'How do I become a Mentor or Apprentice?', 'Hur blir jag Mentor eller Lärling?'), a: t(lang, 'Clica em "Entrar como Mentor" ou "Entrar como Aprendiz" no menu superior. O processo de candidatura demora menos de 10 minutos.', 'Click "Join as Mentor" or "Join as Apprentice" in the top menu. The application process takes less than 10 minutes.', 'Klicka på "Gå med som Mentor" eller "Gå med som Lärling" i toppmenyn. Ansökningsprocessen tar mindre än 10 minuter.') },
    ];

    const POPULAR = [
        t(lang, 'Reparação de torneira', 'Tap repair', 'Kranreparation'),
        t(lang, 'Eletricista no Porto', 'Electrician in Porto', 'Elektriker i Stockholm'),
        t(lang, 'Limpeza de casa', 'House cleaning', 'Husstädning'),
        t(lang, 'Montagem IKEA', 'IKEA furniture assembly', 'IKEA-montering'),
        t(lang, 'Pintura de paredes', 'Wall painting', 'Väggmålning'),
        t(lang, 'Canalização urgente', 'Urgent plumbing', 'Akut VVS'),
        t(lang, 'Instalação de tomadas', 'Socket installation', 'Uttagsinstallation'),
        t(lang, 'Corte de relva', 'Garden mowing', 'Gräsklippning'),
        t(lang, 'Mudança de casa', 'House moving', 'Flytt'),
        t(lang, 'Reparação de portão', 'Gate repair', 'Grindreparation'),
    ];

    const CITIES = lang === 'sv'
        ? [
            // Stockholm area
            'Stockholms stad', 'Solna', 'Sundbyberg', 'Nacka', 'Huddinge',
            'Lidingö', 'Täby', 'Järfälla', 'Sollentuna', 'Botkyrka',
            // Gothenburg area
            'Göteborgs stad', 'Mölndal', 'Partille', 'Härryda', 'Kungsbacka',
          ]
        : [
            // Porto city parishes
            'Bonfim', 'Campanhã', 'Cedofeita', 'Paranhos', 'Ramalde',
            'Foz do Douro', 'Lordelo do Ouro', 'Massarelos',
            // Greater Porto
            'Matosinhos', 'Leça da Palmeira', 'Senhora da Hora',
            'Vila Nova de Gaia', 'Santa Marinha', 'Gondomar', 'Maia',
          ];
    const COMING_SOON = lang === 'sv'
        ? ['Lerum', 'Ale']
        : ['Valongo', 'Espinho'];

    return (
        <>
            <PageMeta title={pageTitle} />
            {/* ━━━ HERO ━━━ */}
            <section className="hero" id="hero" style={{ backgroundImage: `url(${heroImg})` }}>
                <div className="hero-overlay" />
                <div className="container hero-inner">
                    <div className="hero-main">
                        <div className="hero-overline"><T pt="Serviços domésticos perto de ti" en="Home services near you" sv="Hemtjänster nära dig" /></div>
                        <h1><T pt={<>O serviço que precisas,<br />sempre <em>perto de ti.</em></>} en={<>The service you need,<br />always <em>near you.</em></>} sv={<>Tjänsten du behöver,<br />alltid <em>nära dig.</em></>} /></h1>
                        <p className="hero-sub">
                            <T
                                pt="Encontra profissionais de confiança na tua comunidade para canalização, carpintaria, eletricidade e muito mais. Rápido, acessível, de qualidade."
                                en="Find trusted professionals in your community for plumbing, carpentry, electrical work and more. Fast, affordable, quality."
                                sv="Hitta pålitliga proffs i ditt samhälle för VVS, snickeri, el och mer. Snabbt, prisvärt, kvalitet."
                            />
                        </p>
                        <div className="hero-actions">
                            <Link to="/login" className="btn-primary"><LogIn size={18} /> <T pt="Login" en="Login" sv="Logga in" /></Link>
                        </div>
                    </div>

                    {/* Hero join CTAs — right-aligned on desktop */}
                    <div className="hero-join-ctas">
                        <Link to="/register?role=MENTOR" className="hero-join-btn mentor">
                            <Briefcase size={18} />
                            <div>
                                <span className="hero-join-label"><T pt="Sou profissional" en="I'm a professional" sv="Jag är proffs" /></span>
                                <strong><T pt="Registar como Mentor" en="Join as Mentor" sv="Gå med som Mentor" /></strong>
                                <ul className="hero-join-features">
                                    <li><T pt="Partilhe décadas de experiência" en="Share decades of experience" sv="Dela decenniers erfarenhet" /></li>
                                    <li><T pt="Defina a sua disponibilidade" en="Set your own availability" sv="Sätt din tillgänglighet" /></li>
                                    <li><T pt="Impacto real na comunidade" en="Real impact in your community" sv="Verklig samhällspåverkan" /></li>
                                </ul>
                            </div>
                            <ArrowRight size={16} className="hero-join-arrow" />
                        </Link>
                        <Link to="/register?role=MENTEE" className="hero-join-btn apprentice">
                            <BookOpen size={18} />
                            <div>
                                <span className="hero-join-label"><T pt="Quero aprender" en="I want to learn" sv="Jag vill lära mig" /></span>
                                <strong><T pt="Registar como Aprendiz" en="Join as Apprentice" sv="Gå med som Lärling" /></strong>
                                <ul className="hero-join-features">
                                    <li><T pt="Aprenda com mentores experientes" en="Learn from experienced mentors" sv="Lär av erfarna mentorer" /></li>
                                    <li><T pt="Ganhe enquanto aprende na prática" en="Earn while learning hands-on" sv="Tjäna medan du lär dig" /></li>
                                    <li><T pt="Construa o seu portfólio" en="Build your skills portfolio" sv="Bygg din kompetensprofil" /></li>
                                </ul>
                            </div>
                            <ArrowRight size={16} className="hero-join-arrow" />
                        </Link>
                    </div>
                </div>

                {/* ━━━ MOBILE JOIN STRIP — pinned to bottom of hero on mobile ━━━ */}
                <div className="mobile-join-strip">
                    <div className="container mobile-join-inner">
                        <Link to="/register?role=MENTOR" className="mobile-join-btn mentor">
                            <Briefcase size={20} className="mobile-join-ico" />
                            <div className="mobile-join-content">
                                <span className="mobile-join-sup"><T pt="Sou profissional" en="I'm a professional" sv="Jag är proffs" /></span>
                                <strong><T pt="Registar como Mentor" en="Join as Mentor" sv="Gå med som Mentor" /></strong>
                                <span className="mobile-join-sub"><T pt="Partilhe experiência · Defina disponibilidade" en="Share experience · Set availability" sv="Dela erfarenhet · Sätt tillgänglighet" /></span>
                            </div>
                            <ArrowRight size={14} className="mobile-join-arrow" />
                        </Link>
                        <Link to="/register?role=MENTEE" className="mobile-join-btn apprentice">
                            <BookOpen size={20} className="mobile-join-ico" />
                            <div className="mobile-join-content">
                                <span className="mobile-join-sup"><T pt="Quero aprender" en="I want to learn" sv="Jag vill lära mig" /></span>
                                <strong><T pt="Registar como Aprendiz" en="Join as Apprentice" sv="Gå med som Lärling" /></strong>
                                <span className="mobile-join-sub"><T pt="Aprenda · Ganhe · Cresça" en="Learn · Earn · Grow" sv="Lär · Tjäna · Väx" /></span>
                            </div>
                            <ArrowRight size={14} className="mobile-join-arrow" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ━━━ PHRASE BAND ━━━ */}
            <section className="stats-strip">
                <div className="phrase-track">
                    <span className="phrase-set">
                        <span className="phrase-band"><T pt="Canalização · Carpintaria · Eletricidade · Pintura · Serviços de Confiança" en="Plumbing · Carpentry · Electrical · Painting · Trusted Home Services" sv="VVS · Snickeri · El · Målning · Pålitliga Hemtjänster" /></span>
                        <span className="phrase-dot" />
                    </span>
                    <span className="phrase-set">
                        <span className="phrase-band"><T pt="Canalização · Carpintaria · Eletricidade · Pintura · Serviços de Confiança" en="Plumbing · Carpentry · Electrical · Painting · Trusted Home Services" sv="VVS · Snickeri · El · Målning · Pålitliga Hemtjänster" /></span>
                        <span className="phrase-dot" />
                    </span>
                </div>
            </section>

            {/* ━━━ HOW IT WORKS ━━━ */}
            <section className="how-section section-pad" id="how">
                <div className="container">
                    <div className="section-header centered">
                        <div className="section-overline"><T pt="Simples e rápido" en="Simple and fast" sv="Enkelt och snabbt" /></div>
                        <h2><T pt="Marca o teu serviço em 3 passos" en="Book your service in 3 steps" sv="Boka din tjänst i 3 steg" /></h2>
                        <p><T pt="Sem surpresas, sem telefonemas longos. O serviço que precisas, marcado em minutos." en="No surprises, no long phone calls. The service you need, booked in minutes." sv="Inga överraskningar, inga långa telefonsamtal. Tjänsten du behöver, bokad på minuter." /></p>
                    </div>
                    <div className="steps-grid">
                        {STEPS.map((s) => (
                            <div className="step-card" key={s.num}>
                                <div className="step-img"><img src={s.img} alt={s.title} loading="lazy" /></div>
                                <div className="step-number">{s.num}</div>
                                <div className="step-icon"><s.Icon size={24} /></div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="service-preview-strip">
                        {PREVIEWS.map((p) => (
                            <div className="service-preview-card" key={p.title}>
                                <div className="service-preview-img"><img src={p.img} alt={p.title} loading="lazy" /></div>
                                <div className="service-preview-info">
                                    <div className="service-preview-label"><T pt="A partir de" en="Starting from" sv="Från" /></div>
                                    <h4>{p.title}</h4>
                                    <div className="service-preview-price">{p.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ SERVICE CATEGORIES ━━━ */}
            <section className="services-section section-pad" id="services">
                <div className="container">
                    <div className="section-header">
                        <div className="section-overline"><T pt="Temos o que precisas" en="We have what you need" sv="Vi har det du behöver" /></div>
                        <h2><T pt="O que precisas hoje?" en="What do you need today?" sv="Vad behöver du idag?" /></h2>
                        <p><T pt="200+ serviços disponíveis, realizados por profissionais verificados da tua comunidade." en="200+ services available, delivered by verified professionals from your community." sv="200+ tjänster tillgängliga, utförda av verifierade proffs från ditt samhälle." /></p>
                    </div>
                    <div className="categories-grid">
                        {CATEGORIES.map((c) => (
                            <div className="category-card" key={c.label}>
                                <div className="cat-img"><img src={c.img} alt={c.label} loading="lazy" /></div>
                                <div className="category-icon"><c.Icon size={24} /></div>
                                <div className="category-label">{c.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ REVIEWS ━━━ */}
            <section className="reviews-section section-pad" id="reviews">
                <div className="container">
                    <div className="section-header centered">
                        <div className="section-overline"><T pt="Avaliações verificadas" en="Verified reviews" sv="Verifierade omdömen" /></div>
                        <div className="reviews-stats">
                            <div className="reviews-score">4.8</div>
                            <div>
                                <div className="reviews-stars">{[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}</div>
                                <div className="reviews-count"><T pt="de 3.847 avaliações de clientes" en="from 3,847 customer reviews" sv="från 3 847 kundomdömen" /></div>
                            </div>
                        </div>
                        <h2><T pt="Serviços entregues com confiança" en="Services delivered with trust" sv="Tjänster levererade med förtroende" /></h2>
                    </div>
                    <div className="reviews-grid">
                        {REVIEWS_DATA.map((r) => (
                            <div className="review-card" key={r.initials}>
                                <div className="review-stars">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                                <p className="review-text">&ldquo;{r.text}&rdquo;</p>
                                <div className="review-author">
                                    <div className="review-avatar">{r.initials}</div>
                                    <div className="review-author-info">
                                        <strong>{r.name}</strong>
                                        <span>{r.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ CITIES ━━━ */}
            <section className="cities-section section-pad" id="cities">
                <div className="container cities-inner">
                    <div className="cities-text">
                        <div className="section-overline"><T pt="Onde estamos" en="Where we are" sv="Var vi finns" /></div>
                        <h2><T pt="Serviços no Grande Porto" en="Services across the Porto Area" sv="Tjänster i Stockholm och Göteborg" /></h2>
                        <p><T pt="Já presentes nas principais juntas de freguesia do Grande Porto, com expansão contínua." en="Already present across the major parishes of the Porto area, with continuous expansion." sv="Redan i kommuner runt Stockholm och Göteborg, med kontinuerlig expansion." /></p>
                        <div className="city-tags">
                            {CITIES.map((c) => <span className="city-tag" key={c}>{c}</span>)}
                            {COMING_SOON.map((c) => <span className="city-tag coming-soon" key={c}>{c} (<T pt="em breve" en="coming soon" sv="kommer snart" />)</span>)}
                        </div>
                    </div>
                    <div className="cities-visual">
                        <div className="cities-visual-inner">
                            <img src={communityImg} alt="70.30 Community" loading="lazy" />
                            <div className="cities-badge"><strong>15+</strong><span><T pt="freguesias cobertas" en="parishes covered" sv="kommuner täckta" /></span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ TRUST ━━━ */}
            <section className="trust-section section-pad" id="trust">
                <div className="container trust-inner">
                    <div className="trust-image-wrap">
                        <img src={carpinteiroImg} alt="Verified Professional" loading="lazy" />
                        <div className="trust-image-overlay">
                            <div className="trust-overlay-icon"><ShieldCheck size={22} /></div>
                            <div className="trust-overlay-text">
                                <strong><T pt="100% Verificado" en="100% Verified" sv="100% Verifierad" /></strong>
                                <span><T pt="Antecedentes e competências confirmados" en="Background and skills confirmed" sv="Bakgrund och kompetens bekräftade" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="trust-content">
                        <div className="section-overline"><T pt="Confia em quem presta o serviço" en="Trust who delivers the service" sv="Lita på den som levererar" /></div>
                        <h2><T pt={<>Profissionais verificados.<br />Sempre.</>} en={<>Verified professionals.<br />Always.</>} sv={<>Verifierade proffs.<br />Alltid.</>} /></h2>
                        <div className="trust-items">
                            {TRUST_ITEMS.map((ti) => (
                                <div className="trust-item" key={ti.title}>
                                    <div className="trust-item-icon"><ti.Icon size={22} /></div>
                                    <div className="trust-item-text">
                                        <h4>{ti.title}</h4>
                                        <p>{ti.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ FAQ ━━━ */}
            <section className="faq-section section-pad" id="faq">
                <div className="container">
                    <div className="section-header centered">
                        <div className="section-overline"><T pt="Perguntas frequentes" en="Frequently asked questions" sv="Vanliga frågor" /></div>
                        <h2><T pt="Tens dúvidas? Nós respondemos." en="Have questions? We answer them." sv="Har du frågor? Vi svarar." /></h2>
                    </div>
                    <div className="faq-list">
                        {FAQS.map((f, i) => (
                            <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <span>{f.q}</span>
                                    <ChevronDown size={20} className="faq-chevron" />
                                </button>
                                <div className="faq-answer"><div className="faq-answer-inner">{f.a}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ CTA ━━━ */}
            <section className="cta-section">
                <div className="container cta-inner">
                    <div className="cta-overline"><T pt="Começa hoje" en="Start today" sv="Börja idag" /></div>
                    <h2><T pt={<>O teu serviço, <em>a um toque.</em></>} en={<>Your service, <em>one tap away.</em></>} sv={<>Din tjänst, <em>ett tryck bort.</em></>} /></h2>
                    <p><T pt="Descarrega a app e acede a centenas de profissionais verificados na tua zona. Grátis para clientes." en="Download the app and access hundreds of verified professionals in your area. Free for clients." sv="Ladda ner appen och få tillgång till hundratals verifierade proffs i ditt område. Gratis för kunder." /></p>
                    <div className="cta-actions">
                        <a href="#services" className="btn-cta-green"><Wrench size={18} /> <T pt="Pedir um serviço" en="Request a service" sv="Begär en tjänst" /></a>
                        <Link to="/login" className="btn-cta-ghost"><T pt="Entrar na plataforma" en="Sign in to platform" sv="Logga in på plattformen" /> <ArrowRight size={18} /></Link>
                    </div>
                </div>
            </section>

            {/* ━━━ POPULAR SEARCHES ━━━ */}
            <section className="popular-section">
                <div className="container">
                    <div className="popular-inner">
                        <span className="popular-label"><T pt="Pesquisas populares" en="Popular searches" sv="Populära sökningar" /></span>
                        <div className="popular-links">
                            {POPULAR.map((p) => <a href="#services" className="popular-link" key={p}>{p}</a>)}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
