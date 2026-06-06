import type { KnowledgeDict } from "./types";

// 12 Western zodiac signs — transcribed verbatim from docs/knowledge/rules/ASTRO_ZODIAC_RULES_v1.md (original Darrow content).
export const ASTRO_ZODIAC: KnowledgeDict = {
  aries: {
    id: "aries",
    layer: "zodiac",
    label: "Aries",
    meaning: "ignition before certainty — the capacity to act when the path is still forming",
    strength: "courage, directional initiation, willingness to go first without a guarantee",
    shadow:
      "reactive exits, impatience when motion slows, force when persuasion would serve better",
    practical:
      "act, then check the impact; the quality is in the speed of correction, not the speed of start",
    safe_report_use: [
      "orientation",
      "core_architecture",
      "operating_mode",
      "professional_archetype",
    ],
    forbidden_claims: [
      "you are aggressive",
      "Aries guarantees leadership",
      "your lucky stone/color/number is...",
      "you are incompatible with X",
    ],
    sample_phrase:
      "There is a quality in this chart that moves before certainty arrives. Not recklessness — the willingness to start when the map is still forming. The challenge is to stay long enough to learn from what the start reveals.",
    meta: {
      element: "fire",
      modality: "cardinal",
      polarity: "yang / active",
      traditional_ruler: "Mars",
      modern_ruler: "—",
    },
  },
  taurus: {
    id: "taurus",
    layer: "zodiac",
    label: "Taurus",
    meaning:
      "stabilization through body, value, and rhythm — the capacity to build something that lasts",
    strength:
      "endurance, consistent effort, sensory attunement, the ability to hold a course without drama",
    shadow:
      "over-attachment to what is known, slow release of what has outgrown its usefulness, comfort as a trap",
    practical:
      "build value without becoming owned by the building; periodically release what the rhythm has already finished",
    safe_report_use: [
      "core_architecture",
      "environment_and_resonance",
      "professional_archetype",
      "body_and_vitality",
    ],
    forbidden_claims: [
      "Taurus guarantees financial stability",
      "your lucky stone is emerald",
      "you are stubborn",
      "you are incompatible with X",
    ],
    sample_phrase:
      "This part of the chart knows how to hold ground — not stubbornly, but through genuine depth of commitment. The pattern builds slowly, sensibly, sustainably. The challenge is recognizing when what once felt like security has become inertia.",
    meta: {
      element: "earth",
      modality: "fixed",
      polarity: "yin / receptive",
      traditional_ruler: "Venus",
      modern_ruler: "—",
    },
  },
  gemini: {
    id: "gemini",
    layer: "zodiac",
    label: "Gemini",
    meaning: "reality understood through language, connection, and movement between perspectives",
    strength:
      "adaptability, fast perception, translation between people and ideas, ability to see multiple angles simultaneously",
    shadow:
      "fragmentation, nervous over-processing, starting without finishing, surface performance over depth",
    practical:
      "focus the signal; choose the most resonant thread and follow it to its end before picking up the next",
    safe_report_use: ["core_architecture", "operating_mode", "relational_pattern"],
    forbidden_claims: [
      "Gemini is two-faced",
      "you are unreliable because of Gemini",
      "compatibility guarantees",
    ],
    sample_phrase:
      "The cognitive range here is real — the mind picks up signals others don't register and moves between them fluidly. What it asks of the person is a choice: which signal is most worth following? Without that choice, the range becomes scatter.",
    meta: {
      element: "air",
      modality: "mutable",
      polarity: "yang / active",
      traditional_ruler: "Mercury",
      modern_ruler: "—",
    },
  },
  cancer: {
    id: "cancer",
    layer: "zodiac",
    label: "Cancer",
    meaning:
      "emotional memory as intelligence — the capacity to sense what is needed before it can be named",
    strength:
      "attuned protection, depth of care, inner radar for emotional climate, the ability to restore and nourish",
    shadow:
      "over-absorption of others' states, defensive retreat, mood-based decision-making, protection that closes instead of opening",
    practical:
      "protect without locking; the intelligence is most useful when it stays porous enough to update",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "body_and_vitality",
      "environment_and_resonance",
    ],
    forbidden_claims: [
      "Cancer is clingy",
      "you are overly emotional",
      "health diagnoses from Cancer placement",
      "compatibility guarantees",
    ],
    sample_phrase:
      "There is a quality of emotional attunement in this chart that functions like a precise instrument. It registers what others are experiencing before they say it. The question is whether that sensitivity is protecting something alive or defending against something that already ended.",
    meta: {
      element: "water",
      modality: "cardinal",
      polarity: "yin / receptive",
      traditional_ruler: "Moon",
      modern_ruler: "—",
    },
  },
  leo: {
    id: "leo",
    layer: "zodiac",
    label: "Leo",
    meaning:
      "visible authorship of identity — the capacity to lead through warmth and creative presence",
    strength: "radiance, loyalty, generous leadership, the ability to make others feel recognized",
    shadow:
      "pride wound when recognition is withheld, performance pressure, leadership that requires applause to sustain itself",
    practical:
      "lead from what the heart genuinely cares about, not from what wins approval; the warmth is most real when it does not need confirmation",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "professional_archetype",
      "relational_pattern",
    ],
    forbidden_claims: [
      "Leo is arrogant",
      "your lucky gemstone/color is...",
      "career or fame guarantees",
      "compatibility guarantees",
    ],
    sample_phrase:
      "This part of the chart wants to author something — not to perform, but to put something genuinely its own into the world. The distinction matters: performance requires an audience; authorship is satisfied by the thing itself.",
    meta: {
      element: "fire",
      modality: "fixed",
      polarity: "yang / active",
      traditional_ruler: "Sun",
      modern_ruler: "—",
    },
  },
  virgo: {
    id: "virgo",
    layer: "zodiac",
    label: "Virgo",
    meaning:
      "refinement as service and self-respect — the capacity to improve what exists until it genuinely works",
    strength:
      "precision, pattern recognition, useful intelligence, the ability to find and correct what is not working",
    shadow:
      "self-criticism turned inward, endless refinement that delays completion, perfectionism as a form of avoidance",
    practical:
      "apply the precision externally as often as internally; the craft is most alive when it serves something beyond the process itself",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "professional_archetype",
      "body_and_vitality",
    ],
    forbidden_claims: [
      "Virgo is neurotic",
      "health diagnoses from Virgo placement",
      "you are a hypochondriac",
      "compatibility guarantees",
    ],
    sample_phrase:
      "There is a quality in this chart that sees what is not quite right — in systems, in work, in situations — and wants to correct it. The strength is in the precision. The challenge is knowing when the improvement has already been made.",
    meta: {
      element: "earth",
      modality: "mutable",
      polarity: "yin / receptive",
      traditional_ruler: "Mercury",
      modern_ruler: "—",
    },
  },
  libra: {
    id: "libra",
    layer: "zodiac",
    label: "Libra",
    meaning:
      "relational calibration — the capacity to hold multiple perspectives simultaneously and find the position that honors them",
    strength:
      "diplomacy, aesthetic attunement, fairness, the ability to build environments where more than one person can be present",
    shadow:
      "self-erasure in service of harmony, decision-avoidance when choosing means disappointing someone, identity diffusion in relationship",
    practical:
      "choose without abandoning the value of fairness; the capacity is most alive when it does not require pleasing everyone",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "relational_pattern",
      "professional_archetype",
    ],
    forbidden_claims: [
      "Libra is indecisive",
      "compatibility guarantees",
      "your best match is...",
      "lucky stone/color claims",
    ],
    sample_phrase:
      "This chart carries a quality of relational intelligence — the ability to read a room, calibrate a response, and find the version of a situation that multiple people can inhabit. The challenge is maintaining a position when calibration would require erasing the self.",
    meta: {
      element: "air",
      modality: "cardinal",
      polarity: "yang / active",
      traditional_ruler: "Venus",
      modern_ruler: "—",
    },
  },
  scorpio: {
    id: "scorpio",
    layer: "zodiac",
    label: "Scorpio",
    meaning:
      "hidden pressure and truth-reading — the capacity to perceive what is operating beneath the surface",
    strength:
      "depth of loyalty, psychological courage, transformative intelligence, the ability to stay when others have left",
    shadow:
      "suspicion, control through withholding, guarded intimacy that keeps depth available but connection distant",
    practical:
      "let truth move through the system without needing to control where it lands; depth is most alive when it can be shared",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "shadow_and_friction",
      "relational_pattern",
    ],
    forbidden_claims: [
      "Scorpio is vengeful",
      "you are dangerous",
      "health/death claims from Scorpio placement",
      "compatibility guarantees",
    ],
    sample_phrase:
      "There is a quality in this chart that perceives below the stated surface — what is not being said, what is actually driving a situation. That perception is a genuine intelligence. The question is whether it is deployed in service of trust or in service of control.",
    meta: {
      element: "water",
      modality: "fixed",
      polarity: "yin / receptive",
      traditional_ruler: "Mars",
      modern_ruler: "Pluto",
    },
  },
  sagittarius: {
    id: "sagittarius",
    layer: "zodiac",
    label: "Sagittarius",
    meaning:
      "meaning through horizon — the capacity to hold and transmit a vision of what could be larger than what currently exists",
    strength:
      "expansive thinking, teaching through lived experience, the ability to inspire direction and hold optimism in difficult territory",
    shadow:
      "excess in service of experience-seeking, escape into abstraction when the ground becomes demanding, overpromising before the aim is set",
    practical:
      "aim the arrow before releasing it; the capacity for expansion is most useful when it is attached to a specific enough target",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "professional_archetype",
      "relational_pattern",
    ],
    forbidden_claims: [
      "Sagittarius guarantees travel/success",
      "you are commitment-phobic",
      "compatibility guarantees",
    ],
    sample_phrase:
      "This part of the chart moves toward meaning. It is restless in environments that feel too small, too literal, too finished. The gift is in the expansion. The challenge is landing long enough to give the vision a form that others can work with.",
    meta: {
      element: "fire",
      modality: "mutable",
      polarity: "yang / active",
      traditional_ruler: "Jupiter",
      modern_ruler: "—",
    },
  },
  capricorn: {
    id: "capricorn",
    layer: "zodiac",
    label: "Capricorn",
    meaning:
      "structure and earned authority — the capacity to build something real through sustained, often unseen effort",
    strength:
      "mastery through patience, reliable execution, the ability to hold responsibility without requiring recognition at every step",
    shadow:
      "heaviness when the duty feels disconnected from meaning, emotional austerity, over-identification with the role",
    practical:
      "build the structure with life still inside it; the achievement is most real when the person can be present for what they built",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "professional_archetype",
      "shadow_and_friction",
    ],
    forbidden_claims: [
      "Capricorn guarantees career success",
      "you are cold / emotionless",
      "financial predictions from Capricorn placement",
      "compatibility guarantees",
    ],
    sample_phrase:
      "There is a quality in this chart that knows how to build. Not because of ambition alone — because something in the architecture of this person understands that what lasts must be constructed carefully, often quietly, and often longer than expected.",
    meta: {
      element: "earth",
      modality: "cardinal",
      polarity: "yin / receptive",
      traditional_ruler: "Saturn",
      modern_ruler: "—",
    },
  },
  aquarius: {
    id: "aquarius",
    layer: "zodiac",
    label: "Aquarius",
    meaning:
      "pattern recognition beyond convention — the capacity to see how a system works from outside its own assumptions",
    strength:
      "originality, systems-level thinking, ability to hold a long-range vision while remaining useful in the present",
    shadow:
      "detachment from the human cost of the vision, alienation when the pattern is understood but connection is not, rigidity of freedom",
    practical:
      "humanize the system; the vision is most alive when it can be received by someone who has not yet seen it",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "professional_archetype",
      "relational_pattern",
    ],
    forbidden_claims: ["Aquarius is cold/robotic", "compatibility guarantees", "you are a rebel"],
    sample_phrase:
      "This chart carries an unusual quality of perspective — the ability to see a system, a situation, or a pattern from a position slightly outside it. That view is valuable. The challenge is staying connected to the people inside the system while working to change it.",
    meta: {
      element: "air",
      modality: "fixed",
      polarity: "yang / active",
      traditional_ruler: "Saturn",
      modern_ruler: "Uranus",
    },
  },
  pisces: {
    id: "pisces",
    layer: "zodiac",
    label: "Pisces",
    meaning:
      "permeability to symbol, mood, and compassion — the capacity to receive what cannot yet be named and give it a form",
    strength:
      "imaginative depth, empathic attunement, the ability to dissolve unnecessary boundaries and enter others' experience",
    shadow:
      "diffusion when the boundary dissolves without intention, escape into symbol or sensation when the present becomes too demanding, boundary loss",
    practical:
      "give form to the vision; the permeability is most alive when it produces something specific enough to be received by another person",
    safe_report_use: [
      "core_architecture",
      "operating_mode",
      "shadow_and_friction",
      "body_and_vitality",
    ],
    forbidden_claims: [
      "Pisces is confused/unreliable",
      "you are psychic",
      "health claims from Pisces placement",
      "compatibility guarantees",
    ],
    sample_phrase:
      "There is a quality in this chart that receives more than it declares. Moods, atmospheres, the unspoken needs of a room — these register before they are articulated. The question is how to give that reception a form: a practice, a work, a way of serving, without dissolving into what was received.",
    meta: {
      element: "water",
      modality: "mutable",
      polarity: "yin / receptive",
      traditional_ruler: "Jupiter",
      modern_ruler: "Neptune",
    },
  },
};
