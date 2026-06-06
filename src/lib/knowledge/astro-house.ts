import type { KnowledgeDict } from "./types";

// 12 houses — transcribed verbatim from docs/knowledge/rules/ASTRO_HOUSE_RULES_v1.md (original Darrow content). All require birth time.
export const ASTRO_HOUSE: KnowledgeDict = {
  house_1: {
    id: "house_1",
    layer: "house",
    label: "House 1",
    meaning:
      "how the person meets the world and how the world meets them; the physical and social interface of self",
    strength: "clarity of embodied presence, comfort in one's own physical and social signature",
    shadow: "preoccupation with image or first impression at the expense of depth",
    practical: "inhabit the body before explaining the self",
    safe_report_use: ["core_architecture", "social_interface"],
    forbidden_claims: [
      '"your 1st house determines your appearance definitively"',
      "physical description claims from 1st house sign",
      "health prognoses from 1st house",
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "Ascendant / House of Self",
      darrow_area: "identity interface, body, first impression, embodied presence",
      house_type: "angular",
    },
  },
  house_2: {
    id: "house_2",
    layer: "house",
    label: "House 2",
    meaning: "the field where the person builds their sense of material and psychological worth",
    strength:
      "steady value-building, resource sense, ability to know what is genuinely worth keeping",
    shadow:
      "scarcity fear, self-worth contingent on material holdings, attachment to what has already been outgrown",
    practical: "build value without becoming owned by the building",
    safe_report_use: ["MONEY add-on", "professional_archetype", "value baseline"],
    forbidden_claims: [
      '"2nd house determines wealth/poverty"',
      "financial outcome guarantees",
      '"your income will [specific claim]"',
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Possessions / Self-Worth",
      darrow_area: "material resources, self-worth, value system, earned income orientation",
      house_type: "succedent",
    },
  },
  house_3: {
    id: "house_3",
    layer: "house",
    label: "House 3",
    meaning:
      "the field where the person builds skill, language, and connection in their immediate cognitive and social environment",
    strength: "clear communication, skillful learning, the ability to translate and transmit",
    shadow: "scattered attention, noise over signal, nervous comparison with immediate others",
    practical: "make language useful and specific rather than comprehensive",
    safe_report_use: ["core_architecture", "operating_mode — cognitive style"],
    forbidden_claims: [
      '"3rd house determines intelligence"',
      "sibling outcome claims",
      "travel claims from 3rd house",
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Communication",
      darrow_area:
        "speech, writing, learning, local environment, siblings and peers, short journeys",
      house_type: "cadent",
    },
  },
  house_4: {
    id: "house_4",
    layer: "house",
    label: "House 4",
    meaning:
      "the field that underlies everything — the emotional and material base the person builds from and returns to",
    strength: "emotional anchoring, the ability to create a home base that genuinely restores",
    shadow:
      "family entanglement, nostalgia trap, using the past as the primary measure of the present",
    practical:
      "create a base that supports forward movement rather than one that simply recreates what was",
    safe_report_use: ["environment_and_resonance", "body_and_vitality", "core_architecture"],
    forbidden_claims: [
      '"4th house determines your relationship with your mother/father"',
      "real estate predictions",
      "family outcome claims",
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "IC / House of Home",
      darrow_area: "home, roots, emotional base, private foundation, family of origin legacy",
      house_type: "angular",
    },
  },
  house_5: {
    id: "house_5",
    layer: "house",
    label: "House 5",
    meaning:
      "the field where the person most naturally expresses what is alive and genuine in them — through making, playing, and risking pleasure",
    strength: "creative radiance, the capacity to take genuine pleasure, willingness to express",
    shadow: "performance hunger, drama, validation-seeking in romance or creative work",
    practical: "create because life wants expression, not because an audience demands it",
    safe_report_use: ["LOVE add-on", "STYLE add-on", "creative texture in CORE"],
    forbidden_claims: [
      '"5th house determines how many children you will have"',
      "romantic outcome claims",
      '"5th house guarantees creative success"',
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Pleasure / Children",
      darrow_area: "creativity, play, romance, authorship of joy, self-expression through creation",
      house_type: "succedent",
    },
  },
  house_6: {
    id: "house_6",
    layer: "house",
    label: "House 6",
    meaning:
      "the field where the person sustains themselves through the daily system they build and maintain",
    strength:
      "disciplined self-maintenance, useful service, the capacity to build and keep sustainable routines",
    shadow:
      "overwork, self-criticism about physical or work performance, anxiety around the body as a project",
    practical: "build routines that serve life rather than turning life into a routine",
    safe_report_use: ["BODY add-on", "professional rhythm in CORE — as soft texture only"],
    forbidden_claims: [
      '"6th house determines your health"',
      "illness diagnoses from 6th house planets",
      '"your 6th house shows [specific health problem]"',
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Health / Service",
      darrow_area: "daily routine, work rhythm, service, body maintenance, refinement practices",
      house_type: "cadent",
    },
  },
  house_7: {
    id: "house_7",
    layer: "house",
    label: "House 7",
    meaning:
      "the field where the person most clearly encounters what they cannot fully recognize in themselves — through the people they choose as partners and significant others",
    strength:
      "genuine cooperation, relational intelligence, the capacity to meet an equal other fully",
    shadow: "projection, dependency on the mirror, losing the self in the partnership",
    practical:
      "meet others without disappearing into them; the field is richest when both parties remain distinct",
    safe_report_use: ["LOVE add-on", "relational_pattern — if birth time reliable"],
    forbidden_claims: [
      '"7th house determines your marriage"',
      '"you will marry a [sign] person"',
      "divorce/partnership outcome predictions",
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Partnership / Descendant",
      darrow_area: "partnership, contracts, the equal other, the projected self, relational mirror",
      house_type: "angular",
    },
  },
  house_8: {
    id: "house_8",
    layer: "house",
    label: "House 8",
    meaning:
      "the field where the person encounters irreversible change — through intimacy, shared material reality, and the confrontation with what cannot be controlled",
    strength:
      "psychological courage, the capacity to sustain transformation, depth of trust in intimate bonds",
    shadow:
      "control around intimacy or shared resources, crisis attachment, power dynamics that replace genuine closeness",
    practical: "let transformation complete rather than managing it back to comfort",
    safe_report_use: [
      "LOVE add-on",
      "MONEY add-on",
      "shadow_and_friction — if birth time reliable",
    ],
    forbidden_claims: [
      '"8th house determines death/inheritance"',
      '"8th house means you have trauma"',
      "financial outcome claims from 8th house",
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Death / Shared Resources",
      darrow_area:
        "intimacy, shared resources, psychological depth, crisis and renewal, hidden power dynamics",
      house_type: "succedent",
    },
  },
  house_9: {
    id: "house_9",
    layer: "house",
    label: "House 9",
    meaning:
      "the field where the person seeks to understand the larger pattern — to locate themselves within something wider than the immediate situation",
    strength:
      "expansive thinking, the capacity to hold and transmit a vision, orientation toward genuine learning",
    shadow: "dogma mistaken for wisdom, escape into abstraction, overpromising about meaning",
    practical: "ground the horizon in something specific enough to reach",
    safe_report_use: ["YEAR add-on", "professional_archetype — as directional texture"],
    forbidden_claims: [
      '"9th house determines your beliefs"',
      "travel outcome guarantees",
      '"9th house means you will study/teach"',
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Philosophy / Long Journeys",
      darrow_area:
        "meaning, philosophy, belief, higher education, long travel, teaching, cultural horizon",
      house_type: "cadent",
    },
  },
  house_10: {
    id: "house_10",
    layer: "house",
    label: "House 10",
    meaning:
      "the field where private competence becomes public responsibility — where the person's work meets the world's acknowledgment",
    strength:
      "mastery that becomes visible, the capacity to hold a public role without losing the private self",
    shadow:
      "over-identification with status, ambition disconnected from meaning, the role replacing the person",
    practical:
      "build a role that can hold your real life, not one that requires the real life to disappear",
    safe_report_use: ["professional_archetype", "executive_summary — if birth time reliable"],
    forbidden_claims: [
      '"10th house determines your career/success"',
      '"MC in [sign] means you will be [profession]"',
      "fame or status outcome guarantees",
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "Midheaven / MC / House of Career",
      darrow_area:
        "vocation, public role, visible authority, earned reputation, the contribution that is remembered",
      house_type: "angular",
    },
  },
  house_11: {
    id: "house_11",
    layer: "house",
    label: "House 11",
    meaning:
      "the field where the person situates themselves in relation to what is coming — through the circles they choose and the shared visions they commit to",
    strength:
      "community intelligence, the capacity to hold a long-range vision in collaboration with others",
    shadow:
      "group dependency, social abstraction that replaces genuine connection, alienation within the collective",
    practical:
      "choose circles that strengthen the future self rather than simply belonging to them",
    safe_report_use: ["social_interface", "professional_archetype — as network texture"],
    forbidden_claims: [
      '"11th house determines your friendships"',
      "friendship outcome predictions",
      '"you will achieve your goals because of 11th house"',
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of Friends / Groups",
      darrow_area: "networks, allies, collective field, future vision, chosen communities",
      house_type: "succedent",
    },
  },
  house_12: {
    id: "house_12",
    layer: "house",
    label: "House 12",
    meaning:
      "the field where the person processes what cannot be brought into direct light — the private interior, the symbolic life, the patterns that operate below the stated surface",
    strength:
      "deep restoration capacity, symbolic attunement, the ability to work with what is not yet fully conscious",
    shadow:
      "self-undoing when the hidden patterns are not examined, isolation, avoidance, patterns that run without acknowledgment",
    practical:
      "make the invisible conscious before it runs the system; the 12th is most alive when it is acknowledged rather than managed",
    safe_report_use: [
      "shadow_and_friction",
      "body_and_vitality — as vitality / restoration texture",
    ],
    forbidden_claims: [
      '"12th house means hidden enemies"',
      '"12th house indicates imprisonment/illness"',
      '"12th house means you are secretly X"',
    ],
    requires_birth_time: true,
    meta: {
      traditional_name: "House of the Unconscious / Hidden Enemies",
      darrow_area:
        "retreat, hidden life, endings, unconscious patterns, symbolic sensitivity, the invisible operating system",
      house_type: "cadent",
    },
  },
};
