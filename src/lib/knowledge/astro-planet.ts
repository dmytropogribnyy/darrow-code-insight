import type { KnowledgeDict } from "./types";

// Planets — transcribed verbatim from docs/knowledge/rules/ASTRO_PLANET_RULES_v1.md (original Darrow content).
export const ASTRO_PLANET: KnowledgeDict = {
  sun: {
    id: "sun",
    layer: "planet",
    label: "Sun",
    meaning:
      "the quality the person is developing the authority to embody — the animating core of self-expression",
    strength:
      "visible center, confident self-direction, the capacity to act from genuine inner authority",
    shadow:
      "ego pressure when identity feels threatened, rigidity when the identity cannot adapt, performance of self instead of expression",
    practical:
      "inhabit the center without defending it; authority is most alive when it does not require protection",
    safe_report_use: ["orientation", "core_architecture", "executive_summary"],
    forbidden_claims: [
      "your Sun sign determines your destiny",
      "health or career guarantees from Sun placement",
      "your best match is...",
    ],
    sample_phrase:
      "The Sun describes the quality this person is building the authority to be. Not a fixed type — a direction of development. The strength of this placement shows in how fully the person can inhabit it without needing external validation.",
    meta: {
      layer_class: "personal",
      function: "authorship / vital center / conscious identity direction",
    },
  },
  moon: {
    id: "moon",
    layer: "planet",
    label: "Moon",
    meaning:
      "how the person restores themselves, what they need to feel safe, and what their emotional intelligence registers most readily",
    strength:
      "memory and care as intelligence, emotional attunement, the capacity to restore self and others",
    shadow:
      "mood-dependent perception, over-protective behaviors that shut out growth, seeking safety through comfort at the expense of development",
    practical:
      "recognize the rhythm rather than override it; the emotional intelligence is most useful when it is acknowledged, not suppressed",
    safe_report_use: [
      "core_architecture",
      "body_and_vitality",
      "environment_and_resonance",
      "relational_pattern",
    ],
    forbidden_claims: [
      "Moon sign determines your emotions definitively",
      "health or fertility claims from Moon placement",
      "you are moody as a fixed label",
    ],
    sample_phrase:
      "The Moon describes the emotional operating system — what this person needs in order to feel restored, safe, and present. That system is not a weakness. It is a genuine intelligence that needs to be worked with, not overridden.",
    meta: {
      layer_class: "personal",
      function: "emotional body / safety system / inner rhythm",
    },
  },
  mercury: {
    id: "mercury",
    layer: "planet",
    label: "Mercury",
    meaning: "how the person takes in, organizes, and transmits information and experience",
    strength:
      "analytical clarity, communicative precision, the ability to translate complex signals into usable language",
    shadow:
      "overthinking, nervous scattering, processing without landing, language as defense against experience",
    practical:
      "communicate with specificity; the perceptive quality is most useful when it produces something transmissible",
    safe_report_use: ["core_architecture", "operating_mode", "professional_archetype"],
    forbidden_claims: [
      "Mercury retrograde caused the problem",
      "learning disability claims from Mercury placement",
      "intelligence guarantees",
    ],
    sample_phrase:
      "The perceptive range of this chart is notable. It picks up and processes more signals than most. The question is whether the processing ever finishes — or whether the mind keeps revising rather than arriving.",
    meta: {
      layer_class: "personal",
      function: "perception / language / information processing",
    },
  },
  venus: {
    id: "venus",
    layer: "planet",
    label: "Venus",
    meaning:
      "what this person genuinely values, how they relate to beauty and pleasure, and what they are naturally drawn toward",
    strength:
      "aesthetic intelligence, relational warmth, the capacity to create environments that feel harmonious and attractive",
    shadow:
      "pleasing others at the expense of one's own values, indulgence that avoids difficulty, attraction without discernment",
    practical:
      "know what is genuinely valued before orienting toward it; the aesthetic and relational intelligence is most useful when it serves something real",
    safe_report_use: ["core_architecture", "relational_pattern", "environment_and_resonance"],
    forbidden_claims: [
      "Venus guarantees relationship success",
      "Venus retrograde ruined your relationship",
      "love/wealth attraction claims",
    ],
    sample_phrase:
      "Venus describes what genuinely attracts and what feels worth building — in relationships, in environments, in work. The signal here is not about romance alone. It is about taste: what this person keeps returning to as beautiful, worthwhile, or true.",
    meta: {
      layer_class: "personal",
      function: "value / beauty / attraction / choice",
    },
  },
  mars: {
    id: "mars",
    layer: "planet",
    label: "Mars",
    meaning:
      "how this person initiates, what animates their desire, and how they deal with opposition",
    strength:
      "courage, directed initiative, the capacity to sustain effort toward something genuinely desired",
    shadow:
      "aggression when desire is frustrated, impatience when forward motion is blocked, force used where persuasion would serve",
    practical:
      "direct the energy toward something specific; Mars is most effective when desire and direction are aligned",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "shadow_and_friction",
      "professional_archetype",
    ],
    forbidden_claims: [
      "Mars causes violence",
      "hard Mars aspect makes you dangerous",
      "health/injury guarantees from Mars",
    ],
    sample_phrase:
      "The drive here is real. Something in this chart wants to move, to act, to initiate. The question is what that energy is pointed toward — and whether the direction is worth the force being applied.",
    meta: {
      layer_class: "personal",
      function: "action / desire / directed energy / defense",
    },
  },
  jupiter: {
    id: "jupiter",
    layer: "planet",
    label: "Jupiter",
    meaning:
      "where this person naturally expands, what they believe in, and what they use to make sense of experience",
    strength:
      "generosity of vision, trust in the possibility of growth, the ability to teach and transmit meaning",
    shadow:
      "excess in service of more-more-more, inflation of what is actually available, overreach that outpaces the ground",
    practical:
      "ground the expansion in something specific; Jupiter is most useful when the optimism is attached to an actual direction",
    safe_report_use: [
      "core_architecture",
      "professional_archetype",
      "relational_pattern",
      "executive_summary",
    ],
    forbidden_claims: [
      "Jupiter guarantees luck or wealth",
      "Jupiter return fixes everything",
      "financial predictions from Jupiter",
    ],
    sample_phrase:
      "There is an expansive quality here — a genuine orientation toward more: more meaning, more connection, more possibility. The gift is in the reach. The work is making sure the reach is attached to something that can actually hold it.",
    meta: {
      layer_class: "social",
      function: "expansion / meaning / opportunity / growth orientation",
    },
  },
  saturn: {
    id: "saturn",
    layer: "planet",
    label: "Saturn",
    meaning:
      "where this person must develop through sustained effort and where shortcuts consistently fail",
    strength:
      "discipline, long-range vision, the ability to build something that lasts because it was built slowly",
    shadow:
      "contraction when the pressure feels permanent, fear that limits more than the situation requires, over-identification with difficulty",
    practical:
      "treat the limitation as a curriculum, not a verdict; the mastery is on the other side of the sustained effort",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "shadow_and_friction",
      "professional_archetype",
    ],
    forbidden_claims: [
      "Saturn causes suffering",
      "Saturn return destroys relationships/careers",
      "deterministic life-event predictions from Saturn",
    ],
    sample_phrase:
      "Saturn describes where this person must earn what they get — where charm or talent alone will not be enough. That is not punishment. It is a design: the area where the deepest competence becomes possible precisely because it cannot be shortcuts.",
    meta: {
      layer_class: "social",
      function: "structure / limitation / mastery / earned authority",
    },
  },
  uranus: {
    id: "uranus",
    layer: "planet",
    label: "Uranus",
    meaning:
      "where the person (and their generation) experiences the pressure to break from the inherited form",
    strength:
      "originality, the capacity to innovate and see beyond convention, the ability to tolerate discontinuity without collapse",
    shadow:
      "instability for its own sake, alienation from connection in service of freedom, disruption that destroys before it creates",
    practical:
      "break what needs to change; Uranus is most alive when the disruption serves a recognizable future direction",
    safe_report_use: ["core_architecture", "operating_mode — as generational texture"],
    forbidden_claims: ["Uranus transit guarantees upheaval", "Uranus causes divorce/job loss"],
    sample_phrase:
      "This placement carries a generational quality: the pressure toward breaking with inherited form, toward original thinking, toward patterns that have not been worn smooth by convention. Whether that energy is disruptive or generative depends on what it is aimed at.",
    meta: {
      layer_class: "transpersonal",
      function: "freedom / disruption / pattern-breaking / collective awakening",
    },
  },
  neptune: {
    id: "neptune",
    layer: "planet",
    label: "Neptune",
    meaning:
      "where the person (and their generation) encounters the dissolving of boundaries — between self and other, between what is real and what is imagined",
    strength:
      "imaginative depth, empathic porousness, the ability to work with symbol and indirect perception",
    shadow:
      "confusion when the boundaries dissolve without intention, escape into fantasy when reality becomes demanding, delusion mistaken for inspiration",
    practical:
      "give the imagination a form; Neptune is most alive when its permeability produces something specific enough to be shared",
    safe_report_use: [
      "core_architecture — as generational texture",
      "body_and_vitality — as porous boundary note",
    ],
    forbidden_claims: [
      "Neptune causes addiction",
      "you are psychically sensitive as a literal claim",
      "health claims from Neptune",
    ],
    sample_phrase:
      "Neptune describes where boundaries become more negotiable — in this person's generation and, through personal aspects, in their own relationship to what can and cannot be clearly defined. The question is whether that porousness is intentional or managed.",
    meta: {
      layer_class: "transpersonal",
      function: "dissolution / imagination / transcendence / collective idealism",
    },
  },
  pluto: {
    id: "pluto",
    layer: "planet",
    label: "Pluto",
    meaning:
      "where the person (and their generation) encounters pressure to transform through confronting what has been hidden, suppressed, or denied power",
    strength:
      "psychological depth, the capacity to sustain transformation without collapse, the ability to work with shadow rather than be run by it",
    shadow:
      "control through withholding, obsession, compulsion to manage what feels threatening, power-over when shared power would serve better",
    practical:
      "let the transformation complete; Pluto is most alive when the depth perception moves through the system rather than becoming a permanent guard",
    safe_report_use: ["core_architecture — as generational texture", "shadow_and_friction"],
    forbidden_claims: [
      "Pluto transit causes death/destruction",
      "Pluto guarantees psychological crisis",
      "power or control claims",
    ],
    sample_phrase:
      "Pluto describes where this chart encounters the irreversible — where something must fundamentally change rather than be adjusted. That territory is rarely comfortable and usually productive.",
    meta: {
      layer_class: "transpersonal",
      function: "depth / power / transformation / confrontation with the underworld",
    },
  },
  chiron: {
    id: "chiron",
    layer: "planet",
    label: "Chiron",
    meaning:
      "the area where the person has experienced persistent difficulty and, through that difficulty, developed a specific quality of guidance or understanding",
    strength:
      "the capacity to accompany others through territory that was once isolating, because it has been genuinely traversed",
    shadow:
      "over-identification with the wound as identity, giving what was needed rather than what is currently real",
    safe_report_use: ["shadow_and_friction — as supporting texture only"],
    forbidden_claims: ["Chiron causes permanent wounding", "health diagnoses from Chiron"],
    sample_phrase:
      "There is a thread in this chart that has required working through something difficult without a reliable guide. What developed on the other side of that is genuinely transmissible.",
    meta: {
      layer_class: "conditional",
      conditional: "supporting signal only; not primary",
      condition: "supporting signal only; do not use as primary interpretation",
      function:
        "wound / hard-won medicine / the place where the person's deepest difficulty becomes their most transferable competence",
    },
  },
  north_node: {
    id: "north_node",
    layer: "planet",
    label: "North Node",
    meaning:
      "the direction this chart is oriented toward developing — usually territory that feels less familiar but increasingly necessary",
    strength: "",
    shadow: "",
    safe_report_use: ["executive_summary — as light directional texture only"],
    forbidden_claims: [
      "North Node determines your soul purpose",
      "South Node is your past life",
      "any karmic certainty claims",
    ],
    meta: {
      layer_class: "conditional",
      conditional: "supporting signal only; not primary",
      condition: "supporting signal only; describe as directional pull, not fate",
      function: "directional pull / developmental edge / evolutionary trajectory",
    },
  },
  lilith: {
    id: "lilith",
    layer: "planet",
    label: "Lilith",
    meaning:
      "a pattern of instinctive knowing that was suppressed and may now be seeking reintegration",
    strength: "",
    shadow: "",
    safe_report_use: ["shadow_and_friction — as supporting texture only"],
    forbidden_claims: [
      "Lilith makes you angry/dangerous/sexual",
      "Lilith is your dark side",
      "any deterministic claims",
    ],
    meta: {
      layer_class: "conditional",
      conditional: "supporting signal only; not primary",
      condition:
        "supporting signal only; use only if chart architecture warrants it; avoid overuse",
      function:
        "the quality that has been rejected or denied — the place where instinct was told it was wrong",
    },
  },
};
