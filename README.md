<p align="center"><img src="assets/hero.svg" alt="LFAI WORLD — twelve-station knowledge factory" width="100%"></p>

## LFAI WORLD — a personal knowledge factory

**Thesis.** The next generation of personal AI is being built *inside* large platforms: your notes, chats and drafts become their training material, and leaving is hard. LFAI WORLD takes the opposite position — **the individual owns the factory.** Knowledge workers keep their sources on their own devices, publish from their own account, and choose (and swap) whichever AI model suits them.

**What this account is.** A reference installation: a headquarters repository ([world-00-hq](https://github.com/dimaspark/world-00-hq)) plus twelve private station repositories that form one production line, from raw AI conversation to published web book. The same line is installed for each client, one account at a time.

| Station | Repository | Role | Fab analogy |
|---|---|---|---|
| WC-01 | [world-01-inbox](https://github.com/dimaspark/world-01-inbox) | Conversation Intake | Wafer start |
| WC-02 | [world-02-ledger](https://github.com/dimaspark/world-02-ledger) | Ledger & Filter | Clean & incoming inspection |
| WC-03 | [world-03-atoms](https://github.com/dimaspark/world-03-atoms) | Knowledge Atoms | Patterning & etch |
| WC-04 | [world-04-gate](https://github.com/dimaspark/world-04-gate) | Disclosure Gate | Metrology & human QC |
| WC-05 | [world-05-book](https://github.com/dimaspark/world-05-book) | Web Book | Deposition & interconnect |
| WC-06 | [world-06-cards](https://github.com/dimaspark/world-06-cards) | Summary Cards | Derived die — cards |
| WC-07 | [world-07-voice](https://github.com/dimaspark/world-07-voice) | Audio | Derived die — audio |
| WC-08 | [world-08-motion](https://github.com/dimaspark/world-08-motion) | Motion | Derived die — video |
| WC-09 | [world-09-class](https://github.com/dimaspark/world-09-class) | Courseware | Derived die — courseware |
| WC-10 | [world-10-press](https://github.com/dimaspark/world-10-press) | Distribution | Packaging & shipping |
| WC-11 | [world-11-archive](https://github.com/dimaspark/world-11-archive) | Archive & Voice Data | Yield data (YMS) |
| WC-12 | [world-12-mirror](https://github.com/dimaspark/world-12-mirror) | Mirror & Portability | Warehouse & recovery |

### How it works
1. **Capture** — a long AI conversation is shared once from the phone; the capture app stores it without clipboard limits.
2. **Process** — a deterministic engine (`world run`) cleans, de-duplicates, splits into knowledge atoms and masks personal data. It runs on a laptop, mini PC or Android device; no GPU, no hosted server.
3. **Approve** — a person decides what may be published (`world approve`).
4. **Publish** — approved material becomes a web book (PWA), cards, audio scripts, motion pages and courseware.
5. **Measure** — every conversation is a lot with a traveler; `world kpi` reports yield, work-in-progress, scrap and cycle time.
6. **Own** — `world backup` produces complete git bundles; the factory can be restored or moved at any time.

### Why it is different
| | Platform-owned AI | Local note apps | **LFAI WORLD** |
|---|---|---|---|
| Who owns the source | The platform | The user | **The user (device + own account)** |
| Publishing | Inside the platform | Often a paid add-on | **Web book included** |
| AI model | Vendor's own | Plugins | **User's choice, user's bill** |
| Hardware | Vendor servers | User device | **Laptop / mini PC / phone, no GPU** |
| Leaving | Hard | Files only | **Whole factory moves** |

### Business model
- **Turnkey setup, one person at a time.** Account, devices, capture app, engine and a first published chapter, verified on site against five acceptance checks. Fixed scope, no open-ended support.
- **Upgrade path.** When an owner's archive grows into a case for a private model on dedicated hardware, the same ledger and style data carry over to a build-out engagement — nothing is rebuilt from scratch.

### Status (2026)
- Engine and installer: end-to-end test suite passing (12 stations, de-duplication, approval, publishing, data masking, backup/restore, idempotent re-runs, lot tracking).
- This account: reference line installed — HQ + 12 stations, all private.

<sub>LFAI WORLD · Life First, AI Second</sub>
