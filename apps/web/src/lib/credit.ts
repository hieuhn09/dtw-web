/**
 * Media credits reach us in three shapes: bare ("AFP"), carrying a generic
 * label an editor typed by hand ("Photo: Nguyen Du", "Credit: Courtesy of Linh
 * Nga", "Photo by AFP", "Ảnh: …"), or carrying a label that means something
 * ("Render: Hyatt"). The page prints exactly ONE label and, network-wide, that
 * label is "Credit" — decided 24/09/2026 after this site printed "Credit:
 * Photo: Nguyen Du". So strip every generic label the editor typed (repeatedly,
 * so a value copied off a page that already doubled up comes out clean), then
 * add ours. A meaningful label is kept INSTEAD of ours, never alongside it.
 */
const GENERIC_LABEL =
  /^(?:(?:(?:photo|photograph|image|picture)s?\s*(?:credits?)?|credits?|ảnh|nguồn\s*(?:ảnh)?|foto|kredit\s*(?:foto)?|sumber\s*(?:foto)?)?\s*(?::|by\b)\s*|(?:photo|photograph|image|picture)s?\s+(?=courtesy\b))+/iu;

/** The editor's own meaningful label ("Render:") — not a URL scheme. */
const OWN_LABEL = /^\p{L}+\s*:(?!\/\/)/u;

export function stripCreditLabel(credit: string): string {
  return credit.normalize("NFC").replace(GENERIC_LABEL, "").trim();
}

/** Bare credits get the (localized) "Credit" label; self-labelled ones keep theirs. */
export function creditLabel(credit: string, label = "Credit"): string {
  const bare = stripCreditLabel(credit);
  if (!bare) return "";
  return OWN_LABEL.test(bare) ? bare : `${label}: ${bare}`;
}
