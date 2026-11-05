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
          mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: {
            background: '#030304',
            primaryColor: '#17171b', primaryTextColor: '#fafafa', primaryBorderColor: '#686873',
            secondaryColor: '#202026', secondaryTextColor: '#f4f4f5', secondaryBorderColor: '#686873',
            tertiaryColor: '#111114', tertiaryTextColor: '#f4f4f5', tertiaryBorderColor: '#52525b',
            lineColor: '#b0b0bb', textColor: '#f4f4f5', mainBkg: '#17171b', nodeBorder: '#686873',
            clusterBkg: '#0d0d10', clusterBorder: '#52525b', titleColor: '#fafafa', edgeLabelBackground: '#111114',
            actorBkg: '#17171b', actorBorder: '#686873', actorTextColor: '#fafafa', actorLineColor: '#8d8d98',
            signalColor: '#d4d4d8', signalTextColor: '#fafafa', labelBoxBkgColor: '#111114', labelBoxBorderColor: '#52525b',
            loopTextColor: '#f4f4f5', noteBkgColor: '#202026', noteTextColor: '#fafafa', noteBorderColor: '#686873',
            activationBkgColor: '#303039', activationBorderColor: '#8d8d98', sequenceNumberColor: '#fafafa',
            relationColor: '#b0b0bb', attributeBackgroundColor: '#17171b', fontSize: '17px', fontFamily: 'Manrope, Aptos, Segoe UI Variable, sans-serif'
          } });
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
