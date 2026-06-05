// DATA-AUDIT-1 — synthetic (non-customer) FreeAstroAPI availability test cases.
// DIAGNOSTIC ONLY. No real customer data. Stable fake names/dates/locations so
// the approved audit run is reproducible. Never used by production.

import type { NatalInput } from "@/lib/astro/types";

export type AuditModule = "CORE" | "LOVE" | "MONEY" | "BODY" | "YEAR" | "STYLE" | "PLACE";
export const AUDIT_MODULES: AuditModule[] = [
  "CORE",
  "LOVE",
  "MONEY",
  "BODY",
  "YEAR",
  "STYLE",
  "PLACE",
];

export interface AuditCase {
  id: "A" | "B" | "C" | "D" | "E";
  label: string;
  input: NatalInput;
  expect: string[];
}

// London baseline (Northern hemisphere).
const LON = { latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" };
// Sydney (Southern hemisphere) for edge coverage.
const SYD = { latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" };

export const AUDIT_CASES: AuditCase[] = [
  {
    id: "A",
    label: "exact birth time + full name + bazi_sex",
    input: {
      date_of_birth: "1990-03-21",
      birth_time: "14:30:00",
      birth_time_known: true,
      full_name_for_numerology: "Alex Sample Persona",
      first_name: "Alex",
      bazi_sex: "M",
      birth_city: "London",
      ...LON,
    },
    expect: [
      "natal houses/angles available (if API supports)",
      "name numerology available",
      "bazi available",
      "bazi_flow attempted",
      "transits/solar_return/moon_phase attempted",
    ],
  },
  {
    id: "B",
    label: "no birth time + full name + bazi_sex",
    input: {
      date_of_birth: "1990-03-21",
      birth_time: null,
      birth_time_known: false,
      full_name_for_numerology: "Alex Sample Persona",
      first_name: "Alex",
      bazi_sex: "M",
      birth_city: "London",
      ...LON,
    },
    expect: [
      "houses/angles absent/null",
      "no strong house/angle claims allowed",
      "bazi may be available; hour pillar confidence reduced / not used",
    ],
  },
  {
    id: "C",
    label: "exact birth time + NO full name + bazi_sex",
    input: {
      date_of_birth: "1990-03-21",
      birth_time: "14:30:00",
      birth_time_known: true,
      full_name_for_numerology: null,
      first_name: "Alex",
      bazi_sex: "F",
      birth_city: "London",
      ...LON,
    },
    expect: [
      "life_path / birth_day / personal_year present",
      "expression / soul_urge / personality unavailable",
    ],
  },
  {
    id: "D",
    label: "exact birth time + full name + MISSING bazi_sex",
    input: {
      date_of_birth: "1990-03-21",
      birth_time: "14:30:00",
      birth_time_known: true,
      full_name_for_numerology: "Alex Sample Persona",
      first_name: "Alex",
      bazi_sex: null,
      birth_city: "London",
      ...LON,
    },
    expect: [
      "bazi unavailable (missing_bazi_sex)",
      "bazi_flow unavailable",
      "no bazi claims allowed",
    ],
  },
  {
    id: "E",
    label: "edge: southern hemisphere + exact time + full name + bazi_sex",
    input: {
      date_of_birth: "1985-11-05",
      birth_time: "07:15:00",
      birth_time_known: true,
      full_name_for_numerology: "Sam Edgecase Tester",
      first_name: "Sam",
      bazi_sex: "F",
      birth_city: "Sydney",
      ...SYD,
    },
    expect: [
      "timezone/geocoding/birth_time_source stable",
      "natal output stable",
      "solar/transit/moon endpoints behave consistently",
    ],
  },
];
