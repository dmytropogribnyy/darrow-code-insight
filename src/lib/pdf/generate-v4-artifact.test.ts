// B4.1 diagnostic artifact generator.
// Run standalone: npx vitest run src/lib/pdf/generate-v4-artifact.test.ts
// Output: outputs/pdf-v4.1-core-diagnostic.html
//
// Writes a complete v4.1 CORE HTML document using a realistic fixture.
// Open in browser for visual QA. For PDF, run: node scripts/generate-v4-pdf.mjs
// NOT run as part of the standard test suite (skipped in CI).

import { writeFileSync, mkdirSync } from "node:fs";
import { describe, it } from "vitest";
import { renderCoreV4HtmlSafe } from "./template";

const FIXTURE_CORE_V4 = {
  schema_version: "core_v4" as const,
  cover_tagline: "Your personal architecture, decoded.",

  orientation: {
    opening_line: "You have always operated with a distinct internal compass.",
    prose:
      "You have always operated with a distinct internal compass — a quiet but reliable sense of what the situation actually requires, beneath the noise of what people say it requires. This is not stubbornness. It is calibration. You read the field before you act in it, and that gap — between perception and response — is where your best thinking lives.\n\nThe risk in this pattern is that the calibration becomes slower than the situation demands. When you are under pressure, the internal compass can feel like a liability rather than an asset. It is not. The problem is usually that the environment has shortened the available time for your natural process, and you have not yet built a way to run the process faster without running it shallowly.",
    proof_tags: ["Mercury–Saturn structural emphasis", "Earth grand-trine calibration"],
  },

  core_architecture: {
    prose:
      "The structural layer of how you function is built around a central tension: between depth and speed. You are capable of both, but not simultaneously — and most systems you encounter are designed for people who are comfortable living in the shallower register by default.\n\nYour architecture is not built for shallow. It is built for thoroughness, for convergence, for the moment when a pattern becomes undeniable because enough signals have aligned. This gives you a kind of reliability that is rare: you do not change your mind on flimsy evidence, and you do not miss important signals because you were moving too fast.",
    protocols: [
      {
        title: "Signal Before Action",
        body: "Before responding to any significant demand, pause for one breath and ask: what is the actual signal here? Not what the person says, not what the situation looks like — what is the actual signal?",
      },
    ],
    proof_tags: ["Saturn dominant", "Earth element emphasis"],
  },

  operating_mode: {
    prose:
      "Your default processing style is sequential and depth-first. You enter a problem through one door and follow it until you have found what you need, then you surface and address the next thread. This is extremely effective for complex problems and less effective when you need to manage multiple light threads simultaneously.\n\nIn practice, this means your performance is most reliable when you are allowed to work on one thing deeply before moving to the next, and least reliable when you are required to context-switch repeatedly without completing any single thread.",
    key_insight:
      "You are most effective in environments that match your depth — not because you cannot adapt, but because your architecture produces its best results at full depth.",
    proof_tags: ["Mercury in earth sign", "3rd-house depth-first wiring"],
  },

  battery: {
    prose:
      "What restores you is not rest in the conventional sense — it is the experience of completion. When a significant piece of work reaches a genuine conclusion, there is a restoration that happens in the system that is more thorough than sleep alone can provide.\n\nThe maintenance practice is to create more genuine completions in your life, not more rest periods. Understand the difference between appropriate incompleteness (things that are genuinely in-progress) and chronic incompleteness (things that have stalled and are bleeding energy).",
    warning_signals: [
      "Chronic overpreparation as a form of avoidance.",
      "Treating rest as the primary restoration strategy when completion is actually what is needed.",
    ],
    proof_tags: ["Moon–Saturn completion need", "4th-house restoration axis"],
  },

  social_interface: {
    prose:
      "Your social interface is precise and selective. You are capable of warmth and genuine connection, but you do not distribute it indiscriminately — you offer it to people who have demonstrated they will use it well. This is not coldness. It is a form of respect: you do not pretend to be closer to someone than you actually are.\n\nThe people who earn consistent access to your inner world receive something rare. Most people in your life experience the social interface — competent, warm, professionally reliable — without realising there is a more private layer beneath it.",
    proof_tags: ["Venus selective placement", "7th-house boundary signature"],
  },

  numerology_code: {
    prose:
      "The numerological layer of your pattern amplifies the structural themes already present in the natal chart. Your Life Path carries the quality of depth-seeking combined with the discipline to see things through — not as a personality trait but as an operating requirement. This number teaches through the experience of sustained effort, which is why the most significant achievements in your life tend to follow periods of concentrated, often invisible, work.\n\nThe Birthday Number adds a specific gift for translation: the ability to take complex systems and render them legible to people who need to use them without needing to understand all of their internal mechanics.",
    proof_tags: ["Life Path 4 discipline", "Birthday Number translation gift"],
  },

  cognitive_style: {
    prose:
      "You think in structures. Not necessarily in visual diagrams or formal frameworks — but in relationships between elements, hierarchies of importance, sequences that make inherent sense. When a situation does not have an underlying structure, you either find one or you feel uncertain about how to proceed.\n\nThis cognitive preference produces reliable thinking when the situation has real structure, and appropriate caution when it does not. The caution is correct — structureless situations are often genuinely ambiguous, and your discomfort with them is a more accurate response than the confidence of people who are comfortable proceeding without adequate structure.",
    proof_tags: ["Mercury–Saturn structured cognition", "fixed-mode pattern bias"],
  },

  drive_and_rhythm: {
    prose:
      "Your drive is most active when oriented toward something with genuine consequence. You do not perform well in environments where the work does not actually matter — not because you are lazy, but because your system requires meaning as fuel. The moment you cannot see the real consequence of the work, your effort drops to maintenance-level.\n\nYour rhythm is long-cycle. You build up over weeks and months, produce in concentrated bursts, and then need genuine recovery before the next cycle begins. This is not inefficiency — it is the operating pattern of a system that is built for significant output, not continuous output.",
    proof_tags: ["Mars long-cycle placement", "fixed-sign endurance"],
  },

  professional_archetype: {
    prose:
      "Your professional archetype is the Architect of Order — someone who enters complex situations and creates reliable structures where there were none, or repairs structures that have degraded. You are not primarily an innovator in the sense of generating novel ideas from nothing; you are primarily an engineer of reliable function.\n\nThe most satisfying professional contexts for this archetype are those where the problem is genuinely complex, where the stakes are real, and where the solution will actually be used by people who need it. Performing for display — producing impressive-looking work that does not actually function — creates a specific kind of internal friction that others may not notice but you cannot ignore.",
    protocols: [
      {
        title: "Define the Real Problem First",
        body: "Before proposing any solution, spend time explicitly defining the actual problem — not the presented problem, not the assumed problem, but the actual constraint that, if relieved, would make the most difference. Write it down. Confirm it with the people involved.",
      },
    ],
    proof_tags: ["MC in Capricorn", "Saturn-Sun applying trine", "Life Path 4 structural quality"],
  },

  money_and_value: {
    prose:
      "Your relationship with resources is conservative in the best sense: you value what you have built, you are reluctant to spend what took significant effort to accumulate, and you make financial decisions slowly. This is a protective function that has served you well — and occasionally costs you opportunities that required faster decision-making.\n\nThe development edge in this area is distinguishing between the slow decision that is actually appropriate caution and the slow decision that is avoidance of a commitment whose outcome is uncertain. Both feel like the same thing from the inside.",
    proof_tags: ["2nd-house conservation", "Saturn resource caution"],
  },

  relationship_baseline: {
    prose:
      "Your relational baseline is loyalty-first. Once you have decided that someone is worth your investment, you remain invested through conditions that would cause others to withdraw. This is a genuine asset and a genuine vulnerability: the asset is that the people who earn your loyalty receive something rare; the vulnerability is that you may remain loyal past the point where the relationship is actually serving either of you.\n\nThe practice is periodic honesty about whether the loyalty is still generating something real, or whether it has become habit and history without current substance.",
    proof_tags: ["Venus–Saturn loyalty bind", "fixed-sign attachment"],
  },

  vitality_baseline: {
    prose:
      "Your physical system runs on rhythm. When your daily patterns are consistent, your vitality is high and your recovery is fast. When those patterns are disrupted — whether by travel, intense work periods, or social obligation — your recovery takes longer than most people expect, including you.\n\nThe maintenance practice is not adding supplements or optimizing sleep metrics. It is protecting the rhythmic patterns that your system uses as its foundation. When you violate those patterns for good reasons, build in explicit recovery time — not compressed, not adjacent to the next demand, but actual unstructured space.",
    disclaimer:
      "This is interpretive orientation, not medical advice. Consult a qualified healthcare professional for any health concerns.",
    proof_tags: ["6th-house rhythm dependence", "Earth-element recovery cycle"],
  },

  environment_and_resonance: {
    prose:
      "Environments that support you have three qualities: reliable structure, genuine stakes, and enough quiet to allow depth. The opposite — chaotic structure, low-consequence work, constant noise — produces a specific kind of fatigue that is different from ordinary tiredness. It is the fatigue of a system that cannot run its natural process because the environment does not provide the conditions for it.\n\nThis means that one of the most productive investments you can make is in the quality of your working environment — not its prestige or its size, but its ability to provide the three qualities your system requires.",
    scenario:
      "Think of a well-designed workshop: tools in known places, a project that actually matters, enough uninterrupted time to work through a problem properly. That is the environment your architecture understands.",
    proof_tags: ["4th-house environment sensitivity", "Earth-element grounding"],
  },

  shadow_and_friction: {
    prose:
      "The primary shadow in this pattern is the tendency to over-prepare as a form of avoidance. When something feels important and you are not confident in your readiness, you will prepare more rather than begin. This is adaptive up to a point — genuine preparation produces genuine confidence — but past that point it becomes a way of not having to find out whether you are actually ready.\n\nThe friction point in relationships is a related pattern: you expect the people around you to maintain the same standard of follow-through that you hold yourself to, and when they do not, the disappointment is disproportionate to the actual cost of the failure. This is not about being demanding — it is about the way your system calculates trust.",
    warning_signals: [
      "Over-preparation as avoidance of the actual moment of commitment.",
      "Holding others to standards you have not explicitly communicated.",
    ],
    proof_tags: ["Saturn over-preparation signature", "12th-house avoidance pull"],
  },

  before_after: {
    opening_line: "Two patterns, before and after the work of recognition.",
    before_after_pairs: [
      {
        before:
          "Preparing extensively before beginning, using preparation as a substitute for beginning. The loop: more research, more planning, more confidence-seeking before the first real move.",
        after:
          "Beginning with adequate preparation and trusting that the remaining preparation will happen in the doing. The entry point is earlier; the quality is not lower.",
      },
      {
        before:
          "Holding people to implicit standards and experiencing silent disappointment when those standards are not met. The pattern: internal expectation without external communication.",
        after:
          "Communicating standards explicitly and creating the conditions for others to meet them. The expectation becomes a shared reference point rather than a private measuring stick.",
      },
    ],
    proof_tags: ["Saturn maturation arc", "progressed-Moon timing"],
  },

  executive_summary: {
    opening_line: "The essential architecture, compressed.",
    executive_summary_blocks: [
      {
        label: "YOUR CORE ADVANTAGE" as const,
        content:
          "You produce reliable depth in situations that require it. When others are working at the surface, you are finding the actual structure beneath. This is not common.",
      },
      {
        label: "YOUR PRIMARY SENSITIVITY" as const,
        content:
          "The system requires meaning as fuel. When the work does not have genuine consequence, your architecture underperforms — not from lack of effort but from lack of the signal it runs on.",
      },
      {
        label: "YOUR DECISION FORMULA" as const,
        content:
          "Gather quietly, hold until the pattern becomes undeniable, then decide with the full authority of what you have accumulated. Do not force the timeline; do not extend it past the point of clarity.",
      },
      {
        label: "THE CORE CONCLUSION" as const,
        content:
          "You are built for significance, not volume. The pattern produces its best results when the stakes are real, the time is sufficient, and the environment allows depth. Protect these conditions.",
      },
      {
        label: "CURRENT CYCLE" as const,
        content:
          "The current cycle is consolidation before a significant expansion. The structural work you are doing now will be the foundation for what comes next. This is not a plateau; it is load-bearing time.",
      },
      {
        label: "THE NEXT LEVEL" as const,
        content:
          "Operating from genuine choice rather than accumulated obligation. The architecture is capable of this; the practice is learning to distinguish between the two in real time.",
      },
    ],
    proof_tags: ["whole-chart synthesis", "BaZi Day Master + Life Path convergence"],
  },

  next_step: {
    prose: "Four principles for working with this architecture over the next period.",
    closing_pillars: [
      {
        title: "TRUST THE SIGNAL" as const,
        prose:
          "Your internal signal is more accurate than your uncertainty about it suggests. When you have gathered sufficient information and the pattern becomes clear, trust what you see. The doubt that follows clarity is not additional data; it is the system re-checking its own work past the point of usefulness.",
      },
      {
        title: "BUILD THE BASE" as const,
        prose:
          "The structural work is the most productive investment available to you right now. Not the visible work, not the work that gets immediate response — the structural work that will hold the next phase of what you are building. This is the appropriate use of this cycle.",
      },
      {
        title: "RESPECT THE CYCLE" as const,
        prose:
          "The current phase is consolidation. Expansion will come, but not by forcing it before the structural work is complete. The architecture knows the difference between a foundation that is ready and one that is not. Trust the pacing.",
      },
      {
        title: "HONOR THE SPACE" as const,
        prose:
          "Protect the conditions that allow depth: uninterrupted time, real stakes, reliable rhythm. These are not luxuries. They are operating requirements. The architecture cannot produce its best work without them.",
      },
    ],
    proof_tags: ["current Saturn cycle", "consolidation-phase timing"],
  },
};

// Client Snapshot fixture — deterministic, non-real data for visual QA.
// Mirrors the v3 client_snapshot shape so the same snapshot page design renders.
const FIXTURE_CLIENT_SNAPSHOT = {
  pattern_name: "The Structural Architect",
  core_pattern:
    "A builder of reliable systems in uncertain terrain. Moves slowly by design, lands with authority.",
  unique_signature:
    "You bring depth where others bring speed. In environments that reward thoroughness, you are the one others quietly defer to — not because of status, but because your read is consistently more accurate than theirs.",
  primary_strength:
    "Structural clarity under ambiguity — you find the load-bearing constraints others skip.",
  pressure_point:
    "Over-preparation as avoidance — the loop of more research before the first real move.",
  best_operating_rhythm:
    "Long cycles: build quietly, produce in concentrated bursts, recover genuinely.",
  current_timing_theme:
    "Consolidation phase. The structural work you are doing now will carry the next expansion.",
  practical_focus:
    "Protect depth-conditions: uninterrupted time, real stakes, reliable daily rhythm. These are not luxuries.",
};

describe("B4.1 — v4.1 HTML artifact generation", () => {
  it("writes outputs/pdf-v4.1-core-diagnostic.html for visual review", () => {
    mkdirSync("outputs", { recursive: true });
    const html = renderCoreV4HtmlSafe(FIXTURE_CORE_V4, "Dmitry", FIXTURE_CLIENT_SNAPSHOT);
    writeFileSync("outputs/pdf-v4.1-core-diagnostic.html", html, "utf8");
    console.log(
      `\n✓ outputs/pdf-v4.1-core-diagnostic.html (${html.length.toLocaleString()} bytes)`,
    );
    console.log("  Open in a browser to visually review the v4.1 layout.");
    console.log("  For PDF: node scripts/generate-v4-pdf.mjs");
    console.log("  (requires outputs/pdf-v4.1-core-diagnostic.html to exist first)");
  });
});
