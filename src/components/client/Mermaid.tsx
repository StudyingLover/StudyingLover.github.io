'use client';

import { useEffect, useCallback, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
	code: string;
}

const Mermaid: React.FC<MermaidProps> = ({ code }) => {
	const mermaidRef = useRef<HTMLDivElement>(null);
	const uniqueId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

	const renderDiagram = useCallback(async () => {
		if (mermaidRef.current) {
			try {
				mermaidRef.current.innerHTML = '';

				mermaid.initialize({
					startOnLoad: true,
					theme: 'default',
					securityLevel: 'loose'
				});

				const { svg } = await mermaid.render(uniqueId.current, code);
				mermaidRef.current.innerHTML = svg;
			} catch (error) {
				console.error('Mermaid 渲染错误:', error);
				mermaidRef.current.innerHTML = '图表渲染失败';
			}
		}
	}, [code]);

	useEffect(() => {
		renderDiagram();
	}, [renderDiagram]);

	return <div ref={mermaidRef} className={`mermaid-diagram-${uniqueId.current}`} />;
};

export default Mermaid;
