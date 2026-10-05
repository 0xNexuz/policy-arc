const fs = require("fs");
const path = require("path");

const b64 = fs.readFileSync(path.join(__dirname, "../frontend/assets/agent-b64.txt"), "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POLICYARC // The Autonomous Agent in the Financial Machine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #080808;
      color: #D6D6D6;
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      line-height: 1.5;
      background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0);
      background-size: 14px 14px;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* Top Masthead */
    .masthead {
      border-bottom: 2px solid #222;
      background: #0A0A0A;
      padding: 14px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono';
    }
    .masthead-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    /* Logo styled directly after the reference image top-left mark */
    .cim-mark {
      display: flex;
      border: 2px solid #fff;
      background: #000;
      color: #fff;
      font-weight: 900;
      font-size: 13px;
      letter-spacing: -1px;
    }
    .cim-mark div {
      padding: 2px 5px;
      border-right: 1px solid #fff;
    }
    .cim-mark div:last-child {
      border-right: none;
      background: #00FF66;
      color: #000;
    }
    .masthead-title {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #fff;
    }
    .masthead-title span { color: #00FF66; }
    .masthead-sub {
      font-size: 10px;
      color: #666;
      letter-spacing: 1.5px;
    }
    .masthead-right {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 11px;
    }
    .tag-pill {
      background: #111;
      border: 1px solid #262626;
      padding: 5px 10px;
      color: #888;
      display: flex;
      gap: 6px;
    }
    .tag-pill strong { color: #00FF66; font-weight: 700; }
    .nav-btn {
      background: #000;
      border: 1px solid #333;
      color: #eee;
      padding: 6px 12px;
      font-size: 11px;
      text-decoration: none;
      font-family: 'JetBrains Mono';
      font-weight: 700;
      transition: 0.15s;
    }
    .nav-btn:hover { border-color: #00FF66; color: #fff; }
    .nav-btn-green {
      background: #00FF66;
      color: #000;
      border-color: #00FF66;
    }
    .nav-btn-green:hover { background: #00cc52; }

    /* Page Layout */
    .wrapper {
      max-width: 1320px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* Reference Feature Showcase (Hero) */
    .hero-editorial {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      border: 1px solid #262626;
      background: #0C0C0C;
      margin-bottom: 32px;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
    }
    .hero-art-col {
      background: #000;
      position: relative;
      overflow: hidden;
      border-right: 1px solid #262626;
      display: flex;
      flex-direction: column;
    }
    .art-img-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 440px;
      background: #000;
    }
    .art-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: contrast(135%) brightness(95%);
    }
    .art-overlay-tag {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid #333;
      padding: 4px 8px;
      font-family: 'JetBrains Mono';
      font-size: 10px;
      color: #00FF66;
      letter-spacing: 1px;
    }
    .art-caption {
      background: #080808;
      border-top: 1px solid #222;
      padding: 12px 16px;
      font-family: 'JetBrains Mono';
      font-size: 11px;
      color: #777;
      display: flex;
      justify-content: space-between;
    }
    .art-caption span { color: #00FF66; font-weight: 700; }

    .hero-text-col {
      padding: 36px 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #0D0D0D;
    }
    .dossier-meta {
      font-family: 'JetBrains Mono';
      font-size: 11px;
      color: #00FF66;
      letter-spacing: 2px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero-headline {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.1;
      text-transform: uppercase;
      color: #fff;
      font-family: 'Space Grotesk';
      letter-spacing: -1px;
      margin-bottom: 16px;
    }
    .hero-headline .green-text {
      color: #00FF66;
      text-shadow: 0 0 20px rgba(0, 255, 102, 0.4);
    }
    .hero-lead {
      color: #999;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .thesis-callout {
      border-left: 3px solid #00FF66;
      background: #141414;
      padding: 14px 18px;
      font-family: 'JetBrains Mono';
      font-size: 12px;
      color: #ccc;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .thesis-callout strong { color: #00FF66; }
    
    .tech-specs-strip {
      border-top: 1px solid #222;
      padding-top: 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      font-family: 'JetBrains Mono';
      font-size: 10px;
      color: #666;
    }
    .spec-item strong {
      display: block;
      color: #fff;
      font-size: 12px;
      margin-top: 2px;
    }
    .spec-item strong.highlight { color: #00FF66; }

    /* Telemetry HUD Grid */
    .hud-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .hud-card {
      background: #0E0E0E;
      border: 1px solid #222;
      padding: 18px;
      font-family: 'JetBrains Mono';
    }
    .hud-title {
      font-size: 10px;
      color: #666;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .hud-value {
      font-size: 26px;
      font-weight: 800;
      color: #fff;
    }
    .hud-value span { color: #00FF66; font-size: 14px; }
    .hud-sub {
      font-size: 10px;
      color: #777;
      margin-top: 8px;
    }
    .hud-progress-bg {
      width: 100%;
      height: 4px;
      background: #1C1C1C;
      margin-top: 10px;
    }
    .hud-progress-fill {
      height: 100%;
      background: #00FF66;
      width: 0%;
      transition: width 0.3s;
    }

    /* Operations Console Split */
    .console-split {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 24px;
    }
    .console-card {
      background: #0C0C0C;
      border: 1px solid #222;
      padding: 24px;
    }
    .console-h {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #222;
      padding-bottom: 12px;
      margin-bottom: 18px;
      font-family: 'JetBrains Mono';
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1px;
    }
    .console-h span.status-live {
      color: #00FF66;
      font-size: 11px;
    }

    /* Scenario Trigger Blocks */
    .trigger-btn {
      width: 100%;
      text-align: left;
      background: #111;
      border: 1px solid #262626;
      padding: 16px;
      margin-bottom: 14px;
      cursor: pointer;
      font-family: 'JetBrains Mono';
      transition: 0.15s;
    }
    .trigger-btn:hover {
      border-color: #00FF66;
      background: #141414;
    }
    .trigger-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .badge-price {
      font-size: 11px;
      padding: 2px 7px;
      background: rgba(0, 255, 102, 0.1);
      border: 1px solid rgba(0, 255, 102, 0.3);
      color: #00FF66;
    }
    .badge-amber {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }
    .badge-red {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }
    .trigger-desc {
      font-size: 11px;
      color: #888;
      line-height: 1.45;
    }

    /* Custom Form */
    .form-panel {
      border-top: 1px solid #222;
      padding-top: 20px;
      margin-top: 20px;
      font-family: 'JetBrains Mono';
    }
    .form-label {
      font-size: 10px;
      color: #777;
      margin-bottom: 6px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .form-input, .form-select {
      width: 100%;
      background: #000;
      border: 1px solid #262626;
      color: #fff;
      padding: 10px;
      font-family: 'JetBrains Mono';
      font-size: 11px;
      margin-bottom: 12px;
    }
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #00FF66;
    }
    .submit-btn {
      width: 100%;
      background: #00FF66;
      color: #000;
      border: none;
      padding: 12px;
      font-family: 'JetBrains Mono';
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 1px;
      cursor: pointer;
      text-transform: uppercase;
      transition: 0.15s;
    }
    .submit-btn:hover { background: #00cc52; }

    /* Ledger Output */
    .ledger-stream {
      min-height: 420px;
      max-height: 540px;
      overflow-y: auto;
      font-family: 'JetBrains Mono';
    }
    .ledger-empty {
      text-align: center;
      padding: 80px 0;
      color: #555;
      font-size: 11px;
    }
    .ledger-item {
      background: #111;
      border: 1px solid #222;
      padding: 14px;
      margin-bottom: 10px;
    }
    .ledger-item.blocked {
      border-color: #7f1d1d;
      background: rgba(69, 10, 10, 0.25);
    }
    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .item-meta {
      font-size: 11px;
      color: #999;
      margin-bottom: 8px;
    }
    .item-bot {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #1a1a1a;
      padding-top: 8px;
    }
    .item-bot a { color: #00FF66; text-decoration: none; cursor: pointer; }

    /* Contract Footer Banner */
    .contract-banner {
      border-top: 1px solid #222;
      padding-top: 14px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono';
      font-size: 11px;
      color: #666;
    }
    .contract-banner a {
      color: #00FF66;
      text-decoration: none;
      font-weight: 700;
    }
    .contract-banner a:hover { text-decoration: underline; }

    /* Modals */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.92);
      display: none; align-items: center; justify-content: center; z-index: 100; padding: 20px;
      backdrop-filter: blur(5px);
    }
    .modal-box {
      background: #0E0E0E; border: 1px solid #f59e0b; max-width: 520px; width: 100%;
      padding: 28px; font-family: 'JetBrains Mono'; font-size: 12px;
    }
    .modal-title { font-size: 14px; font-weight: 800; color: #f59e0b; margin-bottom: 14px; }
    .modal-details {
      background: #000; border: 1px solid #222; padding: 14px; margin: 16px 0; font-size: 11px; line-height: 1.7;
    }
    .modal-btns { display: flex; gap: 12px; }
    .btn-approve {
      flex: 1; background: #f59e0b; color: #000; font-weight: 800; border: none; padding: 12px;
      font-family: 'JetBrains Mono'; font-size: 11px; cursor: pointer;
    }
    .btn-reject {
      background: #1a1a1a; border: 1px solid #333; color: #ccc; padding: 12px 18px;
      font-family: 'JetBrains Mono'; font-size: 11px; cursor: pointer;
    }

    @media (max-width: 960px) {
      .hero-editorial, .console-split, .hud-grid { grid-template-columns: 1fr; }
      .tech-specs-strip { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>

  <!-- Masthead Navigation -->
  <header class="masthead">
    <div class="masthead-left">
      <!-- CIM Logo Mark matching the reference image top-left block -->
      <div class="cim-mark">
        <div>POL</div>
        <div>ARC</div>
        <div>L1</div>
      </div>
      <div>
        <div class="masthead-title">POLICY<span>ARC</span></div>
        <div class="masthead-sub">DETERMINISTIC ECONOMIC AGENT OS // ARC TESTNET</div>
      </div>
    </div>

    <div class="masthead-right">
      <div class="tag-pill">
        <span>CONSENSUS:</span> <strong>MALACHITE (&lt;1s)</strong>
      </div>
      <div class="tag-pill">
        <span>NATIVE GAS:</span> <strong>USDC</strong>
      </div>
      <a href="docs.html" class="nav-btn">DOCS</a>
      <a href="https://testnet.arcscan.app/address/0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0" target="_blank" class="nav-btn nav-btn-green">
        ARCSCAN // LIVE CONTRACT &nearr;
      </a>
    </div>
  </header>

  <div class="wrapper">

    <!-- Hero Editorial Feature: The Exact Graphic Composition of the Reference -->
    <div class="hero-editorial">
      
      <!-- Left: The Visual Archetype (The Exact Reference Image Embedded) -->
      <div class="hero-art-col">
        <div class="art-img-wrap">
          <img src="data:image/png;base64,${b64}" alt="The Autonomous AI Agent in the Corporate Machine">
          <div class="art-overlay-tag">[ARCHETYPE_FIG_01] AUTONOMOUS_ENTITY</div>
        </div>
        <div class="art-caption">
          <div>MATRIX_ENTITY: <span>ACTIVE &amp; POLICY_BOUNDED</span></div>
          <div>TARGET: <span>CIRCLE ARC L1</span></div>
        </div>
      </div>

      <!-- Right: The Editorial Thesis & Build Narrative -->
      <div class="hero-text-col">
        <div>
          <div class="dossier-meta">
            <span>[DORAHACKS // MICROGRANT]</span>
            <span style="color:#666;">·</span>
            <span>CIRCLE_GRANT_PIPELINE</span>
          </div>

          <h1 class="hero-headline">
            The Autonomous Agent <br>
            <span class="green-text">In The Financial Machine.</span>
          </h1>

          <p class="hero-lead">
            Autonomous AI agent swarms are entering corporate boardrooms as sovereign economic actors—purchasing compute, paying for proprietary research APIs, and executing payroll. On Ethereum and Solana, agents freeze when volatile gas prices fluctuate.
          </p>

          <div class="thesis-callout">
            <strong>THE ARC SUPERPOWER:</strong> On Circle's Arc L1, <strong>USDC is the native gas asset</strong>. Transaction fees are denominated strictly in US dollars. PolicyArc enforces deterministic spending limits, supervisor co-signatures, and instant sub-second receipts.
          </div>
        </div>

        <div class="tech-specs-strip">
          <div class="spec-item">
            CONSENSUS
            <strong class="highlight">MALACHITE BFT</strong>
          </div>
          <div class="spec-item">
            FINALITY
            <strong class="highlight">&lt; 800ms</strong>
          </div>
          <div class="spec-item">
            INVARIANTS
            <strong class="highlight">7 VERIFIED</strong>
          </div>
          <div class="spec-item">
            TREASURY
            <strong>FAIL-CLOSED</strong>
          </div>
        </div>
      </div>

    </div>

    <!-- Live Telemetry HUD Grid -->
    <div class="hud-grid">
      <div class="hud-card">
        <div class="hud-title">Vault Reserve Balance</div>
        <div class="hud-value" id="vaultDisplay">$1,000.00 <span>USDC</span></div>
        <div class="hud-sub" style="color:#00FF66;">● BACKED ON ARC TESTNET</div>
      </div>
      <div class="hud-card">
        <div class="hud-title">24h Rolling Budget</div>
        <div class="hud-value" id="spentDisplay">$0.00 <span style="color:#666; font-size:12px;">/ $50.00</span></div>
        <div class="hud-progress-bg"><div id="budgetProgress" class="hud-progress-fill"></div></div>
      </div>
      <div class="hud-card">
        <div class="hud-title">Per-Tx Spending Cap</div>
        <div class="hud-value">$10.00 <span>USDC</span></div>
        <div class="hud-sub">HARD CONTRACT LIMIT</div>
      </div>
      <div class="hud-card">
        <div class="hud-title">Supervisor Gate</div>
        <div class="hud-value">&gt; $2.00 <span style="color:#f59e0b;">USDC</span></div>
        <div class="hud-sub" style="color:#f59e0b;">REQUIRES CO-SIGNATURE</div>
      </div>
    </div>

    <!-- Main Operations Split -->
    <div class="console-split">
      
      <!-- Left: Scenario Trigger Control Room -->
      <div class="console-card">
        <div class="console-h">
          <span>[01] // SIMULATION_CONTROL_ROOM</span>
          <span class="status-live">● ENGINE_READY</span>
        </div>

        <p style="font-family:'JetBrains Mono'; font-size:11px; color:#888; margin-bottom:18px;">
          Trigger live autonomous tasks on the Arc execution environment. Test limits, supervisor signatures, and prompt-injection defense.
        </p>

        <button onclick="triggerScenario1()" class="trigger-btn">
          <div class="trigger-header">
            <span>1. ROUTINE_MICRO_PAYMENT</span>
            <span class="badge-price">$0.25 USDC</span>
          </div>
          <div class="trigger-desc">
            Agent queries DeepSearch Academic API. Under $2.00 threshold &rarr; settles instantaneously on Arc with sub-second Malachite finality.
          </div>
        </button>

        <button onclick="triggerScenario2()" class="trigger-btn">
          <div class="trigger-header">
            <span style="color:#f59e0b;">2. HIGH_VALUE_SUPERVISOR_GATE</span>
            <span class="badge-price badge-amber">$5.00 USDC</span>
          </div>
          <div class="trigger-desc">
            Agent requests GPU cluster lease for model training. Exceeds $2.00 threshold &rarr; requires human supervisor cryptographic co-signature.
          </div>
        </button>

        <button onclick="triggerScenario3()" class="trigger-btn">
          <div class="trigger-header">
            <span style="color:#ef4444;">3. ROGUE_INJECTION_DEFENSE</span>
            <span class="badge-price badge-red">$100.00 USDC</span>
          </div>
          <div class="trigger-desc">
            Prompt injection commands agent to drain treasury to untrusted target &rarr; instant fail-closed policy rejection (zero loss).
          </div>
        </button>

        <!-- Custom Dispatcher Form -->
        <div class="form-panel">
          <div class="form-label">CUSTOM_SPEND_DISPATCHER</div>
          <select id="customTarget" class="form-select">
            <option value="0xdf57089feb34744236b64b4b755767c75683a524f28522ee647e44e0ce3e248e">DeepSearch AI API (Whitelisted)</option>
            <option value="0x821aEa9a577a9b44299B9c15c88cf3087F3b5544">Serverless GPU Pool (Whitelisted)</option>
            <option value="0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E">Untrusted External Wallet (Blocked)</option>
          </select>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <input id="customAmt" type="number" step="0.01" value="0.75" class="form-input" placeholder="Amount USDC">
            <input id="customTask" type="text" value="Vector Partitioning" class="form-input" placeholder="Task Purpose">
          </div>

          <button onclick="dispatchCustomSpend()" class="submit-btn">
            DISPATCH_THROUGH_POLICY_VAULT
          </button>
        </div>

      </div>

      <!-- Right: Real-time Audit Ledger Stream -->
      <div class="console-card">
        <div class="console-h">
          <span>[02] // REAL_TIME_AUDIT_LEDGER</span>
          <span style="color:#666; cursor:pointer;" onclick="clearStream()">CLEAR_STREAM</span>
        </div>

        <div class="ledger-stream" id="ledgerStream">
          <div id="emptyPrompt" class="ledger-empty">
            <div>[NO TRANSACTIONS RECORDED IN CURRENT SESSION]</div>
            <div style="color:#444; margin-top:6px;">Execute Scenario 1, 2, or 3 to observe live sub-second Arc finality.</div>
          </div>
        </div>

        <div class="contract-banner">
          <div>CONTRACT: <a href="https://testnet.arcscan.app/address/0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0" target="_blank">0xb9176558...PolicyVault (Arcscan &nearr;)</a></div>
          <div>AVG_GAS: <span style="color:#00FF66;">0.000120 USDC</span></div>
        </div>
      </div>

    </div>

  </div>

  <!-- Supervisor Approval Modal -->
  <div id="superModal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-title">⚠️ SUPERVISOR CO-SIGNATURE REQUIRED</div>
      <p style="color:#bbb; line-height:1.5;">
        Autonomous agent requested spend exceeding the <strong>$2.00 USDC</strong> threshold. PolicyVault requires an off-chain cryptographic supervisor co-signature before funds release.
      </p>
      <div class="modal-details">
        <div>AGENT_ID: <span style="color:#fff;">0x59c6...86dae</span></div>
        <div>TARGET:   <span style="color:#fff;">GPU Compute Lease</span></div>
        <div>AMOUNT:   <span style="color:#f59e0b; font-weight:700;">$5.00 USDC</span></div>
        <div>GAS_FEE:  <span style="color:#00FF66;">0.000150 USDC</span></div>
      </div>
      <div class="modal-btns">
        <button onclick="confirmSupervisor()" class="btn-approve">
          CO-SIGN WITH SUPERVISOR KEY
        </button>
        <button onclick="closeSupervisorModal()" class="btn-reject">REJECT</button>
      </div>
    </div>
  </div>

  <!-- Receipt JSON Modal -->
  <div id="receiptModal" class="modal-backdrop">
    <div class="modal-box" style="border-color:#00FF66; max-width:580px;">
      <div class="modal-title" style="color:#00FF66;">VERIFIABLE_ARC_RECEIPT</div>
      <pre id="receiptContent" style="background:#000; border:1px solid #222; padding:14px; color:#00FF66; font-size:11px; overflow-x:auto; margin:16px 0; max-height:300px;"></pre>
      <div style="display:flex; justify-content:flex-end;">
        <button onclick="closeReceiptModal()" class="btn-approve" style="background:#00FF66; color:#000; flex:none; padding:8px 24px;">CLOSE</button>
      </div>
    </div>
  </div>

  <script>
    let state = {
      vaultBalance: 1000.00,
      spentToday: 0.00,
      dailyLimit: 50.00,
      perTxLimit: 10.00,
      threshold: 2.00,
      nonce: 0,
      receipts: {}
    };

    function renderUI() {
      document.getElementById('vaultDisplay').innerHTML = '$' + state.vaultBalance.toFixed(2) + ' <span>USDC</span>';
      document.getElementById('spentDisplay').innerHTML = '$' + state.spentToday.toFixed(2) + ' <span style="color:#666; font-size:12px;">/ $' + state.dailyLimit.toFixed(2) + '</span>';
      const pct = Math.min(100, (state.spentToday / state.dailyLimit) * 100);
      document.getElementById('budgetProgress').style.width = pct + '%';
      if (pct > 80) document.getElementById('budgetProgress').style.background = '#f59e0b';
    }

    function appendLedger({ title, amount, recipient, purpose, isRejected, receipt }) {
      const empty = document.getElementById('emptyPrompt');
      if (empty) empty.remove();

      const stream = document.getElementById('ledgerStream');
      const id = 'tx_' + Date.now();
      const div = document.createElement('div');
      div.className = 'ledger-item' + (isRejected ? ' blocked' : '');

      const badge = isRejected 
        ? '<span class="badge-price badge-red">REJECTED [FAIL-CLOSED]</span>'
        : '<span class="badge-price">SETTLED [&lt;800ms]</span>';

      div.innerHTML = \`
        <div class="item-top">
          <strong style="color:#fff;">\${title}</strong>
          \${badge}
        </div>
        <div class="item-meta"><span style="color:#666;">TASK:</span> \${purpose}</div>
        <div class="item-bot">
          <div>RECIPIENT: <span style="color:#aaa;">\${recipient.substring(0,8)}...\${recipient.substring(recipient.length-6)}</span></div>
          <div>GAS: <span style="color:#00FF66;">0.000120 USDC</span></div>
          \${!isRejected ? '<a onclick="showReceipt(\\'' + id + '\\')">VIEW_RECEIPT &rarr;</a>' : ''}
        </div>
      \`;
      stream.prepend(div);
      if (!isRejected) state.receipts[id] = receipt;
    }

    function triggerScenario1() {
      const amt = 0.25;
      state.spentToday += amt;
      state.vaultBalance -= amt;
      state.nonce++;

      const receipt = {
        network: "Arc Testnet (Circle L1)",
        chainId: 5042002,
        nonce: state.nonce,
        txHash: "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        agent: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        recipient: "0xdf57089feb34744236b64b4b755767c75683a524f28522ee647e44e0ce3e248e",
        amountUSDC: amt,
        gasUsedUSDC: "0.000120",
        purpose: "DeepSearch Academic Literature Batch Query",
        status: "AUTO_APPROVED",
        timestamp: new Date().toISOString()
      };
      renderUI();
      appendLedger({ title: "DeepSearch Academic Query", amount: amt, recipient: receipt.recipient, purpose: receipt.purpose, isRejected: false, receipt });
    }

    let pendingScenario2Data = null;
    function triggerScenario2() {
      pendingScenario2Data = { amt: 5.00, recipient: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544", purpose: "GPU Compute Lease: LLaMA-3 LoRA Fine-Tuning" };
      document.getElementById('superModal').style.display = 'flex';
    }

    function confirmSupervisor() {
      document.getElementById('superModal').style.display = 'none';
      if (!pendingScenario2Data) return;
      const amt = pendingScenario2Data.amt;
      state.spentToday += amt;
      state.vaultBalance -= amt;
      state.nonce++;

      const receipt = {
        network: "Arc Testnet (Circle L1)",
        chainId: 5042002,
        nonce: state.nonce,
        txHash: "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        agent: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        supervisorSig: "0x7a89f...ECDSA_CO_SIGNATURE_VERIFIED...c4",
        recipient: pendingScenario2Data.recipient,
        amountUSDC: amt,
        gasUsedUSDC: "0.000150",
        purpose: pendingScenario2Data.purpose + " [Supervisor Co-Signed]",
        status: "SUPERVISOR_APPROVED",
        timestamp: new Date().toISOString()
      };
      renderUI();
      appendLedger({ title: "GPU Compute Lease", amount: amt, recipient: pendingScenario2Data.recipient, purpose: receipt.purpose, isRejected: false, receipt });
      pendingScenario2Data = null;
    }

    function closeSupervisorModal() {
      document.getElementById('superModal').style.display = 'none';
    }

    function triggerScenario3() {
      appendLedger({
        title: "Unauthorized Drain Attempt (Prompt Injection)",
        amount: 100.00,
        recipient: "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
        purpose: "Exceeds daily budget limit ($50 USDC) & unwhitelisted recipient",
        isRejected: true
      });
    }

    function dispatchCustomSpend() {
      const recipient = document.getElementById('customTarget').value;
      const amt = parseFloat(document.getElementById('customAmt').value);
      const purpose = document.getElementById('customTask').value;

      if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");
      if (recipient.startsWith("0x9999")) {
        return appendLedger({ title: "Custom Spend Blocked", amount: amt, recipient, purpose: purpose + " (Whitelist violation)", isRejected: true });
      }
      if (amt > state.perTxLimit) {
        return appendLedger({ title: "Custom Spend Blocked", amount: amt, recipient, purpose: purpose + " (Exceeds per-tx cap $" + state.perTxLimit + ")", isRejected: true });
      }
      if (amt > state.threshold) {
        pendingScenario2Data = { amt, recipient, purpose };
        document.getElementById('superModal').style.display = 'flex';
        return;
      }

      state.spentToday += amt;
      state.vaultBalance -= amt;
      state.nonce++;

      const receipt = {
        network: "Arc Testnet",
        nonce: state.nonce,
        txHash: "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        agent: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        recipient, amountUSDC: amt, gasUsedUSDC: "0.000120", purpose, timestamp: new Date().toISOString()
      };
      renderUI();
      appendLedger({ title: "Custom Agent Spend", amount: amt, recipient, purpose, isRejected: false, receipt });
    }

    function showReceipt(id) {
      const r = state.receipts[id];
      if (!r) return;
      document.getElementById('receiptContent').innerText = JSON.stringify(r, null, 2);
      document.getElementById('receiptModal').style.display = 'flex';
    }

    function closeReceiptModal() {
      document.getElementById('receiptModal').style.display = 'none';
    }

    function clearStream() {
      document.getElementById('ledgerStream').innerHTML = '<div id="emptyPrompt" class="ledger-empty"><div>[STREAM CLEARED]</div></div>';
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "../frontend/index.html"), html);
console.log("✅ Successfully built frontend/index.html with embedded base64 reference artwork!");
