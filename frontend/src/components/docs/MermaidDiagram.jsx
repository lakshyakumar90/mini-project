import { useEffect, useId, useState } from 'react';
let initialized = false;

export default function MermaidDiagram({ source }) {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const { default: mermaid } = await import('mermaid');
        if (!initialized) {
          mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { primaryColor: '#f3f5fa', primaryTextColor: '#141923', primaryBorderColor: '#cbd2df', lineColor: '#56627a', secondaryColor: '#eef2ff', tertiaryColor: '#fff' } });
          initialized = true;
        }
        const result = await mermaid.render(`devconnect-diagram-${reactId}`, source);
        if (!cancelled) { setSvg(result.svg); setFailure(false); }
      } catch (error) {
        console.error('Mermaid render failed:', error);
        if (!cancelled) { setSvg(''); setFailure(true); }
      }
    }
    render();
    return () => { cancelled = true; };
  }, [reactId, source]);

  if (failure) return <div className="docs-mermaid-fallback"><b>Diagram source</b><pre><code>{source}</code></pre></div>;
  if (!svg) return <div className="docs-mermaid-loading">Rendering diagram…</div>;
  return <div className="docs-mermaid" role="img" aria-label="Mermaid architecture diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
