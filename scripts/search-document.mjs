// What AI Search indexes for a section of the docs: here, with no imports, so
// that scripts/search-sync.mjs runs in CI's deploy job, which installs nothing.

/** The document AI Search indexes for a section: its headings, from its page's, then its text. */
export function document(section) {
  const heading = [...new Set([section.page, ...section.trail, section.title])].join(" › ");
  return `# ${heading}\n\n${section.text}\n`;
}
