export type ValidatedOvaraData = { ok: true; entries: [string, unknown][] } | { ok: false; error: string };
export function validateOvaraData(parsed: unknown): ValidatedOvaraData;
