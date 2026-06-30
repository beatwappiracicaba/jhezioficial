import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import singerImg from '../img/Jhezi.png';
import logoImg from '../img/logo.png';
import { loadAdminStatus, loadContent, loadTheme, saveAdminStatus, saveContent, saveTheme } from './lib/contentStore';

const ADMIN_USER = 'producer';
const ADMIN_PASS = 'jhezi2026';

const DEFAULT_CONTENT = {
  heroEyebrow: 'O Diferenciado do Forró',
  heroTitle: 'De Minas para o Brasil, com presença que marca a noite.',
  heroLead:
    'Jhezi leva emoção, identidade e energia para cada palco, com um estilo marcante que faz o público parar e viver o momento.',
  heroButtonText: 'Reservar apresentação',
  heroSecondaryText: 'Conhecer mais',
  aboutTitle: 'Uma performance forte, autêntica e inesquecível.',
  aboutText:
    'O Jhezi transforma cada evento em uma experiência única, com repertório vibrante, presença de palco e uma conexão forte com o público.',
  highlights: [
    'Performance intensa com presença de palco',
    'Repertório cheio de forró, pisadinha e emoção',
    'Atendimento personalizado para cada evento',
  ],
  events: [
    { date: '15/07', title: 'Festa Comemorativa', place: 'São Paulo' },
    { date: '22/07', title: 'Evento Privado', place: 'Campinas' },
    { date: '05/08', title: 'Show Aberto', place: 'Belo Horizonte' },
  ],
  contactTitle: 'Pronto para transformar seu evento em algo inesquecível?',
  contactText:
    'Entre em contato para saber sobre agenda, disponibilidade e uma apresentação feita sob medida para o seu público.',
  contactEmail: 'contato@jhezi.com',
  whatsapp: '33998485840',
  instagram: 'https://www.instagram.com/jhezi_odiferenciado_doforro',
  youtube: 'https://youtube.com/@jhezi_odiferenciado_doforro',
  heroImage: singerImg,
  logoImage: logoImg,
  media: [
    {
      id: 1,
      title: 'Último show',
      description: 'Momento de grande energia em palco.',
      category: 'show',
      image: singerImg,
    },
    {
      id: 2,
      title: 'Novo lançamento',
      description: 'Repertório novo para o público cantar.',
      category: 'release',
      image: singerImg,
    },
  ],
  videos: [
    {
      id: 1,
      title: 'Show ao vivo',
      url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    },
  ],
};

function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState('dark');
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [highlightsText, setHighlightsText] = useState(DEFAULT_CONTENT.highlights.join('\n'));
  const [eventsText, setEventsText] = useState(
    DEFAULT_CONTENT.events.map((event) => `${event.date}|${event.title}|${event.place}`).join('\n')
  );
  const [mediaForm, setMediaForm] = useState({ title: '', description: '', category: 'show', image: '' });

  useEffect(() => {
    const init = async () => {
      const savedContent = await loadContent(DEFAULT_CONTENT);
      setContent({ ...DEFAULT_CONTENT, ...savedContent, media: savedContent.media || DEFAULT_CONTENT.media, videos: savedContent.videos || DEFAULT_CONTENT.videos });
      setHighlightsText((savedContent.highlights || DEFAULT_CONTENT.highlights).join('\n'));
      setEventsText(
        (savedContent.events || DEFAULT_CONTENT.events)
          .map((event) => `${event.date}|${event.title}|${event.place}`)
          .join('\n')
      );
      setTheme(loadTheme());
      setIsAdmin(loadAdminStatus());
    };

    init();
  }, []);

  useEffect(() => {
    saveContent(content);
  }, [content]);

  const releases = useMemo(() => content.media.filter((item) => item.category === 'release'), [content.media]);
  const shows = useMemo(() => content.media.filter((item) => item.category === 'show'), [content.media]);

  const handleLogin = (event) => {
    event.preventDefault();
    if (loginForm.username === ADMIN_USER && loginForm.password === ADMIN_PASS) {
      setIsAdmin(true);
      localStorage.setItem('jhezi-admin', 'true');
      return;
    }
    window.alert('Credenciais inválidas.');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    saveAdminStatus(false);
  };

  const handleHighlightsChange = (value) => {
    setHighlightsText(value);
    setContent((prev) => ({ ...prev, highlights: value.split('\n').map((item) => item.trim()).filter(Boolean) }));
  };

  const handleEventsChange = (value) => {
    setEventsText(value);
    const parsedEvents = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [date, title, place] = line.split('|');
        return { date: date || '', title: title || '', place: place || '' };
      });
    setContent((prev) => ({ ...prev, events: parsedEvents }));
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMediaForm((prev) => ({ ...prev, image: reader.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddMedia = (event) => {
    event.preventDefault();
    if (!mediaForm.title || !mediaForm.image) {
      window.alert('Preencha o título e selecione uma imagem.');
      return;
    }

    setContent((prev) => ({
      ...prev,
      media: [
        {
          id: Date.now(),
          title: mediaForm.title,
          description: mediaForm.description,
          category: mediaForm.category,
          image: mediaForm.image,
        },
        ...prev.media,
      ],
    }));

    setMediaForm({ title: '', description: '', category: 'show', image: '' });
  };

  const handleDeleteMedia = (id) => {
    setContent((prev) => ({ ...prev, media: prev.media.filter((item) => item.id !== id) }));
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  const handleOpenAdmin = (event) => {
    event.preventDefault();
    window.open('/admin', '_blank', 'noopener,noreferrer');
  };

  const handleImageUpload = (event, target) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setContent((prev) => ({ ...prev, [target]: reader.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  if (isAdminRoute) {
    return (
      <div className={`app-shell theme-${theme}`}>
        <header className="hero">
          <nav className="nav container">
            <a className="brand-wrap" href="/">
              <img src={content.logoImage || logoImg} alt="Logo Jhezi" className="logo" />
              <span>Jhezi</span>
            </a>
            <div className="nav-links">
              <a href="/">Voltar ao site</a>
            </div>
          </nav>
        </header>

        <main className="container">
          <section className="section">
            <div className="admin-shell">
              {!isAdmin ? (
                <form className="admin-card" onSubmit={handleLogin}>
                  <p className="eyebrow">Painel do produtor</p>
                  <h3>Acesse para editar fotos, agenda e contatos</h3>
                  <label>
                    Usuário
                    <input value={loginForm.username} onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))} />
                  </label>
                  <label>
                    Senha
                    <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
                  </label>
                  <button className="btn btn-primary" type="submit">Entrar</button>
                </form>
              ) : (
                <>
                  <div className="admin-toolbar">
                    <h3>Painel do produtor</h3>
                    <div className="admin-actions">
                      <button className="btn btn-secondary" type="button" onClick={handleThemeToggle}>Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}</button>
                      <button className="btn btn-secondary" type="button" onClick={handleLogout}>Sair</button>
                    </div>
                  </div>

                  <div className="admin-grid">
                    <div className="admin-card">
                      <h4>Conteúdo principal</h4>
                      <label>
                        Legenda do topo
                        <input value={content.heroEyebrow} onChange={(event) => setContent((prev) => ({ ...prev, heroEyebrow: event.target.value }))} />
                      </label>
                      <label>
                        Título principal
                        <input value={content.heroTitle} onChange={(event) => setContent((prev) => ({ ...prev, heroTitle: event.target.value }))} />
                      </label>
                      <label>
                        Texto principal
                        <textarea value={content.heroLead} onChange={(event) => setContent((prev) => ({ ...prev, heroLead: event.target.value }))} />
                      </label>
                      <label>
                        Texto do sobre
                        <textarea value={content.aboutTitle} onChange={(event) => setContent((prev) => ({ ...prev, aboutTitle: event.target.value }))} />
                      </label>
                      <label>
                        Descrição do sobre
                        <textarea value={content.aboutText} onChange={(event) => setContent((prev) => ({ ...prev, aboutText: event.target.value }))} />
                      </label>
                      <label>
                        Destaques (um por linha)
                        <textarea value={highlightsText} onChange={(event) => handleHighlightsChange(event.target.value)} />
                      </label>
                      <label>
                        Agenda (data|título|local, um por linha)
                        <textarea value={eventsText} onChange={(event) => handleEventsChange(event.target.value)} />
                      </label>
                    </div>

                    <div className="admin-card">
                      <h4>Logo e foto principal</h4>
                      <label>
                        Logo
                        <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, 'logoImage')} />
                      </label>
                      <label>
                        Foto principal
                        <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, 'heroImage')} />
                      </label>
                      <div className="preview-row">
                        <img src={content.logoImage || logoImg} alt="Preview logo" />
                        <img src={content.heroImage || singerImg} alt="Preview principal" />
                      </div>
                    </div>

                    <div className="admin-card">
                      <h4>Contato e redes</h4>
                      <label>
                        E-mail
                        <input value={content.contactEmail} onChange={(event) => setContent((prev) => ({ ...prev, contactEmail: event.target.value }))} />
                      </label>
                      <label>
                        WhatsApp (apenas números)
                        <input value={content.whatsapp} onChange={(event) => setContent((prev) => ({ ...prev, whatsapp: event.target.value }))} />
                      </label>
                      <label>
                        Instagram
                        <input value={content.instagram} onChange={(event) => setContent((prev) => ({ ...prev, instagram: event.target.value }))} />
                      </label>
                      <label>
                        YouTube
                        <input value={content.youtube} onChange={(event) => setContent((prev) => ({ ...prev, youtube: event.target.value }))} />
                      </label>
                      <label>
                        Título de contato
                        <input value={content.contactTitle} onChange={(event) => setContent((prev) => ({ ...prev, contactTitle: event.target.value }))} />
                      </label>
                      <label>
                        Texto de contato
                        <textarea value={content.contactText} onChange={(event) => setContent((prev) => ({ ...prev, contactText: event.target.value }))} />
                      </label>
                    </div>

                    <div className="admin-card">
                      <h4>Adicionar lançamentos e shows</h4>
                      <label>
                        Título
                        <input value={mediaForm.title} onChange={(event) => setMediaForm((prev) => ({ ...prev, title: event.target.value }))} />
                      </label>
                      <label>
                        Descrição
                        <input value={mediaForm.description} onChange={(event) => setMediaForm((prev) => ({ ...prev, description: event.target.value }))} />
                      </label>
                      <label>
                        Tipo
                        <select value={mediaForm.category} onChange={(event) => setMediaForm((prev) => ({ ...prev, category: event.target.value }))}>
                          <option value="show">Show</option>
                          <option value="release">Lançamento</option>
                        </select>
                      </label>
                      <label>
                        Imagem
                        <input type="file" accept="image/*" onChange={handleMediaUpload} />
                      </label>
                      <button className="btn btn-primary" type="button" onClick={handleAddMedia}>Salvar mídia</button>

                      <div className="media-list">
                        {content.media.map((item) => (
                          <div className="media-item" key={item.id}>
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.description}</p>
                            </div>
                            <button className="btn btn-secondary" type="button" onClick={() => handleDeleteMedia(item.id)}>Excluir</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="hero">
        <nav className="nav container">
          <a className="brand-wrap" href="#top">
            <img src={content.logoImage || logoImg} alt="Logo Jhezi" className="logo" />
            <span>Jhezi</span>
          </a>
          <div className="nav-links">
            <a href="#sobre">Sobre</a>
            <a href="#media">Lançamentos</a>
            <a href="#agenda">Agenda</a>
            <a href="#videos">Vídeos</a>
            <a href="#contato">Contato</a>
            <a href="/admin" target="_blank" rel="noopener noreferrer">Login</a>
          </div>
        </nav>

        <div className="hero-content container" id="top">
          <div className="hero-copy">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p className="lead">{content.heroLead}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contato">{content.heroButtonText}</a>
              <a className="btn btn-secondary" href="#sobre">{content.heroSecondaryText}</a>
            </div>
            <div className="social-strip">
              <a href={content.youtube} target="_blank" rel="noreferrer">YouTube</a>
              <a href={content.instagram} target="_blank" rel="noreferrer">Instagram</a>
              <a href={`https://wa.me/55${content.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <img src={content.heroImage || singerImg} alt="Cantor Jhezi em apresentação" className="singer-photo" />
          </div>
        </div>
      </header>

      <main>
        <section id="sobre" className="section container">
          <div className="section-title">
            <p className="eyebrow">Quem é Jhezi</p>
            <h2>{content.aboutTitle}</h2>
            <p className="section-text">{content.aboutText}</p>
          </div>

          <div className="feature-grid">
            <article className="panel big-panel">
              <h3>Uma voz que prende a atenção</h3>
              <p>
                Cada apresentação é construída para emocionar, fazer o público cantar e transformar cada evento em uma experiência memorável.
              </p>
            </article>
            <article className="panel">
              <ul className="highlights">
                {content.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section id="media" className="section section-dark">
          <div className="container">
            <div className="section-title center">
              <p className="eyebrow">Últimos lançamentos</p>
              <h2>Momentos marcantes, shows e novidades.</h2>
            </div>

            <div className="media-group">
              <div>
                <h3>Últimos lançamentos</h3>
                <div className="media-grid">
                  {releases.length > 0 ? (
                    releases.map((item) => (
                      <article className="media-card" key={item.id}>
                        <img src={item.image} alt={item.title} />
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="empty-state">Nenhum lançamento adicionado ainda.</p>
                  )}
                </div>
              </div>

              <div>
                <h3>Últimos shows</h3>
                <div className="media-grid">
                  {shows.length > 0 ? (
                    shows.map((item) => (
                      <article className="media-card" key={item.id}>
                        <img src={item.image} alt={item.title} />
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="empty-state">Nenhum show adicionado ainda.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="agenda" className="section container">
          <div className="section-title center">
            <p className="eyebrow">Agenda</p>
            <h2>Os próximos capítulos do show.</h2>
          </div>

          <div className="events-grid">
            {content.events.map((event) => (
              <article className="event-card" key={`${event.date}-${event.title}`}>
                <strong>{event.date}</strong>
                <h3>{event.title}</h3>
                <p>{event.place}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="videos" className="section container">
          <div className="section-title">
            <p className="eyebrow">Vídeos</p>
            <h2>Momentos em destaque para o público.</h2>
          </div>
          <div className="video-grid">
            {content.videos.map((video) => (
              <div className="video-card" key={video.id}>
                <iframe
                  src={video.url}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <h3>{video.title}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="section container" id="admin">
          <div className="admin-shell">
            {!isAdmin ? (
              <form className="admin-card" onSubmit={handleLogin}>
                <p className="eyebrow">Painel do produtor</p>
                <h3>Acesse para editar fotos, agenda e contatos</h3>
                <label>
                  Usuário
                  <input value={loginForm.username} onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))} />
                </label>
                <label>
                  Senha
                  <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
                </label>
                <button className="btn btn-primary" type="submit">Entrar</button>
              </form>
            ) : (
              <>
                <div className="admin-toolbar">
                  <h3>Painel do produtor</h3>
                  <div className="admin-actions">
                    <button className="btn btn-secondary" type="button" onClick={handleThemeToggle}>Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}</button>
                    <button className="btn btn-secondary" type="button" onClick={handleLogout}>Sair</button>
                  </div>
                </div>

                <div className="admin-grid">
                  <div className="admin-card">
                    <h4>Conteúdo principal</h4>
                    <label>
                      Legenda do topo
                      <input value={content.heroEyebrow} onChange={(event) => setContent((prev) => ({ ...prev, heroEyebrow: event.target.value }))} />
                    </label>
                    <label>
                      Título principal
                      <input value={content.heroTitle} onChange={(event) => setContent((prev) => ({ ...prev, heroTitle: event.target.value }))} />
                    </label>
                    <label>
                      Texto principal
                      <textarea value={content.heroLead} onChange={(event) => setContent((prev) => ({ ...prev, heroLead: event.target.value }))} />
                    </label>
                    <label>
                      Texto do sobre
                      <textarea value={content.aboutTitle} onChange={(event) => setContent((prev) => ({ ...prev, aboutTitle: event.target.value }))} />
                    </label>
                    <label>
                      Descrição do sobre
                      <textarea value={content.aboutText} onChange={(event) => setContent((prev) => ({ ...prev, aboutText: event.target.value }))} />
                    </label>
                    <label>
                      Destaques (um por linha)
                      <textarea value={highlightsText} onChange={(event) => handleHighlightsChange(event.target.value)} />
                    </label>
                    <label>
                      Agenda (data|título|local, um por linha)
                      <textarea value={eventsText} onChange={(event) => handleEventsChange(event.target.value)} />
                    </label>
                  </div>

                  <div className="admin-card">
                    <h4>Logo e foto principal</h4>
                    <label>
                      Logo
                      <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, 'logoImage')} />
                    </label>
                    <label>
                      Foto principal
                      <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, 'heroImage')} />
                    </label>
                    <div className="preview-row">
                      <img src={content.logoImage || logoImg} alt="Preview logo" />
                      <img src={content.heroImage || singerImg} alt="Preview principal" />
                    </div>
                  </div>

                  <div className="admin-card">
                    <h4>Contato e redes</h4>
                    <label>
                      E-mail
                      <input value={content.contactEmail} onChange={(event) => setContent((prev) => ({ ...prev, contactEmail: event.target.value }))} />
                    </label>
                    <label>
                      WhatsApp (apenas números)
                      <input value={content.whatsapp} onChange={(event) => setContent((prev) => ({ ...prev, whatsapp: event.target.value }))} />
                    </label>
                    <label>
                      Instagram
                      <input value={content.instagram} onChange={(event) => setContent((prev) => ({ ...prev, instagram: event.target.value }))} />
                    </label>
                    <label>
                      YouTube
                      <input value={content.youtube} onChange={(event) => setContent((prev) => ({ ...prev, youtube: event.target.value }))} />
                    </label>
                    <label>
                      Título de contato
                      <input value={content.contactTitle} onChange={(event) => setContent((prev) => ({ ...prev, contactTitle: event.target.value }))} />
                    </label>
                    <label>
                      Texto de contato
                      <textarea value={content.contactText} onChange={(event) => setContent((prev) => ({ ...prev, contactText: event.target.value }))} />
                    </label>
                  </div>

                  <div className="admin-card">
                    <h4>Adicionar lançamentos e shows</h4>
                    <label>
                      Título
                      <input value={mediaForm.title} onChange={(event) => setMediaForm((prev) => ({ ...prev, title: event.target.value }))} />
                    </label>
                    <label>
                      Descrição
                      <input value={mediaForm.description} onChange={(event) => setMediaForm((prev) => ({ ...prev, description: event.target.value }))} />
                    </label>
                    <label>
                      Tipo
                      <select value={mediaForm.category} onChange={(event) => setMediaForm((prev) => ({ ...prev, category: event.target.value }))}>
                        <option value="show">Show</option>
                        <option value="release">Lançamento</option>
                      </select>
                    </label>
                    <label>
                      Imagem
                      <input type="file" accept="image/*" onChange={handleMediaUpload} />
                    </label>
                    <button className="btn btn-primary" type="button" onClick={handleAddMedia}>Salvar mídia</button>

                    <div className="media-list">
                      {content.media.map((item) => (
                        <div className="media-item" key={item.id}>
                          <div>
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                          </div>
                          <button className="btn btn-secondary" type="button" onClick={() => handleDeleteMedia(item.id)}>Excluir</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section id="contato" className="section container">
          <div className="contact-card">
            <div>
              <p className="eyebrow">Reservas</p>
              <h2>{content.contactTitle}</h2>
              <p>{content.contactText}</p>
              <div className="contact-links">
                <a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a>
                <a href={`https://wa.me/55${content.whatsapp}`}>Whats: {content.whatsapp}</a>
              </div>
            </div>
            <a className="btn btn-primary" href={`https://wa.me/55${content.whatsapp}`}>Falar com Jhezi</a>
          </div>
        </section>
      </main>

      <a className="whatsapp-float" href={`https://wa.me/55${content.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>

      <footer className="footer">
        <div className="container footer-content">
          <p>© 2026 Jhezi. O Diferenciado do Forró.</p>
          <div className="footer-links">
            <a href={content.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={content.youtube} target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
