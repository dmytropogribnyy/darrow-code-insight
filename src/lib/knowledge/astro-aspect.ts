import type { KnowledgeDict } from "./types";

// Major aspects — transcribed verbatim from docs/knowledge/rules/ASTRO_ASPECT_RULES_v1.md (original Darrow content).
export const ASTRO_ASPECT: KnowledgeDict = {
  conjunction: {
    id: "conjunction",
    layer: "aspect",
    label: "Conjunction",
    meaning:
      "two symbolic functions operating as one combined force — amplified, concentrated, inseparable",
    strength:
      "the combined functions act with intensity and focus; the person experiences them as deeply unified aspects of self",
    shadow:
      "the functions may reinforce each other's shadow as readily as their strength; it can be difficult to see one without the other",
    practical:
      "recognize the fusion; distinguish the two functions enough to choose how to apply them together rather than letting them automatically merge",
    safe_report_use: ["core_architecture", "operating_mode", "shadow_and_friction"],
    forbidden_claims: [
      "this conjunction causes [specific life event]",
      "conjunction is lucky/unlucky",
    ],
    sample_phrase:
      "These two functions are fused in this chart — they operate as a single force rather than as separate energies. The gift is in the concentration. The challenge is seeing them clearly enough to work with them deliberately.",
    meta: {
      angle: "0°",
      group: "fusion",
      orb: "up to 8–10°",
    },
  },
  opposition: {
    id: "opposition",
    layer: "aspect",
    label: "Opposition",
    meaning:
      "two symbolic functions in maximum polarity — life consistently asks the person to hold both ends without collapsing into either",
    strength:
      "awareness through contrast, the capacity to understand both sides of a polarity, integration through repeated encounter",
    shadow:
      "oscillation between the poles without integrating them, projecting one side onto others or onto external situations, the exhaustion of sustained tension",
    practical:
      "hold both ends as a genuine and productive tension rather than resolving it by choosing a side",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "shadow_and_friction",
      "relational_pattern",
    ],
    forbidden_claims: [
      "opposition causes relationship conflict",
      "this opposition will break apart",
      "deterministic event predictions",
    ],
    sample_phrase:
      "This aspect describes a polarity the chart keeps returning to. These two functions pull in opposite directions — not to destroy each other, but to develop the capacity to hold both at once. Integration, not resolution, is what this asks for.",
    meta: {
      angle: "180°",
      group: "tension-building",
      orb: "up to 8–10°",
    },
  },
  square: {
    id: "square",
    layer: "aspect",
    label: "Square",
    meaning:
      "two symbolic functions in productive friction — the repeated contact between them generates skill, drive, and capability through resistance",
    strength:
      "the tension creates ambition and the energy to override obstacles; the person develops competence precisely in the area of friction",
    shadow:
      "the friction becomes frustration when there is no forward channel; the drive turns back on itself when blocked",
    practical:
      "find the productive outlet for the tension; squares are most alive when they are building something rather than colliding inside the person",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "shadow_and_friction",
      "professional_archetype",
    ],
    forbidden_claims: [
      "this square will cause [specific problem]",
      "square aspects are bad/difficult signs",
      "you have hard aspects therefore...",
    ],
    sample_phrase:
      "There is a persistent friction here between two functions that do not easily agree. That friction is not a flaw — it is a generator. The question is whether the energy it produces has a direction, or whether it just creates heat.",
    meta: {
      angle: "90°",
      group: "tension-building",
      orb: "up to 6–8°",
    },
  },
  trine: {
    id: "trine",
    layer: "aspect",
    label: "Trine",
    meaning:
      "two symbolic functions in natural resonance — they operate in the same elemental register and communicate without effort",
    strength:
      "ease of operation, natural talent in the area the two functions share, a quality that may feel so effortless it goes unrecognized",
    shadow:
      "because the flow requires no friction, it may be taken for granted or left undeveloped; ease without engagement can produce less than tension would",
    practical:
      "notice the gift and choose to develop it deliberately; the trine is most valuable when its ease is recognized and applied rather than assumed",
    safe_report_use: ["core_architecture", "operating_mode", "executive_summary"],
    forbidden_claims: [
      "trine guarantees success or luck",
      "trines protect you from difficulty",
      "this is your strongest area",
    ],
    sample_phrase:
      "This is a place where two functions communicate naturally — where effort is reduced and the quality flows readily. The invitation is to take it seriously rather than let the ease become the reason not to develop it.",
    meta: {
      angle: "120°",
      group: "harmonizing",
      orb: "up to 6–8°",
    },
  },
  sextile: {
    id: "sextile",
    layer: "aspect",
    label: "Sextile",
    meaning:
      "two symbolic functions in cooperative potential — the connection is supportive but requires activation through participation",
    strength:
      "accessible talent that responds to engagement, the capacity to draw on both functions in a complementary way",
    shadow:
      "the potential requires activation; it does not self-generate; without participation it remains potential only",
    practical:
      "engage with the territory; the sextile responds to initiative in a way that trines do not always require",
    safe_report_use: ["core_architecture", "operating_mode"],
    forbidden_claims: ["sextile guarantees opportunity", "this will work out easily"],
    sample_phrase:
      "There is a cooperative quality between these two functions — they support each other when engaged. The opportunity is real; it simply requires showing up for it.",
    meta: {
      angle: "60°",
      group: "harmonizing",
      orb: "up to 4–6°",
    },
  },
  quincunx: {
    id: "quincunx",
    layer: "aspect",
    label: "Quincunx",
    meaning:
      "two symbolic functions with no natural common ground — they operate in incompatible registers and require ongoing translation, not force",
    strength:
      "the persistent adjustment builds a specific kind of flexibility and attentiveness; people with strong quincunxes develop nuanced calibration",
    shadow:
      "frustration with the persistent mismatch, the sense that something is always slightly off, exhaustion from the ongoing translation",
    practical:
      "adjust rather than resolve; the quincunx does not have a clean resolution — it has an ongoing translation practice",
    safe_report_use: ["shadow_and_friction", "operating_mode — as texture note"],
    forbidden_claims: [
      "quincunx causes health problems",
      "this is a bad aspect",
      "deterministic claims",
    ],
    sample_phrase:
      "These two functions do not easily speak the same language. There is a persistent adjustment required between them — not a problem to fix, but a translation to maintain. What develops from that is a particular kind of attentiveness.",
    meta: {
      angle: "150°",
      group: "adjustment",
      orb: "up to 2–3°",
    },
  },
};
