// B5.0 diagnostic artifact generator.
// Run standalone: npx vitest run src/lib/pdf/generate-v4-artifact.test.ts
// Output: outputs/pdf-v4.1-core-diagnostic.html
//
// Writes a complete v4.1 CORE HTML document using the canonical gold-sample
// fixture (the internal Dmitry sample from docs/DARROW_CORE_SAMPLE_REPORT_v4_1.md).
// All 17 generated CORE sections are aligned to ONE coherent chart frame
// (Cancer Sun/Moon/Mercury/rising · Gui Water Day Master · Bundle shape).
// This is internal diagnostic sample data — not production, not AI-generated.
// Open in browser for visual QA. For PDF: node scripts/generate-v4-pdf.mjs
// NOT run as part of the standard test suite (skipped in CI).

import { writeFileSync, mkdirSync } from "node:fs";
import { describe, it } from "vitest";
import { renderCoreV4HtmlSafe } from "./template";

const FIXTURE_CORE_V4 = {
  schema_version: "core_v4" as const,
  cover_tagline:
    "Your personal architecture — how you read pressure, make decisions, restore energy, and recognize your own signal. The baseline for everything that follows.",

  orientation: {
    opening_line: "You are not built for surface-level noise.",
    prose:
      'You do not need to fill a room to be felt in it. What you do instead is notice — shifts in atmosphere, small tensions, the things people are not quite saying. You register what others walk straight past. In a lot of environments, that gets misread as distance, or hesitation, when it is actually precision.\n\nThis document exists to correct that misreading. The way you function is not accidental, and it is not a problem to be solved. It is a specific design, built for depth and discernment rather than for exposure.\n\nWhat follows is not a prediction, and it is not advice. It is a clear description of how you are built — why certain situations drain you, why selectivity matters to you more than availability, why the standard approaches other people thrive on have never quite fit. None of this tells you what to do. It clarifies how you already work, so that trusting yourself stops being an effort and becomes the obvious thing.\n\nRead it for recognition, not instruction. If a passage feels familiar — if you catch yourself thinking "yes, that is exactly it" — that recognition is the point. That is the document working.',
  },

  core_architecture: {
    opening_line:
      "Most people carry a quiet argument inside them — head, heart and body each saying something different. You are mostly spared it: when something is right for you, all of you agrees; when it is not, all of you knows.",
    prose:
      "You are in a meeting. The numbers add up. The argument is clean and everyone is nodding. But you already feel it — a small wrongness in the room, a gap between what is being said and what is actually going on. You cannot point to it yet. The feeling comes first. The explanation, if it ever comes, arrives much later.\n\nThis is not a sixth sense, and it is not anxiety. It is simply how you take the world in. Where some people think their way to a conclusion, you feel your way there in the first few seconds, and the rest is just catching up. By the time you have formed a sentence about a person, you have already decided whether you trust them.\n\nAstrology names this with three placements stacked in the same sign — Sun, Moon, and rising all in Cancer. You do not need those words to recognize the result. You are the same person in private and in public. You cannot perform a version of yourself you do not feel. When you try, it shows on your face before you have said a word.\n\nA second symbolic system, read in a completely different way, points at the same thing. Your Day Master in Chinese astrology is Gui Water — the deepest, most interior form of the Water element — and it sits at its peak strength. Two separate systems, one conclusion: a nature built for depth, for reading what is beneath the surface, for processing the world slowly and thoroughly rather than quickly and on the surface.\n\nThere is a cost, and it is worth saying plainly. You do not have thick skin. A tense or dishonest room does not just annoy you — it gets in the way of your thinking. You are at your sharpest in honest company and your most scattered in false company. The room you are standing in shapes what you can reach inside yourself.\n\nThis is why the environment you choose is not a small decision for you — it is one of the most important ones you make.",
    protocols: [
      {
        title: "Read the Room First",
        body: "Before you prepare for anything that matters, take a moment with the space and the people in it. Does this feel honest? When the answer is clearly no, treat that as real information, not a mood to ignore. Strategy has limits when the environment is dishonest — which means choosing the right rooms is one of your quiet strengths, not a luxury.",
      },
    ],
    proof_tags: [
      "Sun conjunct ASC 0°43'",
      "Moon conjunct ASC 7°13'",
      "Gui Water DM Peak",
      "Water Dominant 59%",
      "Cancer Stellium",
    ],
  },

  operating_mode: {
    opening_line: "You work like a laser, not a floodlight.",
    prose:
      'A deadline lands. Three things break at once. Most people start moving in several directions, spreading their energy thin across all of it. You do something different — you go still for a moment, feel for the single point that actually matters, and put everything there. While others spend most of their effort on the scramble, you spend almost all of yours on the one thing that moves the situation.\n\nThis is not discipline you had to learn. Your chart is gathered tightly into one sector — what astrology calls a Bundle shape — and it makes you a specialist, not a generalist. You are built to go deep on one thing, not wide across many. When you are fully immersed in something that matters to you, you are formidable. When you are asked to spread yourself across a dozen unrelated tasks, you fade.\n\nYour fuel matters as much as your focus. With Water so dominant, what drives you is emotional resonance, not logic or obligation. If a project genuinely touches you, your energy is almost limitless. If it does not — if it is "important" but cold — no amount of willpower fills the tank for long. This is not a flaw in your motivation. It is the kind of engine you have.\n\nThe blind spot is the flip side of the gift. Because your energy concentrates so tightly, the dry, scattered, administrative side of life sits in shadow. Trying to be your own meticulous operations manager drains you fast. That work is real, but it is not yours to carry by force.',
    protocols: [
      {
        title: "Protect the Single Focus",
        body: "Structure your work around immersion, not multitasking. One deep thing at a time, chosen because it actually pulls you, not because it merely should. Where you can, hand off the dry and scattered tasks — they cost you far more energy than they cost someone built for them.",
      },
    ],
    proof_tags: ["Bundle Shape", "Water Dominant 59%", "Cancer Stellium", "Cardinal Mode"],
  },

  battery: {
    opening_line:
      "You do not recharge the way most people are told to. Rest alone does not quite do it for you.",
    prose:
      "By evening, you may not be tired from the work itself. You are tired from everything that came with it — the tone of a conversation, a tension nobody named, an unfinished look someone gave you, the emotional weather of the whole room. You carry it home without meaning to. You absorbed it all day, and most of it never got filtered at the door.\n\nThis is just how you are built, and it is not a problem to fix. Your Moon sits in Cancer, right beside your Sun, which means what you need in order to feel safe and who you are at your core are the same thing. But anything this finely tuned needs proper maintenance. When you skip it, the input piles up quietly — and then everything starts to feel louder and heavier than it should.\n\nThree things reliably clear what ordinary rest does not. The first is water: a long shower, a swim, the sea, even standing out in the rain seems to wash off whatever you picked up from other people, and the harder the day, the more it matters. The second is real silence — no screens, no talking — because you never quite switch off between conversations, so genuine quiet is how you find your way back to neutral; twenty honest minutes can do more than a whole evening of half-distraction. The third is a home that holds you: when your space is calm and in order you settle easily, and when it is chaotic there is a low background hum of stress no matter how well you think you are handling it.",
    protocols: [
      {
        title: "Recharge on Purpose",
        body: "Treat water, real silence, and an ordered home as maintenance, not luxury. After a heavy day, reach for one deliberately rather than pushing straight into the next thing — these reset what rest alone leaves behind.",
      },
    ],
    warning_signals: [
      "When little things start landing too hard — when you are sharp over something minor, or carrying a heaviness you cannot trace to anything — that is usually not your mood. It is your battery asking for a reset. Pushing through with willpower rarely helps; stepping back almost always does.",
    ],
    proof_tags: [
      "Moon conjunct ASC 7°13' Cancer",
      "Sun conjunct Moon Cancer",
      "Water Dominant 59%",
      "Bundle Shape",
    ],
  },

  social_interface: {
    opening_line: "People meet a warm, calm version of you long before they meet the rest.",
    prose:
      "You walk into a new room. The air shifts slightly. You stay quiet, but you have already read it — who is open, who is guarded, where the unspoken pressure sits. None of this is deliberate. It happens before you have decided to do anything.\n\nWhat people see is the soft exterior: approachable, easy, a good listener. What they do not see is the quiet checklist running behind it — is it safe to relax here, is this person real, can I lower my guard. Your Cancer rising broadcasts warmth; behind it stands a careful gate that only opens once the check clears. This is why people tend to confide in you quickly. They feel the safety and the absence of threat, and they open up — while you stay, gently, an unknown.\n\nThe cost is that your warmth is expensive to produce, and it is easy to spend it on people who have not earned the access. Your openness reads as an invitation, and not everyone who accepts it deserves the room you give them.",
    protocols: [
      {
        title: "Spend Warmth Deliberately",
        body: "Your friendliness is genuine, but it is not unlimited, and it is not an open-door policy. Let people earn the deeper access rather than receiving it by default. Keeping a little distance early is not coldness — it is how you make sure the warmth lands where it belongs.",
      },
    ],
    proof_tags: ["Cancer ASC 2°13'", "Moon 1H ruler", "Water Dominant 59%", "Cardinal Mode"],
  },

  numerology_code: {
    opening_line:
      "There is a quiet tension running through your name, and it explains a great deal.",
    prose:
      "Your Expression number is 8 — the builder, the one who holds structure and resources. This is your outward purpose: you are here to organize, to carry weight, to hold things together that would otherwise fall apart. You are not built to stay small or to play a minor role. When you have something substantial to hold, you are in your element. When you do not, that same capacity turns inward and starts to wear on you.\n\nYour Soul Urge number is 7 — the seeker, the one who needs silence and meaning. This is what actually fuels you underneath. You need solitude the way other people need company. Time alone is not isolation for you; it is how you find your way back to clarity. Without it, everything slowly loses its edge.\n\nThese two pull in opposite directions, and that is the heart of it. Your outward purpose pushes you into the world of weight and responsibility. Your inner self wants to step back into quiet and depth. The resolution is not to pick one — it is to run them together. You build something substantial in the world, powered by depth that most people around you cannot see. The quiet study feeds the visible work.\n\nYour Personality number is 1 — what people read in the first few seconds. You come across as someone who decides, someone standing on their own. It earns respect, and it creates a little distance. People expect initiative from you, even in moments when you privately are not sure.\n\nAnd underneath all of it, Life Path 3 — the integrator, the one who makes the complicated simple. This is the natural channel for everything above: you take depth and weight and translate it into something clear and usable for others.\n\nRight now you are at a turning point in the yearly cycle. The first part of the year runs as a 4 — foundation, discipline, laying the slow groundwork that does not feel exciting but holds everything up. After mid-year it shifts to a 5 — movement, openness, room to expand. The two halves want different things from you, and trying to rush the first or resist the second is where the friction comes from.",
    protocols: [
      {
        title: "Run the Numbers as Modes, Not Labels",
        body: "Use the 8 for work and decisions that need structure and authority. Step into the 7 when you need to recover — close the door, go quiet, let depth refill. Lean on the 3 when tension needs releasing through clarity or lightness. These are not who you are in some fixed way. They are gears you can shift between, on purpose.",
      },
    ],
    proof_tags: [
      "Expression 8",
      "Soul Urge 7",
      "Personality 1",
      "Life Path 3",
      "Personal Year 4→5",
    ],
  },

  cognitive_style: {
    opening_line: "Your thinking does not run on dry facts. It runs on meaning.",
    prose:
      "You are facing a real decision. You sit down to weigh it the proper way — list the pros, list the cons, reason it out. And you get stuck. The list grows in both directions and the clarity never arrives. Then, almost by accident, you ask yourself a different question: is there life in this, does it feel warm or cold? And the answer comes instantly, with none of the noise.\n\nThis is not indecisiveness. It is that information only truly registers for you when it has emotional context or a human story attached. Stripped-down, impersonal data slides off — your mind quietly filters it out as background noise. Your Mercury sits in Cancer, which means your thinking and your feeling are not separate departments. You feel your way to understanding, and then your intellect catches up and puts it into words.\n\nThe trouble starts when you try to override this — when you decide to be the cold, purely logical analyst because that seems more rigorous. In that mode you actually get slower and less sure, because you have switched off the very instrument that does your best reading.",
    protocols: [
      {
        title: "Feel First, Verify Second",
        body: "Let the read arrive before the analysis. Take the body-level yes or no first — it is fast and usually right — and then bring your intelligence in to test it, shape it, and put it into words. That is the correct order for how you are built. Reversing it is what produces the paralysis.",
      },
    ],
    proof_tags: ["Mercury Cancer 2H", "Intuitive cognition", "Water Dominant 59%"],
  },

  drive_and_rhythm: {
    opening_line: "Your drive does not look like other people's drive.",
    prose:
      "The world keeps telling you to move faster, be more visible, compete out loud. Some part of you tries to comply, and it never quite works. You are not slow and you are not lazy — but you are not built for the sprint, and forcing the sprint just burns you without getting you there.\n\nWhat you actually have is closer to a heavy engine than a fast one. You are not a sports car built for short bursts off the line. You are a powerful diesel built for distance — slow to start, hard to get rolling, and then nearly impossible to stop. Your Mars sits in Taurus, in the most hidden part of the chart, which is why your best work tends to happen quietly, out of sight, before anyone sees the result. Expose a raw idea too early and the energy leaks out of it. Let it build in private until it is solid, and it carries.\n\nThe advantage is real, and most people miss it about you. While faster competitors flame out on the first lap, you are still going on the tenth. Endurance is your edge. Your wins come from showing up steadily over a long arc, not from a dramatic burst that impresses for a week.",
    protocols: [
      {
        title: "Do Not Enter Open Races",
        body: "Stop measuring yourself against people built for speed — it is the wrong contest. Let things gestate privately until they are ready, then move with your full weight. Your victory is in the long game, where stamina beats flash.",
      },
    ],
    proof_tags: ["Mars Taurus 12H", "Fixed Earth", "Hidden drive", "Bundle Shape"],
  },

  professional_archetype: {
    opening_line: "You are the architect of the system, not the face of it.",
    prose:
      "You are offered a role that looks perfect on paper. Status, money, a title people respect. And something in you says no before you have weighed a single point of it. Not because the offer is bad, but because you can already feel what it would cost — a place with no roots, no depth, only cold structure and visibility you did not ask for.\n\nYour relationship to work rests on a particular tension. With Saturn in Virgo in the foundation of your chart, you approach work the way someone builds a house: the foundation matters more than the facade, the thing has to be practical and in its right place, and you do your best work from a protected base rather than out in the open. You do not like working in the wind. But your career direction — your Midheaven in Aquarius, sitting at the very last degree of the sign — pulls toward something else entirely: reform, innovation, the future of how things are done. You want to improve the structure, not climb its ladder.\n\nThat gives you a recognizable shape. You are the Gray Cardinal — the one who builds and runs the structure from a protected position, while staying out of the spotlight. You are not built to be the frontman, and trying to force yourself into that role drains you. You are built to be the one the frontman depends on.\n\nThere is a real friction here, and it is worth naming. Your drive wants to act quietly and protect what you have built; your career direction wants openness and change. That is the tension between caution and reform, and it can leave you pressing the accelerator and the brake at the same time. The way through is not to resolve it but to position yourself where both can be true: building the future from the background.\n\nThe last-degree placement on your career point adds one more note. You tend to be the one who closes old chapters and opens new ones — not the one who manages the comfortable middle. Fitting yourself into the middle of a hierarchy will always feel slightly wrong.",
    protocols: [
      {
        title: "Build From the Background",
        body: "Look for the role where you run things from a protected position rather than performing at the front of it. Filter hard for environments that already value order — in a place that does not, you will burn your energy building structure that should have been there before you arrived.",
      },
    ],
    proof_tags: ["Saturn Virgo 4H", "MC Aquarius 29°", "Mars sq MC 0°02' exact", "Bundle Shape"],
  },

  money_and_value: {
    opening_line: "For you, money is first a wall, and only second a tool.",
    prose:
      "A real financial decision lands in front of you. You notice the pull is not toward the upside — it is toward the floor. Before you can think about what you might gain, you are already checking what you might lose, and how exposed it would leave you.\n\nThis is the heart of your money pattern. You are fundamentally conservative with resources, and you need an untouchable buffer to feel safe. When reserves drop below a certain line, clear thinking gets harder — a quiet anxiety takes over the decision-making. That is the security side, and it runs deep. But there is a second force: with Pluto in the part of your chart that governs creativity and personal projects, your strongest value pattern is more likely to activate through passion, calculated risk, and work that genuinely carries your stamp — rather than through a steady salary alone. A purely mechanical income will keep you safe but rarely feels like it is building anything that is yours.\n\nThe trap is sitting between the two: protecting the floor so carefully that you never fund the thing that could actually grow. Sacrificing what you genuinely want for the illusion of total safety is the specific way money stays smaller than it could be for you.",
    protocols: [
      {
        title: "Fund the Floor, Then Back the Real Want",
        body: "Build the safety buffer first — you genuinely need it, and you will not function well without it. But once it is in place, treat it as done, and put real resources behind the work that actually pulls you. Money decisions tend to become cleaner when they back your authentic want rather than your dutiful should.",
      },
    ],
    proof_tags: ["2H Mercury", "Pluto 5H", "Security/creation axis", "Cancer Stellium"],
  },

  relationship_baseline: {
    opening_line: "Closeness, for you, is mostly private.",
    prose:
      "You are not drawn to performed romance or feelings put on display. The relationships that matter to you happen quietly — late conversations no one else hears, comfortable silences, the particular intimacy of being able to think out loud with someone who keeps up.\n\nYour Venus sits in Gemini, in the most private part of your chart — which is why your real tenderness stays hidden, almost held in reserve. You need a partner you can talk to endlessly and be silent with completely. The mind is where attraction starts for you; if the conversation goes flat, the rest fades quickly behind it. This is your Secret Garden, and very few people are given the key.\n\nThere is a gap worth knowing about. To a partner, you can come across as a little cool, a little mental, slightly held back — when what is actually happening is protection, not distance. You guard the entrance to the garden carefully, and from the outside that care can read as detachment.",
    protocols: [
      {
        title: "Lead With the Mind, Then Let the Guard Down",
        body: "Choose people you genuinely want to talk to — for you, mental connection is the foundation everything else stands on. And when you notice yourself staying measured with someone who has earned more, treat that as the cue to let a little more of the garden show, on purpose.",
      },
    ],
    proof_tags: ["Venus Gemini 12H", "Venus opp Neptune", "Air/Water mix", "12H privacy"],
  },

  vitality_baseline: {
    opening_line: "Your body is a sensitive instrument, not a machine you can run on anything.",
    prose:
      "You push through a demanding stretch and seem to cope fine. Then it catches up all at once — a sudden drop, restless sleep, a small thing in the body that will not settle. It rarely lines up neatly with the stress that caused it, which is part of what makes it confusing.\n\nThe sensitivity sits in how your nervous system is wired — the outer planets fall in the part of your chart that governs daily health, which tends to mean an uneven rhythm: bursts of energy followed by sharper drops, and a body that absorbs the atmosphere around it more than most. Your physical tempo, set by Mars in Taurus, prefers steady and grounded over fast and frantic. Two things reliably help: a stable daily rhythm, because disorder in your routine shows up directly in how you feel; and real physical grounding — movement, weight, time outdoors — to discharge what builds up.",
    warning_signals: [
      "The body speaks before the mind admits it. You tend to notice the physical sign — the disrupted sleep, the tension that will not release, the unexplained fatigue — before you consciously register that you are overloaded. When the body flags it, that is the early warning, not the breakdown.",
    ],
    protocols: [
      {
        title: "Protect the Rhythm First",
        body: "When something feels off, start with the basics before looking for a complicated cause — sleep, daily structure, time outdoors, movement that lets the tension out. For you, steadiness is not boring. It is maintenance.",
      },
    ],
    disclaimer:
      "This is interpretive orientation, not medical advice. Consult a qualified healthcare professional for any health concerns.",
    proof_tags: ["Uranus/Neptune 6H", "Mars Taurus tempo", "Saturn Virgo routine"],
  },

  environment_and_resonance: {
    opening_line: "Your environment is not a backdrop. It is part of how you function.",
    prose:
      "With Water so dominant, you take in the feeling of a place through your skin. The standard idea of rest — crowds, busy itineraries, loud hotels — does not recharge you. It quietly drains you. You need specific conditions to actually reset, not just a change of scenery.\n\nTwo modes work for you. The first is the Water Sanctuary: somewhere near water and genuinely quiet, where the noise you have been carrying can finally drain off. The second is Urban Incognito — disappearing into a large, intelligent city while staying invisible in it, feeling the pulse of life from the edge rather than the center. Both share the same ingredient: you are present, but unobserved.\n\nThe thread through all of it is privacy. A modest place where you can close the door and be completely alone does more for you than a spectacular one full of people and exposure.",
    protocols: [
      {
        title: "Choose Privacy Over Luxury",
        body: "When you travel or set up a space, prioritize the ability to close the door and reach real silence over how impressive the place looks. If you cannot get to genuine quiet, you do not actually rest — you just change location.",
      },
    ],
    proof_tags: ["Water Dominant 59%", "12H seclusion", "Venus Gemini comfort"],
  },

  shadow_and_friction: {
    opening_line:
      "The friction in your life rarely comes from what other people do to you. It comes from two reflexes that move faster than you do.",
    prose:
      'You meet someone, or something — a person, a project, a possibility. There is a flash: depth, potential, something rare. You lean in fully. Then, slowly, reality drifts away from the picture you had already painted. You feel the gap before you can explain it. And what follows is not anger — it is a quiet pulling-back, and a faint sense that you got it wrong somehow.\n\nWhat is actually happening is that you fill in people early. You are drawn to depth and to what is hidden in someone, and sometimes you give them those qualities before they have shown them to you. You end up offering more than the situation has earned yet. So the disappointment lands as if it were your misjudgment, when really you just believed in the picture too soon. The instinct toward depth is one of your best qualities. The risk is finishing the portrait before the person has finished painting it.\n\nThere is a second pattern, and you will know it by how familiar it feels. The people change, the situations change, but the shape repeats. Something gets uncertain — a shift in someone\'s tone, a signal you cannot read, a moment that asks you to trust. And instead of opening up to find out more, you go quiet. On the outside you stay calm, polite, careful. On the inside, a door closes. The people closest to you feel the distance and step toward you, which only makes the door close harder.\n\nThis is why trust can feel like a test before it feels like relief. When something genuinely matters to you, your guard goes up first and your warmth follows later — if it follows at all. It is not paranoia, and it is not coldness. It is an old protective habit that cannot quite tell the difference between "this is unclear" and "this is dangerous," so it treats them the same.',
    protocols: [
      {
        title: "Catch the Familiar Feeling",
        body: "The next time you feel that particular texture — the careful distance, the closed-door quiet, the sense of here we go again — pause before you do anything. Ask yourself one plain question: what am I trying to protect right now? The honest answer is usually smaller and simpler than the reflex makes it seem. Just naming it, even silently, tends to loosen the grip before the whole pattern plays out.",
      },
    ],
    warning_signals: [
      "Becoming polite with someone you used to be warm with. When you notice yourself turning measured and correct with a person you were once open with, that careful politeness is the door already closing — not after the disagreement, during it. It is the most reliable early sign you will get.",
    ],
    proof_tags: ["Venus opp Neptune", "Moon sq Pluto 6°59'", "Mars Taurus 12H", "Cancer Stellium"],
  },

  before_after: {
    opening_line: "Nothing here changes your life. It changes how legible your life is to you.",
    before_after_pairs: [
      {
        before:
          "The depth of how you process feels like slowness — a hesitation other people do not seem to share, a gap between taking something in and acting on it that you have quietly held against yourself.",
        after:
          "The depth is the instrument. The gap is it working — it takes time because it is reading more layers than a faster approach ever would. It was never a delay. It was thoroughness you had no name for.",
      },
      {
        before:
          "Your need to withdraw, to protect your space, to keep so much private has felt at times like a flaw — something that makes you harder to be close to than you want to be.",
        after:
          "It is maintenance, not a defect. The privacy is how a sensitive system stays intact. Protecting it is not you failing at openness. It is you running yourself correctly.",
      },
    ],
  },

  executive_summary: {
    opening_line: "The whole architecture, in one view.",
    executive_summary_blocks: [
      {
        label: "YOUR CORE ADVANTAGE" as const,
        content:
          "You are a stabilizer of complexity. You sense hidden tension early and build steady, trustworthy structures where others get overwhelmed. Your strength is depth, coherence, and a quiet authority that does not need to announce itself.",
      },
      {
        label: "YOUR PRIMARY SENSITIVITY" as const,
        content:
          "What drains you is environment, not difficulty. Aggressive pace, visual noise, and dishonest rooms overload you faster than any hard problem. This is not a weakness to fix — it is a requirement to respect.",
      },
      {
        label: "YOUR DECISION FORMULA" as const,
        content:
          "Your body is often your earliest signal. Clarity usually arrives after the feeling speaks, not before. If the signal does not feel safe, logic may struggle to override it. Pause, read the signal, then verify.",
      },
      {
        label: "THE CORE CONCLUSION" as const,
        content:
          "You are not built to win sprints. You are built to create foundations that last — and your value lives in depth, reliability, and the long arc.",
      },
      {
        label: "CURRENT CYCLE" as const,
        content:
          "You are mid-shift in your yearly rhythm — moving from a foundation phase into a more open, expansive one around mid-year. The wider climate is asking your structures to prove they are real: the steady, well-built parts of your life will hold and reward you now, and the parts held together loosely will ask to be reinforced. This is a year that favors building on solid ground and then allowing room to move — in that order.",
      },
      {
        label: "THE NEXT LEVEL" as const,
        content:
          "This document has mapped how you are built — your baseline, your operating conditions, the patterns you have always sensed but never quite named. That foundation is complete on its own. If a particular pressure is loudest for you right now, there is a focused chapter that goes deeper there. But there is nothing you need to buy to make this whole. You already have the base.",
      },
    ],
  },

  next_step: {
    prose:
      "Dmitry, this document is not meant to be memorized. It is meant to be returned to — on the days when the noise rises and your own signal gets hard to hear.\n\nIf everything else fades, these four hold:",
    closing_pillars: [
      {
        title: "TRUST THE SIGNAL" as const,
        prose:
          "Your read of a room is fast and usually right. If the body contracts, pause before proceeding. If warmth remains, the direction may be worth exploring. That instinct is not mysticism — it is accelerated pattern recognition, and it deserves to be taken seriously.",
      },
      {
        title: "BUILD THE BASE" as const,
        prose:
          "You are not built for improvised chaos. Your strength unfolds slowly, through foundations — home, routine, a financial buffer, rhythm. These are not limits. They are your launch platform.",
      },
      {
        title: "RESPECT THE CYCLE" as const,
        prose:
          "You move between withdrawal and expansion, depth and output. Confusing the two burns you out. Honoring them keeps you steady for the long arc. Silence, for you, is preparation — not stagnation.",
      },
      {
        title: "HONOR THE SPACE" as const,
        prose:
          "Your environment regulates you faster than any technique. Calm, order, and quiet restore you without effort. Protecting your space is not indulgence — it is upkeep.",
      },
    ],
  },
};

// Personal Orientation System / identity-card payload (rendered as the Client
// Snapshot page). This is supplied metadata, NOT one of the 17 generated keys.
const FIXTURE_CLIENT_SNAPSHOT = {
  pattern_name: "Deep Water Architect",
  core_pattern:
    "Sun, Moon and rising stacked in Cancer, with a Gui Water Day Master at peak strength — a system built for depth, emotional precision, and reading what is beneath the surface before the mind has framed it. The interior is the instrument.",
  unique_signature:
    "You are the same person in private and in public; you cannot perform a self you do not feel. The depth that makes your read accurate is the same depth that makes a false or tense room genuinely hard to think in.",
  primary_strength:
    "Fast, accurate reading of people and atmospheres — you register the tension in a room long before it is named, and you build steady structure where others get overwhelmed.",
  pressure_point:
    "You absorb the emotional weather around you and carry it home unfiltered; without maintenance the input piles up and everything starts to feel louder and heavier than it should.",
  best_operating_rhythm:
    "Slow to start, hard to stop — a heavy engine, not a fast one. Depth and immersion on one thing at a time, with genuine recovery between cycles.",
  current_timing_theme:
    "Mid-shift in the yearly rhythm: a foundation phase moving into a more open, expansive one around mid-year. Build on solid ground first, then allow room to move.",
  practical_focus:
    "Protect the environment and the rhythm before optimizing strategy. Choose honest rooms, real silence, and a home that holds you — these are maintenance, not luxury.",
};

describe("B5.0 — v4.1 HTML artifact generation", () => {
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
