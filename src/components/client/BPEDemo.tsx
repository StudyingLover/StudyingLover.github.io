import React, { useState, useEffect, useMemo } from 'react';

// --- 类型定义 ---
type WordObj = {
	original: string;
	tokens: string[];
	count: number;
};

type PairStat = {
	pair: string; // "a,b"
	count: number;
	display: string; // "ab"
};

// --- 样式常量 (仿 Obsidian/硬核风格) ---
const STYLES = {
	container: {
		fontFamily: "'JetBrains Mono', Consolas, monospace",
		backgroundColor: '#1e1e1e', // var(--background-primary)
		color: '#dcddde', // var(--text-normal)
		border: '1px solid #333',
		borderRadius: '8px',
		padding: '20px',
		maxWidth: '100%',
		margin: '20px 0',
		fontSize: '14px'
	},
	header: {
		borderBottom: '2px solid #3f51b5',
		marginBottom: '20px',
		paddingBottom: '10px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	controlPanel: {
		display: 'grid',
		gap: '10px',
		marginBottom: '20px',
		gridTemplateColumns: '1fr auto'
	},
	textarea: {
		width: '100%',
		height: '60px',
		backgroundColor: '#252526',
		color: '#fff',
		border: '1px solid #444',
		borderRadius: '4px',
		padding: '8px',
		fontFamily: 'inherit',
		resize: 'none' as const
	},
	buttonGroup: {
		display: 'flex',
		flexDirection: 'column' as const,
		gap: '5px'
	},
	btn: {
		padding: '6px 12px',
		border: 'none',
		borderRadius: '4px',
		cursor: 'pointer',
		fontWeight: 'bold',
		fontFamily: 'inherit',
		transition: 'opacity 0.2s'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
		gap: '20px'
	},
	panel: {
		backgroundColor: '#2d2d2d',
		padding: '15px',
		borderRadius: '6px',
		border: '1px solid #444'
	},
	tokenBox: {
		display: 'inline-block',
		padding: '2px 6px',
		margin: '2px',
		border: '1px solid #555',
		borderRadius: '4px',
		backgroundColor: '#363636',
		fontSize: '0.9em'
	},
	highlightBox: {
		backgroundColor: '#e3f2fd',
		color: '#0d47a1',
		borderColor: '#2196f3',
		fontWeight: 'bold'
	},
	statRow: {
		display: 'flex',
		justifyContent: 'space-between',
		padding: '4px 0',
		borderBottom: '1px solid #444'
	}
};

const BpePlayground = () => {
	// 初始输入
	const [inputText, setInputText] = useState('hug pug pun bun hug pug pun pun pun pun');
	// 当前步骤的数据状态
	const [vocabSize, setVocabSize] = useState(0);
	const [wordList, setWordList] = useState<WordObj[]>([]);
	const [history, setHistory] = useState<string[]>([]); // 记录合并历史
	const [isInitialized, setIsInitialized] = useState(false);

	// 预设数据
	const loadPreset = () => {
		// 构造一个符合 frequency 的字符串: hug(10), pug(5), pun(12), bun(4)
		const str = [...Array(10).fill('hug'), ...Array(5).fill('pug'), ...Array(12).fill('pun'), ...Array(4).fill('bun')].join(' ');
		setInputText(str);
		setIsInitialized(false);
	};

	// --- 核心算法部分 ---

	// 1. 初始化：统计词频，拆分字符
	const initialize = () => {
		const rawWords = inputText.trim().split(/\s+/);
		const counts: Record<string, number> = {};

		rawWords.forEach((w) => {
			if (!w) return;
			counts[w] = (counts[w] || 0) + 1;
		});

		const initialList: WordObj[] = Object.entries(counts).map(([word, count]) => {
			// 拆分字符并在末尾加 </w>
			const chars = word.split('');
			chars[chars.length - 1] = chars[chars.length - 1] + '</w>';
			return {
				original: word,
				tokens: chars,
				count: count
			};
		});

		setWordList(initialList);
		setHistory([]);
		setVocabSize(0); // 这里我们只记录 Merge 次数作为 Vocab 增量
		setIsInitialized(true);
	};

	// 2. 统计当前所有相邻 Pair 的频率
	const getStats = (currentWords: WordObj[]) => {
		const stats: Record<string, number> = {};

		currentWords.forEach((wordObj) => {
			const tokens = wordObj.tokens;
			for (let i = 0; i < tokens.length - 1; i++) {
				const pair = tokens[i] + ',' + tokens[i + 1]; // 使用逗号分隔键
				stats[pair] = (stats[pair] || 0) + wordObj.count;
			}
		});

		// 转换为数组并排序
		const sortedStats: PairStat[] = Object.entries(stats)
			.map(([pairKey, count]) => {
				const [p1, p2] = pairKey.split(',');
				return { pair: pairKey, count, display: p1 + p2 };
			})
			.sort((a, b) => b.count - a.count); // 降序

		return sortedStats;
	};

	// 3. 执行一次合并
	const handleMerge = () => {
		const stats = getStats(wordList);
		if (stats.length === 0) return;

		// 冠军
		const bestPair = stats[0];
		const [left, right] = bestPair.pair.split(',');
		const newToken = left + right;

		// 更新 WordList
		const newWordList = wordList.map((wordObj) => {
			const newTokens: string[] = [];
			let i = 0;
			const oldTokens = wordObj.tokens;

			while (i < oldTokens.length) {
				// 检查是否匹配当前 Pair
				if (i < oldTokens.length - 1 && oldTokens[i] === left && oldTokens[i + 1] === right) {
					newTokens.push(newToken); // 合并！
					i += 2; // 跳过两个
				} else {
					newTokens.push(oldTokens[i]);
					i += 1;
				}
			}
			return { ...wordObj, tokens: newTokens };
		});

		setWordList(newWordList);
		setHistory([...history, `${left} + ${right} → ${newToken} (${bestPair.count})`]);
		setVocabSize((prev) => prev + 1);
	};

	// 4. 重置
	const handleReset = () => {
		setIsInitialized(false);
		setWordList([]);
		setHistory([]);
	};

	// 实时计算当前统计，用于渲染
	const currentStats = useMemo(() => (isInitialized ? getStats(wordList) : []), [wordList, isInitialized]);
	const bestPairKey = currentStats.length > 0 ? currentStats[0].pair : null;

	// --- 渲染 ---
	return (
		<div style={STYLES.container}>
			<div style={STYLES.header}>
				<h3 style={{ margin: 0 }}>🛠️ BPE Playground</h3>
				<div style={{ fontSize: '0.8em', opacity: 0.7 }}>{isInitialized ? `已合并次数: ${vocabSize}` : '准备就绪'}</div>
			</div>

			{/* 控制区 */}
			<div style={STYLES.controlPanel}>
				<textarea
					style={STYLES.textarea}
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					placeholder='输入一些单词，用空格隔开...'
					disabled={isInitialized}
				/>
				<div style={STYLES.buttonGroup}>
					{!isInitialized ? (
						<>
							<button style={{ ...STYLES.btn, backgroundColor: '#3f51b5', color: '#fff' }} onClick={initialize}>
								开始初始化
							</button>
							<button style={{ ...STYLES.btn, backgroundColor: '#444', color: '#ccc', fontSize: '0.8em' }} onClick={loadPreset}>
								载入经典案例
							</button>
						</>
					) : (
						<>
							<button
								style={{ ...STYLES.btn, backgroundColor: '#4caf50', color: '#fff' }}
								onClick={handleMerge}
								disabled={currentStats.length === 0}>
								下一步合并 (Merge)
							</button>
							<button style={{ ...STYLES.btn, backgroundColor: '#f44336', color: '#fff' }} onClick={handleReset}>
								重置 (Reset)
							</button>
						</>
					)}
				</div>
			</div>

			{isInitialized && (
				<div style={STYLES.grid}>
					{/* 左侧：语料状态 */}
					<div style={STYLES.panel}>
						<h4 style={{ marginTop: 0, borderBottom: '1px solid #555', paddingBottom: '5px' }}>📖 语料库状态 (Corpus)</h4>
						<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
							{wordList.map((w, idx) => (
								<div key={idx} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
									<span style={{ width: '30px', color: '#888', fontSize: '0.8em', textAlign: 'right', marginRight: '10px' }}>
										{w.count}x
									</span>
									<div>
										{w.tokens.map((t, tIdx) => {
											// 检查这个 token 是否是刚刚产生合并的（为了高亮效果）或者当前步骤会被合并的
											// 这里为了简单，我们高亮显示目前词表中的“多字符token”
											const isMultiChar = t.replace('</w>', '').length > 1;
											return (
												<span
													key={tIdx}
													style={{
														...STYLES.tokenBox,
														...(isMultiChar ? { borderColor: '#2196f3', color: '#90caf9' } : {})
													}}>
													{t}
												</span>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* 右侧：统计与操作 */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
						{/* 频次表 */}
						<div style={STYLES.panel}>
							<h4
								style={{
									marginTop: 0,
									borderBottom: '1px solid #555',
									paddingBottom: '5px',
									display: 'flex',
									justifyContent: 'space-between'
								}}>
								<span>📊 Pair 频率统计</span>
								<span style={{ fontSize: '0.8em', color: '#aaa' }}>Top 5</span>
							</h4>
							<div style={{ fontSize: '0.9em' }}>
								{currentStats.length === 0 ? (
									<div style={{ color: '#666', padding: '10px', textAlign: 'center' }}>无更多可合并项</div>
								) : (
									currentStats.slice(0, 5).map((stat, idx) => (
										<div
											key={stat.pair}
											style={{
												...STYLES.statRow,
												backgroundColor: idx === 0 ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
												color: idx === 0 ? '#66bb6a' : 'inherit',
												fontWeight: idx === 0 ? 'bold' : 'normal'
											}}>
											<span>{stat.pair.replace(',', ' + ')}</span>
											<span>{stat.count}</span>
										</div>
									))
								)}
							</div>
						</div>

						{/* 合并历史 */}
						<div style={{ ...STYLES.panel, flex: 1 }}>
							<h4 style={{ marginTop: 0, borderBottom: '1px solid #555', paddingBottom: '5px' }}>📜 合并日志 (Vocab)</h4>
							<div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85em', fontFamily: 'monospace' }}>
								{history.length === 0 && <span style={{ color: '#666' }}>暂无合并记录...</span>}
								{history.map((h, i) => (
									<div key={i} style={{ marginBottom: '4px' }}>
										<span style={{ color: '#aaa', marginRight: '5px' }}>{i + 1}.</span>
										{h}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BpePlayground;
