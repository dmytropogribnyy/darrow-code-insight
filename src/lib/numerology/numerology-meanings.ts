// Compact Darrow Code meaning labels for numerology values.
// Backend never generates long canned essays — Claude does the synthesis.
// Language: structure / mechanism / pressure / protocol / configuration / rhythm.
// Forbidden: destiny, fate, soul mission, vibration, lucky, healing, attraction.

export interface NumerologyMeaning {
  core: string;
  shadow: string;
  protocol_hint: string;
}

export const NUMEROLOGY_MEANINGS: Record<number, NumerologyMeaning> = {
  1: {
    core: "self-direction, initiative, identity pressure",
    shadow: "isolation, control, impatience",
    protocol_hint: "decide from direction, not reaction",
  },
  2: {
    core: "pairing, sensitivity, relational calibration",
    shadow: "dependence, conflict avoidance, self-erasure",
    protocol_hint: "name the need before the relationship absorbs it",
  },
  3: {
    core: "expression, signal, creative output",
    shadow: "scatter, performance, surface charm",
    protocol_hint: "finish the expression before starting the next",
  },
  4: {
    core: "structure, repetition, operational integrity",
    shadow: "rigidity, over-control, exhaustion through grind",
    protocol_hint: "build the system once, run it without re-deciding",
  },
  5: {
    core: "movement, change, adaptive intelligence",
    shadow: "restlessness, escape, commitment friction",
    protocol_hint: "anchor one constant before optimising for variety",
  },
  6: {
    core: "responsibility, care architecture, aesthetic order",
    shadow: "over-functioning for others, control through service",
    protocol_hint: "serve from chosen capacity, not from default duty",
  },
  7: {
    core: "analysis, depth, internal verification",
    shadow: "withdrawal, suspicion, paralysis through study",
    protocol_hint: "let evidence close the loop instead of more research",
  },
  8: {
    core: "value structure, pressure management, material responsibility",
    shadow: "control through achievement, tension around worth, over-identification with results",
    protocol_hint: "define value before emotion enters the decision",
  },
  9: {
    core: "completion, perspective, wide-lens responsibility",
    shadow: "martyrdom, unfinished endings, diffuse focus",
    protocol_hint: "close cycles cleanly before opening the next chapter",
  },
  11: {
    core: "heightened perception, symbolic sensitivity, signal amplification",
    shadow: "nervous overstimulation, idealisation, pressure to be exceptional",
    protocol_hint: "ground insight before acting on it",
  },
  22: {
    core: "large-scale building, structural vision, practical mastery",
    shadow: "over-responsibility, pressure, delayed action",
    protocol_hint: "turn scale into steps",
  },
  33: {
    core: "care, teaching, emotional responsibility, service through presence",
    shadow: "rescuer pattern, guilt, self-sacrifice",
    protocol_hint: "serve without becoming the container for everyone",
  },
};
