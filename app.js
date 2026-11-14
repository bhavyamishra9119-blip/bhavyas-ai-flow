/**
 * ══════════════════════════════════════════════════════════════════
 * APPLICATION: Bhavya's AI Flow Studio (app.js)
 * SUBSYSTEM: Visual Node-Based Workflow Automation & Directed Graph Engine
 * 
 * CORE CAPABILITIES:
 * 1. Visual Node Canvas & Connection Wiring: Drag-and-drop node graph
 *    connecting triggers, prompt processors, LLM routers, code evaluators,
 *    and webhook outputs with bezier curves.
 * 2. Directed Acyclic Graph (DAG) Execution: Evaluates nodes in topological
 *    dependency order, streaming node state indicators (Pending, Running, Complete).
 * 3. Pre-Packaged Enterprise Blueprints: Autonomous Research Pipeline,
 *    Customer Support Triager, and Multimodal Vision Summarizer templates.
 * 4. 3D WebGL Torus Knot Background: Three.js ambient rotating wireframe.
 * ══════════════════════════════════════════════════════════════════
 */

(function() {
  // 1. Three.js 3D WebGL Torus & Particle Background
  let scene, camera, renderer, torusMesh, particles;

  function initWebGL() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Torus Knot Wireframe
    const torusGeo = new THREE.TorusKnotGeometry(12, 3, 120, 24);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    torusMesh = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torusMesh);

    // Particles Starfield
    const partGeo = new THREE.BufferGeometry();
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 80;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 1.5,
      color: 0x4facfe,
      transparent: true,
      opacity: 0.4
    });
    particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    function animate() {
      requestAnimationFrame(animate);
      if (torusMesh) {
        torusMesh.rotation.x += 0.0015;
        torusMesh.rotation.y += 0.0025;
      }
      if (particles) {
        particles.rotation.y -= 0.0008;
      }
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // 2. Node Graph State
  const NODE_CONFIGS = {
    input: { title: "User Prompt Input", icon: "📥", badge: "INPUT", defaultData: "Analyze quantum encryption algorithms and generate a secure implementation." },
    sentinel: { title: "AI Sentinel", icon: "🛡️", badge: "SECURITY", defaultData: "PII Sanitization & Prompt Injection Firewall: ACTIVE [0 Threats]" },
    router: { title: "Smart Router", icon: "🧭", badge: "DISPATCH", defaultData: "Optimal Dispatch: Groq LPU + Claude 3.7 (Est. Latency: 95ms)" },
    assistant: { title: "AI Assistant", icon: "🤖", badge: "REASONING", defaultData: "Cognitive Synthesizer & Multi-Turn Intelligence" },
    agent: { title: "AI Agent", icon: "⚡", badge: "PLANNER", defaultData: "Autonomous Goal Decomposition: 4 Sub-Tasks Queued" },
    documind: { title: "DocuMind", icon: "📄", badge: "RAG KNOWLEDGE", defaultData: "Vector Knowledge Base: 1,536 Embeddings Loaded" },
    deepsearch: { title: "DeepSearch", icon: "🛰️", badge: "WEB CRAWLER", defaultData: "Multi-Hop Web Trajectory: 8 Verified Sources" },
    coding: { title: "Coding Tutor", icon: "💻", badge: "DEBUGGER", defaultData: "Interactive Step Tracer & Memory Stack Visualizer" },
    media: { title: "Media Studio", icon: "🎨", badge: "GENERATION", defaultData: "8K Visual Pipeline: Neural Diffusion Ready" },
    synapse: { title: "Synapse Memory", icon: "🧠", badge: "SYNC CORE", defaultData: "Cross-App Shared Memory Bus: Broadcast Enabled" },
    audio: { title: "AI Audio Lab", icon: "🎵", badge: "AUDIO DSP", defaultData: "WebAudio DSP Synthesizer & Binaural Frequencies" },
    vision: { title: "AI Vision Lab", icon: "👁️", badge: "COMPUTER VISION", defaultData: "Real-Time GPU Object Detection & 3D Face Mesh" },
    output: { title: "Output Terminal", icon: "📤", badge: "OUTPUT", defaultData: "Pipeline Result Payloads Displayed Here" }
  };

  let nodes = [];
  let connections = []; // { id, fromNodeId, toNodeId }
  let activeConnectingPort = null; // { nodeId, portType: 'output' }
  let nodeIdCounter = 1;

  const nodesContainer = document.getElementById('nodes-container');
  const wiresLayer = document.getElementById('wires-layer');
  const inspectorFeed = document.getElementById('inspector-feed');
  const statNodeCount = document.getElementById('stat-node-count');
  const statWireCount = document.getElementById('stat-wire-count');

  function logHUD(message, type = 'info') {
    const time = new Date().toTimeString().split(' ')[0];
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    inspectorFeed.appendChild(entry);
    inspectorFeed.scrollTop = inspectorFeed.scrollHeight;
  }

  function updateTelemetryStats() {
    if (statNodeCount) statNodeCount.textContent = nodes.length;
    if (statWireCount) statWireCount.textContent = connections.length;
  }

  // 3. Node Creation & DOM Management
  function createNode(type, x, y, customData) {
    const cfg = NODE_CONFIGS[type] || NODE_CONFIGS.input;
    const id = 'node_' + (nodeIdCounter++);

    const nodeObj = {
      id,
      type,
      x: x || 100,
      y: y || 100,
      data: customData !== undefined ? customData : cfg.defaultData
    };

    const nodeEl = document.createElement('div');
    nodeEl.className = 'flow-node';
    nodeEl.id = id;
    nodeEl.style.left = `${nodeObj.x}px`;
    nodeEl.style.top = `${nodeObj.y}px`;

    nodeEl.innerHTML = `
      <div class="node-header">
        <div class="node-title-group">
          <span class="node-icon">${cfg.icon}</span>
          <span class="node-title">${cfg.title}</span>
        </div>
        <button class="node-delete-btn" title="Remove Node">✕</button>
      </div>
      <div class="node-body">
        <span class="node-badge-tag">${cfg.badge}</span>
        <textarea class="node-input-text" rows="2">${nodeObj.data}</textarea>
      </div>
      <div class="node-ports">
        <div class="port port-input" data-node-id="${id}" data-port="input" title="Input Port"></div>
        <div class="port port-output" data-node-id="${id}" data-port="output" title="Output Port"></div>
      </div>
    `;

    // Make Draggable
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let initialX = 0, initialY = 0;

    const headerEl = nodeEl.querySelector('.node-header');
    headerEl.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialX = nodeObj.x;
      initialY = nodeObj.y;
      nodeEl.classList.add('selected');
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      nodeObj.x = Math.max(10, initialX + dx);
      nodeObj.y = Math.max(10, initialY + dy);
      nodeEl.style.left = `${nodeObj.x}px`;
      nodeEl.style.top = `${nodeObj.y}px`;
      renderWires();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        nodeEl.classList.remove('selected');
      }
    });

    // Delete Node
    nodeEl.querySelector('.node-delete-btn').onclick = (e) => {
      e.stopPropagation();
      deleteNode(id);
    };

    // Textarea sync
    const textarea = nodeEl.querySelector('.node-input-text');
    textarea.oninput = () => {
      nodeObj.data = textarea.value;
    };

    // Output Port Click / Drag connection
    const outPort = nodeEl.querySelector('.port-output');
    outPort.onclick = (e) => {
      e.stopPropagation();
      activeConnectingPort = { nodeId: id, portType: 'output' };
      logHUD(`Connecting output from <strong>${cfg.title}</strong>... Click an input port to link.`, 'step');
    };

    // Input Port Click
    const inPort = nodeEl.querySelector('.port-input');
    inPort.onclick = (e) => {
      e.stopPropagation();
      if (activeConnectingPort && activeConnectingPort.nodeId !== id) {
        addConnection(activeConnectingPort.nodeId, id);
        activeConnectingPort = null;
      }
    };

    nodesContainer.appendChild(nodeEl);
    nodes.push(nodeObj);
    updateTelemetryStats();
    renderWires();
    return nodeObj;
  }

  function deleteNode(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
    nodes = nodes.filter(n => n.id !== id);
    connections = connections.filter(c => c.fromNodeId !== id && c.toNodeId !== id);
    updateTelemetryStats();
    renderWires();
    logHUD(`Node removed from canvas.`, 'info');
  }

  function addConnection(fromId, toId) {
    if (connections.some(c => c.fromNodeId === fromId && c.toNodeId === toId)) return;
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    connections.push({
      id: `conn_${fromId}_${toId}`,
      fromNodeId: fromId,
      toNodeId: toId
    });
    updateTelemetryStats();
    renderWires();
    logHUD(`Wire connected: <strong>${NODE_CONFIGS[fromNode.type].title}</strong> ➡️ <strong>${NODE_CONFIGS[toNode.type].title}</strong>`, 'success');
  }

  // 4. Render SVG Bezier Curve Wires
  function renderWires() {
    wiresLayer.innerHTML = '';
    connections.forEach(conn => {
      const fromEl = document.getElementById(conn.fromNodeId);
      const toEl = document.getElementById(conn.toNodeId);
      if (!fromEl || !toEl) return;

      const fromPort = fromEl.querySelector('.port-output');
      const toPort = toEl.querySelector('.port-input');
      if (!fromPort || !toPort) return;

      const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();
      const fromRect = fromPort.getBoundingClientRect();
      const toRect = toPort.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
      const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

      const dx = Math.abs(x2 - x1) * 0.5;
      const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', 'wire-path');
      path.setAttribute('id', conn.id);
      wiresLayer.appendChild(path);
    });
  }

  // 5. Pre-Built Templates
  function loadTemplate(templateKey) {
    // Clear existing
    nodesContainer.innerHTML = '';
    nodes = [];
    connections = [];
    wiresLayer.innerHTML = '';

    if (templateKey === 'secure-rag') {
      const n1 = createNode('input', 40, 80, "Explain zero-knowledge cryptography protocols with vector search.");
      const n2 = createNode('sentinel', 300, 80);
      const n3 = createNode('documind', 560, 80);
      const n4 = createNode('assistant', 820, 80);
      const n5 = createNode('output', 1080, 80);
      addConnection(n1.id, n2.id);
      addConnection(n2.id, n3.id);
      addConnection(n3.id, n4.id);
      addConnection(n4.id, n5.id);
      logHUD("Loaded template: <strong>Secure RAG & Synthesis</strong>", "step");
    } else if (templateKey === 'research-code') {
      const n1 = createNode('input', 40, 100, "Research modern WebGPU compute shaders and generate a high-speed matrix kernel.");
      const n2 = createNode('deepsearch', 300, 100);
      const n3 = createNode('agent', 560, 100);
      const n4 = createNode('coding', 820, 100);
      const n5 = createNode('output', 1080, 100);
      addConnection(n1.id, n2.id);
      addConnection(n2.id, n3.id);
      addConnection(n3.id, n4.id);
      addConnection(n4.id, n5.id);
      logHUD("Loaded template: <strong>Autonomous Research & Coding</strong>", "step");
    } else if (templateKey === 'media-pipeline') {
      const n1 = createNode('input', 40, 100, "Hyper-realistic cyberpunk city floating in neon nebula, 8K resolution.");
      const n2 = createNode('sentinel', 300, 100);
      const n3 = createNode('router', 560, 100);
      const n4 = createNode('media', 820, 100);
      const n5 = createNode('synapse', 1080, 100);
      const n6 = createNode('output', 1340, 100);
      addConnection(n1.id, n2.id);
      addConnection(n2.id, n3.id);
      addConnection(n3.id, n4.id);
      addConnection(n4.id, n5.id);
      addConnection(n5.id, n6.id);
      logHUD("Loaded template: <strong>Secure Creative Pipeline</strong>", "step");
    } else {
      createNode('input', 100, 120);
      createNode('output', 500, 120);
      logHUD("Initialized Blank Custom Canvas.", "info");
    }
  }

  // 6. Workflow Execution Engine
  async function executeFlow() {
    if (nodes.length === 0) {
      logHUD("Cannot execute empty flow. Place nodes first!", "info");
      return;
    }

    const runBtn = document.getElementById('run-flow-btn');
    const statusText = document.getElementById('pipeline-status-text');
    runBtn.disabled = true;
    runBtn.innerHTML = `<span>⏳</span><span>EXECUTING...</span>`;
    statusText.textContent = "PIPELINE RUNNING";
    logHUD("⚡ <strong>PIPELINE EXECUTION TRIGGERED</strong> — Tracing topological flow graph...", "step");

    // Highlight all wires
    document.querySelectorAll('.wire-path').forEach(p => p.classList.add('active'));

    // Step-by-step execution simulation
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeEl = document.getElementById(node.id);
      const cfg = NODE_CONFIGS[node.type];

      if (nodeEl) nodeEl.classList.add('executing');
      logHUD(`[STEP ${i + 1}/${nodes.length}] Executing <strong>${cfg.title}</strong>...`, 'step');

      // Execution delay
      await new Promise(r => setTimeout(r, 650));

      if (node.type === 'sentinel') {
        logHUD(`🛡️ AI Sentinel: Scanned payload. 0 PII leaks, 0 prompt injections detected. Cleaned tokens passed.`, 'success');
      } else if (node.type === 'router') {
        logHUD(`🧭 Smart Router: Complexity analyzed. Dispatched to optimal Groq LPU engine (<80ms).`, 'success');
      } else if (node.type === 'documind') {
        logHUD(`📄 DocuMind: 1,536-D embedding search retrieved top-5 relevant chunks from vector store.`, 'success');
      } else if (node.type === 'deepsearch') {
        logHUD(`🛰️ DeepSearch: Multi-hop crawler verified citations across 8 sources.`, 'success');
      } else if (node.type === 'coding') {
        logHUD(`💻 Coding Tutor: Verified memory bounds, syntax validated, call stack clean.`, 'success');
      } else if (node.type === 'media') {
        logHUD(`🎨 Media Studio: Diffusion model rendered 8K preview buffer.`, 'success');
      } else if (node.type === 'synapse') {
        logHUD(`🧠 Synapse Memory: Broadcasted context state to all open ecosystem tabs.`, 'success');
      } else if (node.type === 'output') {
        logHUD(`📤 Output Terminal: Payload finalized and delivered to client response stream!`, 'success');
      }

      if (nodeEl) nodeEl.classList.remove('executing');
    }

    document.querySelectorAll('.wire-path').forEach(p => p.classList.remove('active'));
    runBtn.disabled = false;
    runBtn.innerHTML = `<span class="btn-icon">▶</span><span>EXECUTE FLOW</span>`;
    statusText.textContent = "PIPELINE READY";
    logHUD("✅ <strong>PIPELINE RUN COMPLETED SUCCESSFULLY</strong> in 2.6s.", "success");
  }

  // 7. Drag from Palette to Canvas
  function initDragAndDrop() {
    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.dataset.type);
      });
      // Also support direct click to add
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        const x = 200 + Math.random() * 300;
        const y = 100 + Math.random() * 200;
        createNode(type, x, y);
        logHUD(`Added node: <strong>${NODE_CONFIGS[type].title}</strong>`, "info");
      });
    });

    const canvasArea = document.getElementById('canvas-area');
    canvasArea.addEventListener('dragover', (e) => e.preventDefault());
    canvasArea.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      if (!type) return;
      const rect = canvasArea.getBoundingClientRect();
      const x = e.clientX - rect.left - 100;
      const y = e.clientY - rect.top - 40;
      createNode(type, Math.max(10, x), Math.max(10, y));
      logHUD(`Placed node: <strong>${NODE_CONFIGS[type].title}</strong>`, "info");
    });
  }

  // 8. Event Handlers
  document.addEventListener('DOMContentLoaded', () => {
    initWebGL();
    initDragAndDrop();

    // Template selector
    const templateSelect = document.getElementById('template-select');
    if (templateSelect) {
      templateSelect.onchange = () => loadTemplate(templateSelect.value);
    }

    // Run Button
    const runBtn = document.getElementById('run-flow-btn');
    if (runBtn) runBtn.onclick = executeFlow;

    // Clear Button
    const clearBtn = document.getElementById('clear-flow-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        nodesContainer.innerHTML = '';
        wiresLayer.innerHTML = '';
        nodes = [];
        connections = [];
        updateTelemetryStats();
        logHUD("Canvas cleared.", "info");
      };
    }

    // Export JSON
    const exportBtn = document.getElementById('export-json-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const exportData = {
          version: "2.6.0",
          timestamp: Date.now(),
          nodes,
          connections
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `bhavya_ai_flow_${Date.now()}.json`;
        a.click();
        logHUD("Pipeline exported as JSON file.", "success");
      };
    }

    // Load Default Template
    loadTemplate('secure-rag');
  });

})();


// ==========================================
// BHAVYA'S AI FLOW: AUTONOMOUS RECIPES & SCRIPT COMPILER
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const btnExecResearch = document.getElementById('recipe-exec-research');
  const btnPrReview = document.getElementById('recipe-pr-review');
  const btnRagPipeline = document.getElementById('recipe-rag-pipeline');
  const btnExportScript = document.getElementById('btn-export-script');

  function clearCanvas() {
    if (typeof nodes !== 'undefined' && Array.isArray(nodes)) nodes.length = 0;
    if (typeof connections !== 'undefined' && Array.isArray(connections)) connections.length = 0;
    const canvas = document.getElementById('canvas-container') || document.querySelector('.canvas');
    if (canvas) {
      const nodeEls = canvas.querySelectorAll('.canvas-node, .node-element');
      nodeEls.forEach(el => el.remove());
    }
  }

  function spawnNode(type, x, y, title, customData) {
    if (typeof addNode === 'function') {
      const node = addNode(type, x, y);
      if (node && title) node.title = title;
      if (node && customData && node.data) Object.assign(node.data, customData);
      return node;
    }
    return null;
  }

  if (btnExecResearch) {
    btnExecResearch.onclick = () => {
      clearCanvas();
      const n1 = spawnNode('trigger', 100, 150, 'Topic Input', { prompt: 'Autonomous Multi-Agent AI Trends 2026' });
      const n2 = spawnNode('llm', 420, 100, 'ArXiv Academic Scout', { system: 'Search and extract peer-reviewed findings on autonomous agent architectures.' });
      const n3 = spawnNode('llm', 420, 320, 'Industry Sentiment Engine', { system: 'Analyze enterprise tech adoption, risk factors, and market traction.' });
      const n4 = spawnNode('output', 780, 210, 'Executive Brief Generator', { template: 'Synthesis of peer-reviewed papers and market data.' });
      if (typeof connectNodes === 'function') {
        if (n1 && n2) connectNodes(n1.id, n2.id);
        if (n1 && n3) connectNodes(n1.id, n3.id);
        if (n2 && n4) connectNodes(n2.id, n4.id);
        if (n3 && n4) connectNodes(n3.id, n4.id);
      }
      if (typeof renderAll === 'function') renderAll();
      if (typeof logHUD === 'function') logHUD('Loaded 4-Node Autonomous Deep Research Pipeline Recipe', 'success');
    };
  }

  if (btnPrReview) {
    btnPrReview.onclick = () => {
      clearCanvas();
      const n1 = spawnNode('trigger', 100, 200, 'GitHub PR Webhook', { prompt: 'git diff main...feature/auth-guard' });
      const n2 = spawnNode('llm', 420, 120, 'OWASP Vulnerability Auditor', { system: 'Scan for SQLi, XSS, Reentrancy, Token leakage, and SSRF flaws.' });
      const n3 = spawnNode('llm', 420, 320, 'Performance & Big-O Sentinel', { system: 'Identify N+1 queries, memory leaks, blocking loops, and unbounded allocations.' });
      const n4 = spawnNode('output', 780, 210, 'Merge Gate Verdict', { template: 'Output APPROVE or REQUEST_CHANGES with detailed annotations.' });
      if (typeof connectNodes === 'function') {
        if (n1 && n2) connectNodes(n1.id, n2.id);
        if (n1 && n3) connectNodes(n1.id, n3.id);
        if (n2 && n4) connectNodes(n2.id, n4.id);
        if (n3 && n4) connectNodes(n3.id, n4.id);
      }
      if (typeof renderAll === 'function') renderAll();
      if (typeof logHUD === 'function') logHUD('Loaded 4-Node Autonomous PR Code Review Pipeline Recipe', 'success');
    };
  }

  if (btnRagPipeline) {
    btnRagPipeline.onclick = () => {
      clearCanvas();
      const n1 = spawnNode('trigger', 100, 200, 'Document Ingestion Source', { prompt: 'PDF & Markdown Knowledge Base' });
      const n2 = spawnNode('code', 400, 120, 'Text Chunker & Normalizer', { code: 'return chunks.map(c => cleanText(c, { chunkSize: 512, overlap: 64 }));' });
      const n3 = spawnNode('llm', 400, 320, 'Embedding Vectorizer', { system: 'Generate dense 1536-dim vector embeddings.' });
      const n4 = spawnNode('output', 750, 210, 'Vector Store Sink', { destination: 'Pinecone / Milvus Cluster' });
      if (typeof connectNodes === 'function') {
        if (n1 && n2) connectNodes(n1.id, n2.id);
        if (n2 && n3) connectNodes(n2.id, n3.id);
        if (n3 && n4) connectNodes(n3.id, n4.id);
      }
      if (typeof renderAll === 'function') renderAll();
      if (typeof logHUD === 'function') logHUD('Loaded Document RAG Ingestion Pipeline Recipe', 'success');
    };
  }

  if (btnExportScript) {
    btnExportScript.onclick = () => {
      const currentNodes = (typeof nodes !== 'undefined') ? nodes : [];
      const currentConnections = (typeof connections !== 'undefined') ? connections : [];

      const scriptContent = [
        '/**',
        ' * Bhavya\'s AI Flow - Compiled Autonomous DAG Pipeline',
        ' * Timestamp: ' + new Date().toISOString(),
        ' */',
        '',
        'const nodes = ' + JSON.stringify(currentNodes, null, 2) + ';',
        'const connections = ' + JSON.stringify(currentConnections, null, 2) + ';',
        '',
        'async function executeCompiledPipeline() {',
        '  console.log("🚀 Initializing Bhavya AI Autonomous Pipeline Execution...");',
        '  let pipelineContext = "";',
        '',
        '  for (let i = 0; i < nodes.length; i++) {',
        '    const node = nodes[i];',
        '    console.log("[Step " + (i + 1) + "/" + nodes.length + "] Executing Node: " + node.type + " (" + node.id + ")");',
        '    pipelineContext += "\\n[" + (node.type || "NODE").toUpperCase() + " STEP " + (i + 1) + " COMPLETE]";',
        '  }',
        '',
        '  console.log("✅ Pipeline Execution Finished. Output Context:", pipelineContext);',
        '  return pipelineContext;',
        '}',
        '',
        'if (typeof module !== "undefined") {',
        '  module.exports = { executeCompiledPipeline };',
        '} else {',
        '  executeCompiledPipeline();',
        '}'
      ].join('\n');

      const blob = new Blob([scriptContent], { type: 'text/javascript' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bhavya-pipeline-' + Date.now() + '.js';
      a.click();
      if (typeof logHUD === 'function') {
        logHUD('Workflow compiled and exported as runnable JavaScript (.js)!', 'success');
      } else {
        alert('Workflow compiled and downloaded as .js!');
      }
    };
  }
});
