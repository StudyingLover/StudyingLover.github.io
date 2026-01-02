import React, { useState } from 'react';

const TransformerDebugger = () => {
  const [activeBlock, setActiveBlock] = useState('input');

  // 定义架构中每个模块的详细元数据：公式、原理、维度变化
  const blockDetails = {
    'input': {
      title: "Input Embedding",
      formula: "Embedding(x) * \u221A d_model",
      shape: "[Batch, Seq_Len] \u2192 [Batch, Seq_Len, 512]",
      desc: "将离散的 Token ID 转换为连续向量空间。注意：论文中在这里乘以了 sqrt(d_model) 来和位置编码的量级匹配。",
      cite: "Section 3.4"
    },
    'pos_enc': {
      title: "Positional Encoding",
      formula: "PE(pos, 2i) = sin(pos/10000^(2i/d))",
      shape: "Add [Batch, Seq_Len, 512]",
      desc: "因为 Self-Attention 是置换不变的（没有顺序概念），必须注入绝对位置信息。使用正弦/余弦函数是因为它们允许模型通过线性变换学习相对位置。",
      cite: "Section 3.5, Eq 3"
    },
    'multi_head': {
      title: "Multi-Head Attention",
      formula: "Softmax(QK^T / \u221A d_k)V",
      shape: "Split: [B, S, 512] \u2192 [B, 8, S, 64]",
      desc: "核心机制。1. 将向量投影到多个子空间 (Heads)。 2. 计算点积相似度 (Q·K)。 3. 缩放并归一化 (Softmax)。 4. 加权求和得到新表示。这让模型能同时关注'谁做了什么'和'在哪里做的'。",
      cite: "Section 3.2"
    },
    'add_norm': {
      title: "Add & Norm",
      formula: "LayerNorm(x + Sublayer(x))",
      shape: "Keep: [Batch, Seq_Len, 512]",
      desc: "残差连接 (x + ...) 防止深层网络梯度消失，让梯度能直接回流。LayerNorm 稳定均值和方差，加速训练收敛。",
      cite: "Section 3.1"
    },
    'ffn': {
      title: "Position-wise Feed-Forward",
      formula: "ReLU(xW_1 + b_1)W_2 + b_2",
      shape: "512 \u2192 2048 \u2192 512",
      desc: "由两个线性变换和中间的 ReLU 激活组成。你可以把它理解为'记忆层'或'键值对网络'，它独立地处理每个位置的信息（不涉及序列交互），增加了模型的非线性能力。",
      cite: "Section 3.3, Eq 2"
    },
    'mask_attn': {
      title: "Masked Multi-Head Attention",
      formula: "M[i, j] = -\u221E if j > i",
      shape: "[B, S, 512]",
      desc: "在 Decoder 中，预测第 i 个词时，不能看到 i 之后的词。通过将未来位置的 Attention Score 设为负无穷大（Softmax 后为 0）来实现这种因果遮蔽 (Causal Masking)。",
      cite: "Section 3.2.3"
    },
    'cross_attn': {
      title: "Encoder-Decoder Attention",
      formula: "Q=Dec, K=Enc, V=Enc",
      shape: "Mix: Dec[B, S, 512] + Enc[B, S, 512]",
      desc: "连接左右两边的桥梁。Query 来自 Decoder（当前生成状态），Key/Value 来自 Encoder（源句子的完整记忆）。这让 Decoder 在生成每个词时，回头去'看'源句子的相关部分。",
      cite: "Section 3.2.3"
    },
    'linear_softmax': {
      title: "Linear & Softmax",
      formula: "LogSoftmax(xW_o)",
      shape: "[B, S, 512] \u2192 [B, S, Vocab_Size]",
      desc: "将隐向量映射回词表大小 (e.g. 37000) 的 logits，然后转换为概率分布，选取概率最大的词作为输出。",
      cite: "Section 3.4"
    }
  };

  const currentDetail = blockDetails[activeBlock] || blockDetails['input'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4 bg-slate-50 font-sans text-slate-800 rounded-xl shadow-lg border border-slate-200">
      
      {/* --- 左侧：交互式架构图 (基于 Figure 1) --- */}
      <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-center items-center min-h-[600px]">
        <svg viewBox="0 0 600 780" className="w-full max-w-[1000px] h-auto cursor-pointer select-none">
          <defs>
             <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
               <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
             </marker>
          </defs>

          {/* === ENCODER (Left) === */}
          <g transform="translate(0, 0)">
            <rect x="60" y="220" width="200" height="320" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <text x="40" y="380" className="text-xs fill-slate-400" transform="rotate(-90 40,380)">Nx Layers</text>

            {/* Input Flow */}
            <text x="160" y="730" textAnchor="middle" fontWeight="bold" fontSize="14">Inputs</text>
            <path d="M160,710 L160,680" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Input Embedding */}
            <g onClick={() => setActiveBlock('input')} className="hover:opacity-80 transition-opacity">
              <rect x="100" y="640" width="120" height="40" rx="4" fill="#fecaca" stroke={activeBlock === 'input' ? '#ef4444' : '#f87171'} strokeWidth={activeBlock === 'input' ? 3 : 1} />
              <text x="160" y="665" textAnchor="middle" fontSize="12" fontWeight="600">Input Embedding</text>
            </g>
            
            <path d="M160,640 L160,615" stroke="#64748b" strokeWidth="2" />

            {/* Pos Encoding */}
            <g onClick={() => setActiveBlock('pos_enc')} className="hover:opacity-80 transition-opacity">
              <circle cx="160" cy="600" r="15" fill="white" stroke={activeBlock === 'pos_enc' ? '#000' : '#94a3b8'} strokeWidth={activeBlock === 'pos_enc' ? 2 : 1} />
              <path d="M152,600 C155,592 165,608 168,600" fill="none" stroke="black" />
              <text x="190" y="605" fontSize="10" fill="#64748b">Positional Encoding</text>
            </g>
            <text x="160" y="604" textAnchor="middle" fontSize="14" fontWeight="bold">+</text>

            <path d="M160,585 L160,530" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Multi-Head Attention */}
            <g onClick={() => setActiveBlock('multi_head')} className="hover:opacity-80 transition-opacity">
              <rect x="110" y="490" width="100" height="40" rx="4" fill="#fed7aa" stroke={activeBlock === 'multi_head' ? '#f97316' : '#fb923c'} strokeWidth={activeBlock === 'multi_head' ? 3 : 1} />
              <text x="160" y="515" textAnchor="middle" fontSize="12">Multi-Head Attn</text>
            </g>

            {/* Add & Norm 1 */}
            <g onClick={() => setActiveBlock('add_norm')} className="hover:opacity-80 transition-opacity">
               <rect x="110" y="440" width="100" height="30" rx="4" fill="#fef08a" stroke={activeBlock === 'add_norm' ? '#eab308' : '#fde047'} strokeWidth={activeBlock === 'add_norm' ? 3 : 1} />
               <text x="160" y="460" textAnchor="middle" fontSize="12">Add & Norm</text>
            </g>
            
            {/* Residual 1 */}
            <path d="M160,540 L80,540 L80,455 L110,455" fill="none" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M160,490 L160,470" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            <path d="M160,440 L160,400" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Feed Forward */}
            <g onClick={() => setActiveBlock('ffn')} className="hover:opacity-80 transition-opacity">
              <rect x="110" y="360" width="100" height="40" rx="4" fill="#bfdbfe" stroke={activeBlock === 'ffn' ? '#3b82f6' : '#60a5fa'} strokeWidth={activeBlock === 'ffn' ? 3 : 1} />
              <text x="160" y="385" textAnchor="middle" fontSize="12">Feed Forward</text>
            </g>

            {/* Add & Norm 2 */}
            <g onClick={() => setActiveBlock('add_norm')} className="hover:opacity-80 transition-opacity">
              <rect x="110" y="310" width="100" height="30" rx="4" fill="#fef08a" stroke={activeBlock === 'add_norm' ? '#eab308' : '#fde047'} strokeWidth={activeBlock === 'add_norm' ? 3 : 1} />
              <text x="160" y="330" textAnchor="middle" fontSize="12">Add & Norm</text>
            </g>
            
             {/* Residual 2 */}
            <path d="M160,420 L80,420 L80,325 L110,325" fill="none" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M160,360 L160,340" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          </g>

          {/* === DECODER (Right) === */}
          <g transform="translate(0, 0)">
            <rect x="320" y="160" width="220" height="420" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <text x="560" y="380" className="text-xs fill-slate-400" transform="rotate(90 560,380)">Nx Layers</text>

            <text x="430" y="730" textAnchor="middle" fontWeight="bold" fontSize="14">Outputs</text>
            <text x="430" y="745" textAnchor="middle" fontSize="10" fill="#64748b">(shifted right)</text>
            <path d="M430,710 L430,680" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Output Embedding */}
             <g onClick={() => setActiveBlock('input')} className="hover:opacity-80 transition-opacity">
              <rect x="370" y="640" width="120" height="40" rx="4" fill="#fecaca" stroke={activeBlock === 'input' ? '#ef4444' : '#f87171'} strokeWidth={activeBlock === 'input' ? 3 : 1} />
              <text x="430" y="665" textAnchor="middle" fontSize="12" fontWeight="600">Output Embedding</text>
            </g>
            <path d="M430,640 L430,615" stroke="#64748b" strokeWidth="2" />

             {/* Pos Encoding Dec */}
             <g onClick={() => setActiveBlock('pos_enc')} className="hover:opacity-80 transition-opacity">
              <circle cx="430" cy="600" r="15" fill="white" stroke={activeBlock === 'pos_enc' ? '#000' : '#94a3b8'} strokeWidth={activeBlock === 'pos_enc' ? 2 : 1} />
              <path d="M422,600 C425,592 435,608 438,600" fill="none" stroke="black" />
              <text x="460" y="605" fontSize="10" fill="#64748b">Positional Encoding</text>
            </g>
            <text x="430" y="604" textAnchor="middle" fontSize="14" fontWeight="bold">+</text>
            <path d="M430,585 L430,560" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Masked Attn */}
            <g onClick={() => setActiveBlock('mask_attn')} className="hover:opacity-80 transition-opacity">
              <rect x="380" y="520" width="100" height="40" rx="4" fill="#fed7aa" stroke={activeBlock === 'mask_attn' ? '#f97316' : '#fb923c'} strokeWidth={activeBlock === 'mask_attn' ? 3 : 1} />
              <text x="430" y="540" textAnchor="middle" fontSize="12">Masked</text>
              <text x="430" y="552" textAnchor="middle" fontSize="12">Multi-Head Attn</text>
            </g>

            {/* Add & Norm Dec 1 */}
            <g onClick={() => setActiveBlock('add_norm')} className="hover:opacity-80 transition-opacity">
               <rect x="380" y="470" width="100" height="30" rx="4" fill="#fef08a" stroke={activeBlock === 'add_norm' ? '#eab308' : '#fde047'} strokeWidth={activeBlock === 'add_norm' ? 3 : 1} />
               <text x="430" y="490" textAnchor="middle" fontSize="12">Add & Norm</text>
            </g>
             {/* Residual Dec 1 */}
            <path d="M430,570 L350,570 L350,485 L380,485" fill="none" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M430,520 L430,500" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M430,470 L430,440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Cross Attn */}
            <g onClick={() => setActiveBlock('cross_attn')} className="hover:opacity-80 transition-opacity">
              <rect x="380" y="400" width="100" height="40" rx="4" fill="#fed7aa" stroke={activeBlock === 'cross_attn' ? '#f97316' : '#fb923c'} strokeWidth={activeBlock === 'cross_attn' ? 3 : 1} />
              <text x="430" y="420" textAnchor="middle" fontSize="12">Multi-Head Attn</text>
              <text x="430" y="432" textAnchor="middle" fontSize="10" fill="#ea580c">(Cross Attention)</text>
            </g>

             {/* Connection from Encoder (K,V) */}
             <path d="M210,325 L290,325 L290,420 L380,420" fill="none" stroke={activeBlock === 'cross_attn' ? '#f97316' : '#94a3b8'} strokeWidth="2" strokeDasharray={activeBlock === 'cross_attn' ? '5,2' : '0'} markerEnd="url(#arrow)" />

             {/* Add & Norm Dec 2 */}
            <g onClick={() => setActiveBlock('add_norm')} className="hover:opacity-80 transition-opacity">
               <rect x="380" y="350" width="100" height="30" rx="4" fill="#fef08a" stroke={activeBlock === 'add_norm' ? '#eab308' : '#fde047'} strokeWidth={activeBlock === 'add_norm' ? 3 : 1} />
               <text x="430" y="370" textAnchor="middle" fontSize="12">Add & Norm</text>
            </g>
             {/* Residual Dec 2 */}
            <path d="M430,450 L350,450 L350,365 L380,365" fill="none" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M430,400 L430,380" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M430,350 L430,320" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* FFN Dec */}
             <g onClick={() => setActiveBlock('ffn')} className="hover:opacity-80 transition-opacity">
              <rect x="380" y="280" width="100" height="40" rx="4" fill="#bfdbfe" stroke={activeBlock === 'ffn' ? '#3b82f6' : '#60a5fa'} strokeWidth={activeBlock === 'ffn' ? 3 : 1} />
              <text x="430" y="305" textAnchor="middle" fontSize="12">Feed Forward</text>
            </g>

             {/* Add & Norm Dec 3 */}
            <g onClick={() => setActiveBlock('add_norm')} className="hover:opacity-80 transition-opacity">
               <rect x="380" y="230" width="100" height="30" rx="4" fill="#fef08a" stroke={activeBlock === 'add_norm' ? '#eab308' : '#fde047'} strokeWidth={activeBlock === 'add_norm' ? 3 : 1} />
               <text x="430" y="250" textAnchor="middle" fontSize="12">Add & Norm</text>
            </g>
            {/* Residual Dec 3 */}
            <path d="M430,330 L350,330 L350,245 L380,245" fill="none" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M430,280 L430,260" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M430,230 L430,150" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Linear & Softmax */}
            <g onClick={() => setActiveBlock('linear_softmax')} className="hover:opacity-80 transition-opacity">
              <rect x="380" y="110" width="100" height="40" rx="4" fill="#e9d5ff" stroke={activeBlock === 'linear_softmax' ? '#a855f7' : '#d8b4fe'} strokeWidth={activeBlock === 'linear_softmax' ? 3 : 1} />
              <text x="430" y="135" textAnchor="middle" fontSize="12">Linear</text>
              
              <path d="M430,110 L430,90" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              <rect x="380" y="50" width="100" height="40" rx="4" fill="#bbf7d0" stroke={activeBlock === 'linear_softmax' ? '#22c55e' : '#86efac'} strokeWidth={activeBlock === 'linear_softmax' ? 3 : 1} />
              <text x="430" y="75" textAnchor="middle" fontSize="12">Softmax</text>
            </g>
            
            <path d="M430,50 L430,20" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="430" y="15" textAnchor="middle" fontWeight="bold" fontSize="14">Output Probs</text>

          </g>
        </svg>
      </div>

      {/* --- 右侧：原理详情面板 --- */}
      <div className="lg:w-[300px] flex flex-col gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-4">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Now Inspecting</span>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{currentDetail.title}</h2>
            <div className="inline-block bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-500 mt-2 border border-slate-200">
               Source: {currentDetail.cite} 
            </div>
          </div>

          <div className="space-y-6">
            {/* 核心公式 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span> 
                Mathematical Formulation
              </h3>
              <div className="bg-slate-900 text-slate-50 p-3 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
                {currentDetail.formula}
              </div>
            </div>

            {/* 张量形状变化 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span> 
                Tensor Shape Flow
              </h3>
              <div className="bg-purple-50 text-purple-900 p-3 rounded-md font-mono text-xs border border-purple-100">
                {currentDetail.shape}
              </div>
            </div>

            {/* 白话解释 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span> 
                First Principles
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {currentDetail.desc}
              </p>
            </div>
            
            {/* 额外的 Context Tips */}
            {activeBlock === 'multi_head' && (
              <div className="text-xs bg-orange-50 text-orange-800 p-3 rounded border border-orange-100">
                <strong>Tip:</strong> 多头机制就像是让模型有多个“分身”，一个分身专门看语法关系（如主谓一致），另一个分身看语义关系（如代词指代）。
              </div>
            )}
            
            {activeBlock === 'add_norm' && (
               <div className="text-xs bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-100">
                <strong>Tip:</strong> 如果没有这根黄色的 ResNet 连线，Transformer 很难堆叠到 6 层以上而不出现训练崩溃。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformerDebugger;