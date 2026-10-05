# 06. Sponsor Technology Map: Arc (Circle L1)

## Hackathon Program
* **Hackathon:** Arc Microgrants on DoraHacks
* **Sponsor:** Arc / Circle (Issuer of USDC)
* **Prize Track:** Arc Microgrants ($500 USDC × 20 projects, $10,000 pool + Circle Grant Program Pipeline)

## Sponsor Primitives Used & Load-Bearing Status

| Sponsor Feature | Where Used | Is It Load-Bearing? | What Breaks Without It? |
|---|---|:---:|---|
| **USDC as Native Gas Asset** | Smart contract gas execution and balance accounting | **YES (Critical)** | On any other chain, autonomous agents must manage volatile gas tokens (ETH/SOL). An agent holding $50 USDC would freeze if gas token balance drops to zero or spikes. |
| **Malachite Consensus Engine** | Sub-second deterministic finality (&lt;800ms) | **YES** | Multi-block confirmation latency causes autonomous agent tool loops to stall and time out. |
| **Circle StableFX Engine** | Cross-stablecoin atomic routing (planned) | **YES** | Global agent-to-agent payments across currency borders (USD &harr; EURC) would require external AMMs and volatile bridges. |
| **EVM Compatibility** | Solidity contracts & Foundry/Hardhat tooling | **YES** | Allows deployment of standard ERC contracts and cryptographic signature verification. |

## Why Circle Judges Value PolicyArc
1. **Drives USDC Velocity:** Moves USDC from passive store-of-value to active machine-to-machine operating currency.
2. **Highlights Arc's Unique Advantage:** Arc is the *only* major chain where gas fees are paid in USDC, making it the natural home for AI agent swarms.
3. **Institutional Viability:** Fits Circle's institutional validator set (BlackRock, Visa, DTCC) by adding enterprise policy controls.
