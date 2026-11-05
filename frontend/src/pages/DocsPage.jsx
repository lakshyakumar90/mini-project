import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Command, FileText, GitBranch, Menu, Search, X } from 'lucide-react';
import MermaidDiagram from '@/components/docs/MermaidDiagram';
import '@/styles/docs.css';

const groups = [
  { title: 'Start here', slugs: ['README', '01-project-overview'] },
  { title: 'Architecture', slugs: ['03-architecture-and-design-decisions', '04-folder-and-file-reference', '05-feature-and-code-walkthroughs', '06-database-and-data-models', '07-authentication-and-security', '08-api-and-realtime-workflows'] },
  { title: 'Engineering', slugs: ['02-tech-stack-deep-dive', '09-testing-and-code-quality', '10-development-and-deployment-guide', '13-scalability-and-performance', '14-improvements-and-technical-debt'] },
  { title: 'Interview prep', slugs: ['11-interview-questions-and-answers', '12-build-from-scratch-guide', '16-improvement-playbook', '15-glossary-and-quick-revision'] },
];

const diagramGroups = [
  { title: 'System maps', files: ['system-architecture', 'repository-architecture', 'frontend-architecture', 'backend-architecture', 'database-er'] },
  { title: 'Request flows', files: ['authentication-flow', 'api-request-lifecycle', 'realtime-workflow', 'deployment-workflow'] },
  { title: 'Feature flows', files: ['feature-workflows/posts', 'feature-workflows/connections', 'feature-workflows/jobs'] },
];

const cleanTitle = (title = '') => title.replace(/^\d+\s*[·.]\s*/, '');
const headingId = (value = '') => value.toLowerCase().trim().replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
const plainText = (children) => Array.isArray(children) ? children.map(plainText).join('') : typeof children === 'string' || typeof children === 'number' ? String(children) : children?.props?.children ? plainText(children.props.children) : '';

function resolveDocLink(href = '') {
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  const [file, hash] = href.split('#');
  if (file.endsWith('.mmd')) return `/docs/diagrams/${file.replace(/^diagrams\//, '').replace(/\.mmd$/, '')}`;
  if (file.endsWith('.md')) return `/docs/${file.split('/').pop().replace(/\.md$/, '')}${hash ? `#${hash}` : ''}`;
  return href;
}

function Markdown({ content }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    h1: ({ children }) => <h1 id={headingId(plainText(children))}>{children}</h1>,
    h2: ({ children }) => <h2 id={headingId(plainText(children))}>{children}</h2>,
    h3: ({ children }) => <h3 id={headingId(plainText(children))}>{children}</h3>,
    a: ({ href = '', children, ...props }) => <a href={resolveDocLink(href)} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})} {...props}>{children}</a>,
    pre: ({ children }) => {
      const code = Array.isArray(children) ? children[0] : children;
      if (code?.props?.className?.includes('language-mermaid')) return <MermaidDiagram source={String(code.props.children).replace(/\n$/, '')} />;
      return <pre>{children}</pre>;
    },
    code: ({ className, children, ...props }) => {
      return <code className={className} {...props}>{children}</code>;
    },
  }}>{content}</ReactMarkdown>;
}

function Sidebar({ manifest, activeSlug, activeDiagram, query, onNavigate }) {
  const matches = (item) => !query || `${item.title} ${item.summary || ''} ${item.file}`.toLowerCase().includes(query.toLowerCase());
  return <>
    <div className="docs-sidebar-head"><Link to="/docs" className="docs-brand" onClick={onNavigate}><span className="docs-brand-mark">D</span><span>DevConnect <b>Docs</b></span></Link></div>
    <Link to="/docs" className="docs-home-link" onClick={onNavigate}><BookOpen size={16} /> Documentation home</Link>
    <div className="docs-nav-scroll">
      {groups.map((group) => {
        const items = group.slugs.map((slug) => manifest.docs?.find((doc) => doc.slug === slug)).filter(Boolean).filter(matches);
        if (!items.length) return null;
        return <section className="docs-nav-group" key={group.title}>
          <p className="docs-nav-label">{group.title}</p>
          {items.map((item) => <Link key={item.slug} to={`/docs/${item.slug}`} onClick={onNavigate} className={`docs-nav-link ${activeSlug === item.slug ? 'is-active' : ''}`}><FileText size={14} /><span>{cleanTitle(item.title)}</span></Link>)}
        </section>;
      })}
      <section className="docs-nav-group docs-diagram-nav">
        <p className="docs-nav-label">Diagrams</p>
        {diagramGroups.map((group) => {
          const items = group.files.map((slug) => manifest.diagrams?.find((diagram) => diagram.slug === slug)).filter(Boolean).filter(matches);
          if (!items.length) return null;
          return <details key={group.title} open>
            <summary><ChevronDown size={13} />{group.title}</summary>
            {items.map((item) => <Link key={item.slug} to={`/docs/diagrams/${item.slug}`} onClick={onNavigate} className={`docs-nav-link docs-diagram-link ${activeDiagram === item.slug ? 'is-active' : ''}`}><GitBranch size={13} /><span>{item.title}</span></Link>)}
          </details>;
        })}
      </section>
    </div>
    <div className="docs-sidebar-foot"><span className="docs-status-dot" /> Implementation-grounded notes <span>Updated Nov 2026</span></div>
  </>;
}

function TableOfContents({ headings }) {
  return <aside className="docs-toc"><div className="docs-toc-inner"><p>On this page</p>{headings.map((heading) => <a key={`${heading.id}-${heading.index}`} className={`toc-level-${heading.level}`} href={`#${heading.id}`}>{heading.text}</a>)}</div></aside>;
}

export default function DocsPage() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
  const isDiagram = parts[0] === 'diagrams' && parts.length > 1;
  const slug = isDiagram ? null : parts[0] || null;
  const diagramSlug = isDiagram ? parts.slice(1).join('/') : null;
  const [manifest, setManifest] = useState({ docs: [], diagrams: [] });
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/docs/content/manifest.json').then((response) => {
      if (!response.ok) throw new Error('Could not load docs index');
      return response.json();
    }).then(setManifest).catch(() => setError('The documentation index could not be loaded. Build the app so its docs content is copied into the public bundle.'));
  }, []);

  const currentDoc = manifest.docs.find((doc) => doc.slug === slug);
  const currentDiagram = manifest.diagrams.find((diagram) => diagram.slug === diagramSlug);

  useEffect(() => {
    let cancelled = false;
    const file = currentDoc?.file || currentDiagram?.file;
    if (!file) { setContent(''); setLoading(false); return undefined; }
    setLoading(true);
    setError('');
    fetch(`/docs/content/${file.split('/').map(encodeURIComponent).join('/')}`).then((response) => {
      if (!response.ok) throw new Error('Documentation file not found');
      return response.text();
    }).then((text) => { if (!cancelled) setContent(text); }).catch(() => { if (!cancelled) setError('This documentation page could not be loaded.'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentDoc?.file, currentDiagram?.file]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const listener = (event) => {
      if ((event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault(); document.querySelector('.docs-search-input')?.focus();
      }
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const headings = useMemo(() => [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match, index) => ({ level: match[1].length, text: match[2].replace(/[`*_~]/g, ''), id: headingId(match[2]), index })), [content]);
  const docIndex = manifest.docs.findIndex((doc) => doc.slug === slug);
  const previous = docIndex > 0 ? manifest.docs[docIndex - 1] : null;
  const next = docIndex >= 0 ? manifest.docs[docIndex + 1] : null;

  return <div className="docs-app">
    <div className={`docs-mobile-backdrop ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />
    <aside className={`docs-sidebar ${mobileOpen ? 'mobile-open' : ''}`}><button className="docs-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button><Sidebar manifest={manifest} activeSlug={slug} activeDiagram={diagramSlug} query={query} onNavigate={() => setMobileOpen(false)} /></aside>
    <div className="docs-main-shell">
      <header className="docs-topbar"><button className="docs-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="docs-mobile-brand"><Link to="/docs">DevConnect <b>Docs</b></Link></div><div className="docs-topbar-crumb"><span>Documentation</span><ChevronRight size={14} /> <span>{currentDoc ? cleanTitle(currentDoc.title) : currentDiagram?.title || 'Project notes'}</span></div><label className="docs-search"><Search size={16} /><input className="docs-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documentation..." aria-label="Search documentation" /><kbd><Command size={11} /> K</kbd>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}</label></header>
      <div className={`docs-layout ${currentDiagram ? 'diagram-layout' : ''}`}>
        <main className="docs-content">
          {loading && !manifest.docs.length ? <div className="docs-loading"><span /> Loading project notes…</div> : null}
          {error && !content ? <div className="docs-error"><h1>Documentation unavailable</h1><p>{error}</p></div> : null}
          {!slug && !isDiagram && !error && <DocsHome manifest={manifest} query={query} />}
          {slug && !currentDoc && manifest.docs.length > 0 && <div className="docs-error"><h1>Page not found</h1><p>Choose a topic from the navigation.</p><Link to="/docs">Back to documentation</Link></div>}
          {isDiagram && !currentDiagram && manifest.diagrams.length > 0 && <div className="docs-error"><h1>Diagram not found</h1><Link to="/docs">Back to documentation</Link></div>}
          {currentDoc && content && <article className="docs-article"><div className="docs-eyebrow">PROJECT NOTES <span>·</span> {String(docIndex + 1).padStart(2, '0')} / {manifest.docs.length}</div><Markdown content={content} /><DocsPager previous={previous} next={next} /></article>}
          {currentDiagram && content && <article className="docs-article docs-diagram-page"><div className="docs-eyebrow">DIAGRAMS <span>·</span> SYSTEM MAP</div><h1>{currentDiagram.title}</h1><p className="docs-diagram-intro">A visual map of the implementation described in the project notes. The source diagram is kept alongside the documentation.</p><MermaidDiagram source={content} /><details className="docs-source"><summary><ChevronDown size={15} /> View Mermaid source</summary><pre><code>{content}</code></pre></details></article>}
          {currentDiagram && <Link className="docs-back-to-notes" to="/docs/03-architecture-and-design-decisions">Read architecture notes <ArrowRight size={15} /></Link>}
        </main>
        {slug && content && headings.length > 0 && <TableOfContents headings={headings} />}
      </div>
      <footer className="docs-footer"><span>DevConnect project notes</span><span>Built from the source, routes, models, and configuration in this repository.</span></footer>
    </div>
  </div>;
}

function DocsHome({ manifest, query }) {
  const filtered = manifest.docs.filter((doc) => !query || `${doc.title} ${doc.summary} ${doc.file}`.toLowerCase().includes(query.toLowerCase()));
  const featured = filtered.filter((doc) => ['01-project-overview', '03-architecture-and-design-decisions', '11-interview-questions-and-answers', '16-improvement-playbook'].includes(doc.slug));
  return <div className="docs-home">
    <div className="docs-home-kicker"><span className="docs-status-dot" /> ENGINEERING HANDBOOK <span className="docs-kicker-line" /></div>
    <h1>Understand the project.<br /><span>Own the system.</span></h1>
    <p className="docs-home-lede">A practical guide to how DevConnect is built, how its pieces work together, and what to improve next.</p>
    <div className="docs-home-meta"><span><FileText size={15} /> {manifest.docs.length} chapters</span><span><GitBranch size={15} /> {manifest.diagrams.length} diagrams</span><span>Source-grounded · Updated Nov 2026</span></div>
    <div className="docs-home-section-head"><div><p>GET ORIENTED</p><h2>Start with the essentials</h2></div><span>01 — 03</span></div>
    <div className="docs-feature-grid">{featured.map((doc, index) => <Link to={`/docs/${doc.slug}`} className={`docs-feature-card feature-${index}`} key={doc.slug}><span className="feature-index">{String(index + 1).padStart(2, '0')}</span><span className="feature-arrow"><ArrowRight size={16} /></span><h3>{cleanTitle(doc.title)}</h3><p>{doc.summary || 'Explore the implementation and its trade-offs.'}</p><span className="feature-read">Read chapter <ArrowRight size={13} /></span></Link>)}</div>
    <div className="docs-home-section-head all-chapters-head"><div><p>THE HANDBOOK</p><h2>{query ? `${filtered.length} matching chapters` : 'All chapters'}</h2></div><span>{String(filtered.length).padStart(2, '0')} CHAPTERS</span></div>
    <div className="docs-chapter-list">{filtered.map((doc, index) => <Link to={`/docs/${doc.slug}`} className="docs-chapter-row" key={doc.slug}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{cleanTitle(doc.title)}</b><small>{doc.summary}</small></div><ArrowRight size={16} /></Link>)}{filtered.length === 0 && <p className="docs-no-results">No chapters match “{query}”. Try another search.</p>}</div>
    <div className="docs-diagrams-callout"><div className="diagram-callout-icon"><GitBranch size={18} /></div><div><b>See the system, not just the words.</b><p>Architecture, data relationships, and key workflows in Mermaid diagrams.</p></div><Link to="/docs/diagrams/system-architecture">Explore diagrams <ArrowRight size={14} /></Link></div>
    <div className="docs-source-note"><Check size={15} /><p>Every explanation is tied to the implementation. Unverified historical decisions and areas needing investigation are called out explicitly.</p></div>
  </div>;
}

function DocsPager({ previous, next }) {
  return <nav className="docs-pager" aria-label="Chapter navigation">{previous ? <Link to={`/docs/${previous.slug}`}><small><ArrowLeft size={13} /> PREVIOUS</small><b>{cleanTitle(previous.title)}</b></Link> : <span />}{next && <Link to={`/docs/${next.slug}`} className="pager-next"><small>NEXT <ArrowRight size={13} /></small><b>{cleanTitle(next.title)}</b></Link>}</nav>;
}
