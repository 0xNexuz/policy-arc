import os
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

def create_pdf():
    output_path = os.path.join(os.path.dirname(__file__), "../PolicyArc_Pitch_Deck.pdf")
    
    # 16:9 widescreen dimensions in points (960 x 540)
    PAGE_WIDTH = 960
    PAGE_HEIGHT = 540
    
    c = canvas.Canvas(output_path, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    c.setTitle("PolicyArc - Pitch Deck")
    c.setAuthor("PolicyArc Core Team")
    c.setSubject("Circle Arc Microgrant Pitch Deck")
    
    # Color Palette matching PPTX & Frontend
    BG_COLOR = HexColor("#080808")
    SURFACE_COLOR = HexColor("#101010")
    BORDER_COLOR = HexColor("#262626")
    GREEN_COLOR = HexColor("#00FF66")
    WHITE_COLOR = HexColor("#FFFFFF")
    MUTED_COLOR = HexColor("#A0A0A0")
    DIM_COLOR = HexColor("#707070")
    AMBER_COLOR = HexColor("#FFB300")
    RED_COLOR = HexColor("#FF3344")
    CALLOUT_BG = HexColor("#0D140D")
    
    def to_y(top_in, h_in):
        # Convert top in inches to ReportLab Y in points
        return PAGE_HEIGHT - (top_in + h_in) * 72
        
    def to_pt(inches):
        return inches * 72

    def draw_background():
        c.setFillColor(BG_COLOR)
        c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    def draw_masthead(slide_num, category):
        # Top banner
        bx = to_pt(0.8)
        by = to_y(0.4, 0.38)
        bw = to_pt(11.733)
        bh = to_pt(0.38)
        
        c.setFillColor(HexColor("#0C0C0C"))
        c.setStrokeColor(BORDER_COLOR)
        c.setLineWidth(1)
        c.rect(bx, by, bw, bh, fill=1, stroke=1)
        
        c.setFont("Courier-Bold", 10)
        c.setFillColor(GREEN_COLOR)
        c.drawString(bx + 14, by + 10, f"[POLICYARC]  //  {slide_num}  //  {category}")

    def draw_card(x_in, y_in, w_in, h_in, stroke_color=BORDER_COLOR, fill_color=SURFACE_COLOR, stroke_width=1):
        x = to_pt(x_in)
        y = to_y(y_in, h_in)
        w = to_pt(w_in)
        h = to_pt(h_in)
        c.setFillColor(fill_color)
        c.setStrokeColor(stroke_color)
        c.setLineWidth(stroke_width)
        c.rect(x, y, w, h, fill=1, stroke=1)
        return x, y, w, h

    def draw_wrapped_text(text, x, y, max_chars=54, line_spacing=14, font_name="Helvetica", font_size=10.5, font_color=MUTED_COLOR):
        words = text.split()
        lines = []
        cur = ""
        for w in words:
            if len((cur + " " + w).strip()) <= max_chars:
                cur = (cur + " " + w).strip()
            else:
                lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        
        c.setFont(font_name, font_size)
        c.setFillColor(font_color)
        cur_y = y
        for l in lines:
            c.drawString(x, cur_y, l)
            cur_y -= line_spacing
        return cur_y

    # =========================================================================
    # SLIDE 1: TITLE & EXECUTIVE HOOK
    # =========================================================================
    draw_background()
    draw_masthead("SLIDE 01 / 05", "EXECUTIVE SUMMARY // CIRCLE ARC MICROGRANT")
    
    # Kicker
    c.setFont("Courier-Bold", 11)
    c.setFillColor(GREEN_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.3), "THE AUTONOMOUS AGENT IN THE FINANCIAL MACHINE")
    
    # Title
    c.setFont("Helvetica-Bold", 26)
    c.setFillColor(WHITE_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.75), "POLICYARC: DETERMINISTIC AGENT SAFETY OS")
    
    # Subtitle
    c.setFont("Helvetica", 13)
    c.setFillColor(MUTED_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(2.1), "Enterprise-grade spending limits, supervisor co-signatures, and zero-volatility micro-settlement on Circle's Arc L1.")
    
    # Callout Box
    cx, cy, cw, ch = draw_card(0.8, 2.35, 11.733, 1.0, stroke_color=GREEN_COLOR, fill_color=CALLOUT_BG, stroke_width=1.5)
    c.setFont("Courier-Bold", 10)
    c.setFillColor(GREEN_COLOR)
    c.drawString(cx + 16, cy + ch - 22, "THE ARC ADVANTAGE:")
    c.setFont("Helvetica", 10.5)
    c.setFillColor(WHITE_COLOR)
    c.drawString(cx + 155, cy + ch - 22, "On Circle's Arc L1, USDC is the native gas asset. Fees and settlement are strictly in US dollars.")
    c.drawString(cx + 16, cy + ch - 42, "PolicyArc pairs Arc's sub-second Malachite consensus (<800ms) with deterministic smart contract vaults to guarantee")
    c.drawString(cx + 16, cy + ch - 58, "corporate treasury solvency, preventing prompt injection drains and runaway autonomous loops.")

    # 3 Metrics Cards
    metrics = [
        ("NATIVE GAS ASSET", "100% Native USDC", "Zero volatile tokens (ETH/SOL).", "Predictable fractions of a cent per execution."),
        ("BFT CONSENSUS", "< 800ms Finality", "Malachite consensus engine allows", "real-time agent micro-payments without lag."),
        ("SECURITY INVARIANTS", "7 / 7 Verified", "Audited under Build-Harness engineering", "standard with 100% automated pass rate.")
    ]
    card_w = 3.7
    card_h = 1.9
    card_gap = 0.316
    for i, (tag, val, l1, l2) in enumerate(metrics):
        mx, my, mw, mh = draw_card(0.8 + i * (card_w + card_gap), 3.55, card_w, card_h, stroke_color=BORDER_COLOR)
        c.setFont("Courier-Bold", 9)
        c.setFillColor(DIM_COLOR)
        c.drawString(mx + 16, my + mh - 24, tag)
        
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(GREEN_COLOR)
        c.drawString(mx + 16, my + mh - 50, val)
        
        c.setFont("Helvetica", 10.5)
        c.setFillColor(MUTED_COLOR)
        c.drawString(mx + 16, my + mh - 80, l1)
        c.drawString(mx + 16, my + mh - 96, l2)
        
    c.showPage()

    # =========================================================================
    # SLIDE 2: THE TWO FATAL CRISES
    # =========================================================================
    draw_background()
    draw_masthead("SLIDE 02 / 05", "PROBLEM STATEMENT // STRUCTURAL BLOCKCHAIN FRICTION")
    
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(WHITE_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.2), "THE TWO FATAL CRISES OF AUTONOMOUS AGENT FINANCE")
    
    c.setFont("Helvetica", 13)
    c.setFillColor(MUTED_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.5), "Why enterprises and developers cannot safely hand raw Web3 wallets to autonomous AI models:")
    
    col_w = 5.7
    col_h = 4.2
    
    # Crisis 1
    c1x, c1y, c1w, c1h = draw_card(0.8, 1.7, col_w, col_h, stroke_color=RED_COLOR, stroke_width=1.5)
    c.setFont("Courier-Bold", 11)
    c.setFillColor(RED_COLOR)
    c.drawString(c1x + 20, c1y + c1h - 26, "CRISIS 01: GAS PRICE VOLATILITY LOCKUP")
    
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(WHITE_COLOR)
    c.drawString(c1x + 20, c1y + c1h - 52, "Fluctuating Network Fees Stalling Workflows")
    
    b1 = [
        ("The Two-Token Hurdle:", "Agents on Ethereum/Solana must hold volatile native assets (ETH, SOL) solely to pay gas."),
        ("Sudden Fee Spikes:", "Network congestion spikes or depleted gas balances immediately stall autonomous task loops mid-run."),
        ("Unpredictable Accounting:", "Corporate finance teams cannot audit or budget AI agents when gas costs fluctuate 200% intra-day."),
        ("Idle Capital Friction:", "Treasuries must constantly top up gas balances across dozens of fragmented worker accounts.")
    ]
    curr_y = c1y + c1h - 85
    for bold_hdr, text in b1:
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(WHITE_COLOR)
        c.drawString(c1x + 20, curr_y, "• " + bold_hdr)
        curr_y = draw_wrapped_text(text, c1x + 30, curr_y - 15, max_chars=50, line_spacing=13, font_size=10, font_color=MUTED_COLOR)
        curr_y -= 10

    # Crisis 2
    c2x, c2y, c2w, c2h = draw_card(6.833, 1.7, col_w, col_h, stroke_color=RED_COLOR, stroke_width=1.5)
    c.setFont("Courier-Bold", 11)
    c.setFillColor(RED_COLOR)
    c.drawString(c2x + 20, c2y + c2h - 26, "CRISIS 02: UNBOUNDED TREASURY DRAINAGE")
    
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(WHITE_COLOR)
    c.drawString(c2x + 20, c2y + c2h - 52, "Unconstrained Signing Autonomy & Attacks")
    
    b2 = [
        ("Binary Key Permissions:", "Standard private keys give agents 100% total signing authority with zero spend limits or gates."),
        ("Prompt Injection Hijacking:", "A malicious external API response can trick the agent into transferring all funds to an attacker."),
        ("Runaway Inference Loops:", "Code bugs or retry storms trigger recursive calls, draining thousands of dollars in minutes."),
        ("Permanent Irreversibility:", "Once funds leave a standard Web3 wallet, there is zero recourse or clawback mechanism.")
    ]
    curr_y = c2y + c2h - 85
    for bold_hdr, text in b2:
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(WHITE_COLOR)
        c.drawString(c2x + 20, curr_y, "• " + bold_hdr)
        curr_y = draw_wrapped_text(text, c2x + 30, curr_y - 15, max_chars=50, line_spacing=13, font_size=10, font_color=MUTED_COLOR)
        curr_y -= 10

    c.showPage()

    # =========================================================================
    # SLIDE 3: WHY CIRCLE ARC L1 IS LOAD-BEARING
    # =========================================================================
    draw_background()
    draw_masthead("SLIDE 03 / 05", "SOLUTION ARCHITECTURE // THE ARC ECOSYSTEM FIT")
    
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(WHITE_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.2), "WHY CIRCLE ARC L1 IS LOAD-BEARING FOR POLICYARC")
    
    c.setFont("Helvetica", 13)
    c.setFillColor(MUTED_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.5), "Arc is not just another EVM layer; its unique primitives make sovereign agent economics mathematically viable:")
    
    pillar_w = 3.7
    pillar_h = 4.3
    pillar_gap = 0.316
    
    pillars = [
        ("PILLAR 01 // NATIVE GAS", "Native USDC Gas", [
            "Eliminates the two-token hurdle entirely.",
            "All transaction fees, gas accounting, and balances are denominated in US dollars.",
            "Agents only hold and budget a single, stable currency with zero exchange volatility.",
            "Gas costs are microscopic (~0.000120 USDC), enabling micro-payments down to $0.05."
        ]),
        ("PILLAR 02 // SPEED", "Malachite BFT (<800ms)", [
            "AI agents operate in high-speed algorithmic loops requiring instant execution feedback.",
            "Arc provides deterministic finality in under 800ms via Malachite consensus.",
            "Zero multi-minute block confirmation lags or dropped replacement nonces.",
            "Enables real-time agent-to-agent and agent-to-API payment settlement pipelines."
        ]),
        ("PILLAR 03 // GLOBAL EXPANSION", "Circle StableFX Ready", [
            "Native on-chain atomic stablecoin conversion engine built into the settlement layer.",
            "Agents can hold USDC and seamlessly route payments in EURC or global stablecoins.",
            "Enables global compute leasing across European and Asian localized clusters.",
            "Future-proof substrate for multinational enterprise agent workforces."
        ])
    ]
    
    for i, (tag, title, points) in enumerate(pillars):
        px, py, pw, ph = draw_card(0.8 + i * (pillar_w + pillar_gap), 1.7, pillar_w, pillar_h, 
                                   stroke_color=GREEN_COLOR if i == 0 else BORDER_COLOR,
                                   stroke_width=1.5 if i == 0 else 1)
        c.setFont("Courier-Bold", 10)
        c.setFillColor(GREEN_COLOR)
        c.drawString(px + 18, py + ph - 24, tag)
        
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(WHITE_COLOR)
        c.drawString(px + 18, py + ph - 50, title)
        
        p_y = py + ph - 80
        for pt in points:
            c.setFont("Helvetica", 10.5)
            c.setFillColor(MUTED_COLOR)
            # Text wrapping for points
            words = pt.split()
            line1 = ""
            line2 = ""
            for w in words:
                if len(line1 + " " + w) < 38:
                    line1 = (line1 + " " + w).strip()
                else:
                    line2 = (line2 + " " + w).strip()
            c.drawString(px + 18, p_y, "• " + line1)
            if line2:
                c.drawString(px + 28, p_y - 14, line2)
                p_y -= 16
            p_y -= 26

    c.showPage()

    # =========================================================================
    # SLIDE 4: MECHANISM & INVARIANTS
    # =========================================================================
    draw_background()
    draw_masthead("SLIDE 04 / 05", "MECHANISM & PROOF // BUILD-HARNESS VERIFICATION")
    
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(WHITE_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.2), "THE THREE-TIER SAFETY VALVE & 7 INVARIANTS")
    
    c.setFont("Helvetica", 13)
    c.setFillColor(MUTED_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.5), "PolicyVault implements deterministic on-chain governance backed by automated invariant testing:")
    
    # Left Card
    lx, ly, lw, lh = draw_card(0.8, 1.7, 5.7, 4.3, stroke_color=BORDER_COLOR)
    c.setFont("Courier-Bold", 11)
    c.setFillColor(GREEN_COLOR)
    c.drawString(lx + 20, ly + lh - 24, "ON-CHAIN GOVERNANCE ENGINE")
    
    tiers = [
        ("Tier 1: Autonomous Spends (<= $2.00 USDC)", "Agent queries APIs or procures micro-tasks autonomously. Settles in <800ms with native USDC receipt."),
        ("Tier 2: Supervisor Co-Signature Gate (> $2.00)", "Preflight halts high-value spend. Requires an off-chain cryptographic ECDSA signature from human supervisor key."),
        ("Tier 3: Hard Ceilings ($10.00 Cap / $50 Daily)", "Non-negotiable invariants. Any transaction above $10 or daily spend above $50 immediately reverts on-chain."),
        ("Emergency Circuit Breaker", "Owner or supervisor can trigger fail-closed pause state instantly freezing all vault transfers.")
    ]
    t_y = ly + lh - 56
    for title, desc in tiers:
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(WHITE_COLOR)
        c.drawString(lx + 20, t_y, title)
        t_y = draw_wrapped_text(desc, lx + 20, t_y - 15, max_chars=54, line_spacing=13, font_size=10, font_color=MUTED_COLOR)
        t_y -= 12

    # Right Card
    rx, ry, rw, rh = draw_card(6.833, 1.7, 5.7, 4.3, stroke_color=GREEN_COLOR, stroke_width=1.5)
    c.setFont("Courier-Bold", 11)
    c.setFillColor(GREEN_COLOR)
    c.drawString(rx + 20, ry + rh - 24, "BUILD-HARNESS: 7/7 INVARIANTS PASS (100%)")
    
    invs = [
        "INV-001: Per-Tx Spending Ceiling ($10.00 cap) [PASS]",
        "INV-002: 24h Rolling Budget Accumulator ($50.00) [PASS]",
        "INV-003: Supervisor ECDSA Dual-Signature Gateway [PASS]",
        "INV-004: Strict Destination Whitelist Registry [PASS]",
        "INV-005: Fail-Closed Emergency Circuit Breaker [PASS]",
        "INV-006: Reentrancy Protection via CEI Pattern [PASS]",
        "INV-007: Arc Native USDC Gas Predictability [PASS]"
    ]
    iy = ry + rh - 50
    for inv in invs:
        c.setFont("Courier", 9.5)
        c.setFillColor(WHITE_COLOR)
        c.drawString(rx + 20, iy, "• " + inv)
        iy -= 18

    # Live Proofs inside right box
    c.setFont("Courier-Bold", 10.5)
    c.setFillColor(AMBER_COLOR)
    c.drawString(rx + 20, ry + 82, "FRESH LIVE ARC TESTNET PROOFS:")
    
    c.setFont("Courier", 9)
    c.setFillColor(MUTED_COLOR)
    c.drawString(rx + 20, ry + 64, "• Tx 0xcc1e...f89b: -$0.25 USDC Autonomous Micro-Spend")
    c.drawString(rx + 20, ry + 48, "• Tx 0x0aae...78f9: -$3.50 USDC Supervisor Co-Signed")
    c.drawString(rx + 20, ry + 32, "• Contract: 0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0")
    c.drawString(rx + 20, ry + 16, "• Arcscan Verified Block #65,791,146 (Chain ID 5042002)")

    c.showPage()

    # =========================================================================
    # SLIDE 5: ROADMAP & CIRCLE GRANT PIPELINE
    # =========================================================================
    draw_background()
    draw_masthead("SLIDE 05 / 05", "ROADMAP // CIRCLE GRANT PROGRAM PIPELINE")
    
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(WHITE_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.2), "FROM MICROGRANT TO ENTERPRISE SCALE")
    
    c.setFont("Helvetica", 13)
    c.setFillColor(MUTED_COLOR)
    c.drawString(to_pt(0.8), PAGE_HEIGHT - to_pt(1.5), "The strategic roadmap positioning PolicyArc for the $10,000–$100,000 Circle Grant Program:")
    
    phases = [
        ("PHASE 01 (CURRENT)", "Arc Microgrant MVP", [
            "Complete working prototype on Arc Testnet.",
            "PolicyVault & MockUSDC contracts live.",
            "7 Formally verified security invariants.",
            "Interactive operational console & docs."
        ]),
        ("PHASE 02 (Q4 2026)", "Circle StableFX Integration", [
            "Integrate Circle's native StableFX engine.",
            "Atomic multi-stablecoin swaps (USDC/EURC).",
            "Cross-border agent payroll settlement.",
            "Localized compute cluster leasing."
        ]),
        ("PHASE 03 (Q1 2027)", "Departmental Pools & SDKs", [
            "Hierarchical multi-agent corporate pools.",
            "Sub-agent micro-budget delegation.",
            "First-party plugins for LangChain & CrewAI.",
            "Audit & compliance export for corporate ERPs."
        ])
    ]
    
    phase_w = 3.7
    phase_h = 3.2
    phase_gap = 0.316
    for i, (tag, title, points) in enumerate(phases):
        px, py, pw, ph = draw_card(0.8 + i * (phase_w + phase_gap), 1.7, phase_w, phase_h,
                                   stroke_color=GREEN_COLOR if i == 0 else BORDER_COLOR,
                                   stroke_width=1.5 if i == 0 else 1)
        c.setFont("Courier-Bold", 10)
        c.setFillColor(GREEN_COLOR)
        c.drawString(px + 18, py + ph - 24, tag)
        
        c.setFont("Helvetica-Bold", 15)
        c.setFillColor(WHITE_COLOR)
        c.drawString(px + 18, py + ph - 48, title)
        
        py_pt = py + ph - 74
        for pt in points:
            c.setFont("Helvetica", 10)
            c.setFillColor(MUTED_COLOR)
            c.drawString(px + 18, py_pt, "• " + pt)
            py_pt -= 22

    # Bottom Submission Links Box
    sx, sy, sw, sh = draw_card(0.8, 5.15, 11.733, 0.95, stroke_color=GREEN_COLOR, fill_color=HexColor("#0C100C"), stroke_width=1.5)
    c.setFont("Courier-Bold", 10)
    c.setFillColor(GREEN_COLOR)
    c.drawString(sx + 18, sy + sh - 22, "OFFICIAL SUBMISSION LINKS & VERIFICATION ARTIFACTS:")
    
    c.setFont("Courier", 9.5)
    c.setFillColor(WHITE_COLOR)
    c.drawString(sx + 18, sy + sh - 42, "• Live Console: https://policyarc.vercel.app        • Interactive Docs: https://policyarc.vercel.app/docs")
    c.drawString(sx + 18, sy + sh - 58, "• GitHub Repository: https://github.com/0xNexuz/policy-arc    • PolicyVault: 0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0")

    c.save()
    print(f"Successfully generated PDF presentation at: {output_path}")

if __name__ == "__main__":
    create_pdf()
