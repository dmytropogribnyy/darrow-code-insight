# DARROW CODE — SOURCE LOG

# Status: ACTIVE · maintained continuously

# Purpose: Track external reference materials used in knowledge base development

---

## FORMAT

Each entry:
| Date | Source | Used for | License / access type | Notes |
|---|---|---|---|---|

---

## LOG ENTRIES

| Date | Source | Used for | License / access type | Notes |
|---|---|---|---|---|
| 2026-06-02 | FreeAstroAPI (freeastroapi.com) | Current production data provider — Western natal + BaZi calculations | Contracted API subscription | API key in CF Workers env only |
| 2026-06-02 | IANA Time Zone Database | Future birth-time timezone resolution reference | Public domain | Not yet implemented |
| 2026-06-02 | General astrological tradition | Conceptual background for interpretation rules | General knowledge / public domain concepts | No specific text copied |
| 2026-06-02 | General numerological tradition | Conceptual background for LP/Expr/Soul Urge interpretation rules | General knowledge / public domain concepts | No specific text copied |
| 2026-06-02 | General BaZi tradition | Conceptual background for Day Master / element interpretation rules | General knowledge / public domain concepts | No specific text copied |

---

## NOTES

- Entries are added when external material informs specific knowledge-base rule development.
- General background research that does not result in direct extraction does not require an entry.
- If a source requires attribution in production output, note that here and apply it.
- Copyrighted text must never appear in Darrow Code knowledge files — log only if used as conceptual background.

---

## INTERNAL PHASE NOTES

| Date | Phase | Note |
|---|---|---|
| 2026-06-02 | KB1-A | KBSYS0 skeleton inspected. SOURCE_PACK_IMPORT_MANIFEST_v1.md created. Nine source-pack candidates listed. No source packs imported. No runtime changes. |
| 2026-06-02 | KB1-B | 9 canonical source-pack files imported into docs/knowledge/source_packs/. All marked research-only / not active in runtime. Superseded v0_1 files not imported. No curated rules created. No runtime changes. |
| 2026-06-02 | KB2-A | 6 curated Darrow rule docs created in docs/knowledge/rules/ from approved source packs (Western Zodiac + Houses addenda + master pack). Original Darrow Code language. No gated layers added. No source packs edited. No runtime changes. |
