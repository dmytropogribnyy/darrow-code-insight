// FreeAstroAPI returns abbreviated zodiac signs in many response fields.
// Normalize to canonical English names before persisting normalized_json.

const SIGN_MAP: Record<string, string> = {
  Tau: "Taurus",
  Cap: "Capricorn",
  Ari: "Aries",
  Sco: "Scorpio",
  Pis: "Pisces",
  Can: "Cancer",
  Aqu: "Aquarius",
  Lib: "Libra",
  Vir: "Virgo",
  Gem: "Gemini",
  Leo: "Leo",
  Sag: "Sagittarius",
};

export function normalizeSign(s?: string | null): string {
  if (!s) return "";
  return SIGN_MAP[s] ?? s;
}
