import type { KnowledgeDict } from "./types";
// Elements, modalities, polarity — transcribed verbatim from docs/knowledge/rules/ELEMENT_MODALITY_RULES_v1.md (original Darrow content).
export const ELEMENT_MODALITY: KnowledgeDict = {
  fire: {
    id: "fire",
    layer: "element",
    label: "Fire",
    meaning:
      "animating will — the quality of ignition, visibility, direction, and the orientation toward what is alive",
    strength:
      "courage, initiative, warmth, the capacity to inspire and be inspired, forward momentum",
    shadow:
      "burnout from sustained output without replenishment, impatience when momentum slows, heat that consumes what it meant to illuminate",
    practical:
      "sustain the ignition by connecting it to something renewable; fire without fuel exhausts itself",
    safe_report_use: ["emphasis in orientation, operating mode, executive summary when dominant"],
    forbidden_claims: [
      '"fire chart means success/aggression/passion" as deterministic',
      "health claims from fire imbalance",
      '"you lack fire therefore..."',
    ],
    sample_phrase:
      "The fire emphasis in this chart gives it momentum — a quality of moving toward, of wanting to ignite something. The question is whether the fuel is renewable or whether the brightness is burning through something finite.",
    meta: { signs: "Aries, Leo, Sagittarius" },
  },
  earth: {
    id: "earth",
    layer: "element",
    label: "Earth",
    meaning:
      "materialization and form — the capacity to build something tangible, patient, and durable in the physical world",
    strength:
      "stability, craft, reliability, the ability to stay with a process long enough for it to produce real results",
    shadow:
      "rigidity when conditions change, reduction of experience to utility, heaviness when the material world becomes the only register",
    practical:
      "use the building instinct for things that genuinely warrant permanence; not everything needs to be made concrete",
    safe_report_use: [
      "emphasis in professional archetype, body and vitality, environment when dominant",
    ],
    forbidden_claims: [
      '"earth chart guarantees wealth/stability"',
      '"you lack earth therefore you are unstable"',
      "health claims from earth imbalance",
    ],
    sample_phrase:
      "The earth emphasis here gives the chart patience and craft — the orientation toward building what genuinely lasts. The challenge is remembering that some things are meant to remain unfinished, fluid, or alive rather than fixed.",
    meta: { signs: "Taurus, Virgo, Capricorn" },
  },
  air: {
    id: "air",
    layer: "element",
    label: "Air",
    meaning:
      "conceptualization and connection — the capacity to perceive patterns, communicate across differences, and hold multiple perspectives simultaneously",
    strength:
      "clarity of thought, relational intelligence, the ability to translate ideas into language and connect people across distances",
    shadow:
      "detachment from the somatic and emotional dimensions of experience, analysis that processes without arriving, abstraction that floats above what is actually happening",
    practical:
      "connect the thinking to what can be sensed and felt as well as what can be understood; the intelligence is most useful when it is grounded",
    safe_report_use: [
      "emphasis in core architecture, operating mode, relational pattern when dominant",
    ],
    forbidden_claims: [
      '"air chart means intelligence/social ability" as deterministic',
      '"you lack air therefore you can\'t communicate"',
      "compatibility claims from air emphasis",
    ],
    sample_phrase:
      "The air emphasis in this chart gives it range — the capacity to perceive, name, and connect across more territory than most. The question is whether the range ever comes to rest long enough to be inhabited.",
    meta: { signs: "Gemini, Libra, Aquarius" },
  },
  water: {
    id: "water",
    layer: "element",
    label: "Water",
    meaning:
      "emotional depth and resonance — the capacity to perceive and be moved by what cannot be directly named, and to understand others from the inside",
    strength:
      "empathic attunement, depth of memory, the ability to navigate the emotional and symbolic dimensions of experience with genuine intelligence",
    shadow:
      "absorption of others' emotional states at the expense of one's own clarity, boundary dissolution, difficulty distinguishing between received feeling and one's own",
    practical:
      "tend the boundary without eliminating the sensitivity; the depth is most useful when it does not flood the foundation",
    safe_report_use: [
      "emphasis in core architecture, relational pattern, body and vitality, environment when dominant",
    ],
    forbidden_claims: [
      '"water chart means emotional instability"',
      '"you lack water therefore you are cold"',
      "health or psychological claims from water imbalance",
    ],
    sample_phrase:
      "The water emphasis here gives the chart depth and resonance — the ability to sense what is underneath. That intelligence is real. The work is keeping a boundary clear enough to know what belongs to whom.",
    meta: { signs: "Cancer, Scorpio, Pisces" },
  },
  cardinal: {
    id: "cardinal",
    layer: "modality",
    label: "Cardinal",
    meaning:
      "initiation — the orientation toward launching, beginning, directing, and generating forward motion in the life areas each sign governs",
    strength:
      "the capacity to start, to act on an impulse before the conditions are perfect, to open new territory",
    shadow:
      "tendency to initiate more than sustain, to move on before what was started has fully developed",
    practical:
      "pair the initiating quality with the patience to see at least some of what was started through to completion",
    safe_report_use: ["operating mode, professional archetype when dominant"],
    forbidden_claims: [
      '"cardinal dominant means you are a leader"',
      "career guarantees from cardinal emphasis",
    ],
    sample_phrase:
      "The cardinal emphasis in this chart is directional — something in the pattern consistently wants to begin. The challenge is choosing which beginnings are worth the sustained attention that follows the launch.",
    meta: { signs: "Aries, Cancer, Libra, Capricorn" },
  },
  fixed: {
    id: "fixed",
    layer: "modality",
    label: "Fixed",
    meaning:
      "consolidation — the orientation toward sustaining, deepening, and holding a direction once it has been established",
    strength:
      "persistence, depth, the capacity to sustain effort through difficulty without losing the thread",
    shadow:
      "resistance to change that has already become necessary, holding a position or pattern past its usefulness",
    practical:
      "distinguish between productive persistence and loyalty to something that has finished; the fixed quality is most alive when it is attached to something genuinely worth sustaining",
    safe_report_use: ["operating mode, shadow and friction when dominant"],
    forbidden_claims: [
      '"fixed dominant means you are stubborn"',
      "deterministic personality claims from fixed emphasis",
    ],
    sample_phrase:
      "The fixed emphasis here gives the chart staying power — a genuine capacity to hold a direction under pressure. The work is noticing when that persistence has become attachment to something that no longer needs holding.",
    meta: { signs: "Taurus, Leo, Scorpio, Aquarius" },
  },
  mutable: {
    id: "mutable",
    layer: "modality",
    label: "Mutable",
    meaning:
      "adaptation — the orientation toward changing state, translating between conditions, and moving through transition without requiring everything to be stable first",
    strength:
      "flexibility, the ability to navigate uncertainty, responsiveness to shifting conditions",
    shadow:
      "difficulty committing to a direction when too many options remain available, dispersal of energy across too many ongoing adjustments",
    practical:
      "choose a direction to adapt toward; the mutable quality is most alive when the flexibility serves something rather than replacing it",
    safe_report_use: ["operating mode, relational pattern when dominant"],
    forbidden_claims: [
      '"mutable dominant means you are unreliable"',
      "personality type verdicts from mutable emphasis",
    ],
    sample_phrase:
      "The mutable emphasis in this chart means it navigates change well — it does not require conditions to stabilize before it can move. The question is what the movement is orienting toward.",
    meta: { signs: "Gemini, Virgo, Sagittarius, Pisces" },
  },
  yang: {
    id: "yang",
    layer: "polarity",
    label: "Yang / active",
    meaning: "outward expression, projection, engagement",
    strength: "outward expression, projection, engagement",
    shadow: "",
    safe_report_use: [],
    forbidden_claims: ['Yang-dominant charts are not "better" or "more successful."'],
    meta: {
      signs: "Aries, Gemini, Leo, Libra, Sagittarius, Aquarius",
      elements: "Fire, Air",
      tonal_quality: "outward expression, projection, engagement",
    },
  },
  yin: {
    id: "yin",
    layer: "polarity",
    label: "Yin / receptive",
    meaning: "inward processing, containment, absorption",
    strength: "inward processing, containment, absorption",
    shadow: "",
    safe_report_use: [],
    forbidden_claims: ['Yin-dominant charts are not "passive" or "weaker."'],
    meta: {
      signs: "Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces",
      elements: "Earth, Water",
      tonal_quality: "inward processing, containment, absorption",
    },
  },
};
