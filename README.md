<p align="center"><img src="assets/hero.svg" alt="LFAI WORLD — twelve-station knowledge factory" width="100%"></p>

<p align="center">
  <a href="https://lfai-world.github.io/world-00-hq/"><b>▶ Live factory dashboard</b></a> &nbsp;·&nbsp;
  <a href="https://github.com/lfai-world/world-00-hq"><b>Headquarters repository</b></a> &nbsp;·&nbsp;
  <a href="https://dimas-40.github.io/lfai-world/"><b>LFAI WORLD</b></a>
</p>

## Your AI conversations are your best raw material. Publish them from an account you own.

People who create knowledge every day — authors, lecturers, researchers, creators — already think out loud with AI assistants. Those conversations end up scattered across apps, cut off by clipboard limits, and stored on someone else's platform.

**LFAI WORLD is a personal publishing factory that lives inside one GitHub account.** A conversation goes in; a web book chapter, summary cards, an audio script, a motion page and courseware come out — after a person approves it. The owner keeps the originals, the keys and the data. No GPU, no hosted server, no lock-in to a single AI vendor.

<p align="center"><a href="https://lfai-world.github.io/world-00-hq/"><img src="assets/dashboard.png" alt="Live HQ dashboard: lots in, shipped, yield, production line, showroom" width="100%"></a></p>
<p align="center"><sub>The live dashboard of this account's reference factory — real numbers, refreshed from the owner's device.</sub></p>

## How it works

<p align="center"><img src="assets/architecture.png" alt="Architecture: devices run the engine, one GitHub account holds HQ plus twelve private stations, a person approves at the gate" width="100%"></p>

1. **Capture** — share a long conversation once from the phone. The capture app stores it without clipboard limits.
2. **Process** — `world run` cleans and de-duplicates it, splits it into knowledge atoms and masks personal data. Deterministic; runs on a laptop, a mini PC or an Android phone.
3. **Approve** — a person reads the queue and decides (`world approve`, `world reject` sends it back for rework).
4. **Publish** — approved material ships as a web book (PWA), cards, read-aloud scripts, motion pages and courseware.
5. **Measure** — every conversation is a *lot* with a traveler. `world kpi` reports yield, work-in-progress, scrap, rework and cycle time; `world runsheet` shows exactly where each lot is.
6. **Own** — `world backup` writes complete git bundles. The whole factory can be restored or moved.

## Nothing is hidden — the edit is part of the product

Each published chapter opens in three layers: the **edited text**, the **edit process** (what the person asked, what the AI answered, what the editing agent removed, corrected and added — and why), and the **original conversation** with only personal data masked. A bar shows how much of the chapter came from the person, the AI and the agent.

<p align="center"><img src="assets/three-layers.png" alt="One chapter in three layers: edited text, edit process, original conversation" width="100%"></p>

## Measured, not claimed — reference run

| | |
|---|---|
| Conversations in | **5**, one each from Claude, ChatGPT, Gemini, Grok and Perplexity |
| Knowledge atoms | **79** |
| Published chapters | **5** — each with edited text, edit notes and the original |
| Style data | **55** person → AI pairs (JSONL), kept by the owner |
| Stations passed | **12 / 12** for every lot · wiring check **13 / 13** lines |
| Yield | **100 %** · scrap 0 · rework 0 |
| Personal data left in published output | **0** (automated check) |

## Why this is different

| | Platform-owned AI | Local note apps | **LFAI WORLD** |
|---|---|---|---|
| Who owns the source | The platform | The user | **The user — device + own account** |
| Publishing | Inside the platform | Often a paid add-on | **Web book included** |
| AI model | The vendor's own | Plugins | **Your choice, your bill** |
| Hardware | Vendor servers | Your device | **Laptop / mini PC / phone, no GPU** |
| Process visibility | None | None | **Every lot traced; every edit shown** |
| Leaving | Hard | Files only | **The whole factory moves** |

## Principles
- **Keys and originals stay with the owner.** Tokens, passwords and AI keys are never stored by the factory or by us.
- **A person approves every publication.** The gate is a design choice, not a setting.
- **Standard model.** One installer (the bolt) and a fixed menu of options (the nuts) — no per-client custom code.
- **Honest output.** AI text is raw material; the edit and its reasons are published alongside it.

## Business model
- **Turnkey setup, one person at a time** — account, devices, capture app, engine and a first published chapter, verified on site against five acceptance checks. Fixed scope, fixed follow-up Q&A, no open-ended support.
- **Upgrade path** — when an owner's archive justifies a private model on dedicated hardware, the same ledger and style data carry over. Nothing is rebuilt.

<sub>LFAI WORLD · Life First, AI Second · Not affiliated with the LF AI & Data Foundation.</sub>
