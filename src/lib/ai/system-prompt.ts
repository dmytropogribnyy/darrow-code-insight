// Darrow Code AI System Prompt — canonical loader.
//
// The single source of truth for the Darrow Code Interpretation Engine lives at:
//   src/lib/ai/darrowcode_ai_system_prompt.md
//
// That markdown file is the permanent operating system of the report generator.
// Do NOT inline, summarize, or fork the prompt elsewhere. To change report
// voice, structure, JSON schema guidance, PDF page mapping, STYLE palette
// logic, BODY disclaimers, FULL CODE assembly, or any other narrative
// behavior — edit the markdown file. This module just loads it.
//
// Loaded via Vite `?raw` so the file ships in the server bundle but stays
// editable as a real .md document.

import darrowMasterPrompt from "./darrowcode_ai_system_prompt.md?raw";

export const DARROW_SYSTEM_PROMPT: string = darrowMasterPrompt;
