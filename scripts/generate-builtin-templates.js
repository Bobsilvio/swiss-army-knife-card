#!/usr/bin/env node
/**
 * generate-builtin-templates.js
 *
 * Reads sak-css-definitions.yml and sak-svg-definitions.yml from dist/
 * and generates src/sak-builtin-templates.ts with the template content
 * embedded as TypeScript constants. This allows the card to work without
 * any external template files in Home Assistant.
 *
 * Run: node scripts/generate-builtin-templates.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const CSS_FILE = path.join(ROOT, 'dist', 'sak-css-definitions.yml');
const SVG_FILE = path.join(ROOT, 'dist', 'sak-svg-definitions.yml');
const OUT_FILE = path.join(ROOT, 'src', 'sak-builtin-templates.ts');

function loadDefinitions(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // The YAML files have the top-level key commented out (e.g. #sak_css_definitions:)
  // so the actual YAML is a list at the root level.
  // Strip comment lines that look like commented-out keys before parsing.
  const cleaned = raw
    .split('\n')
    .map(line => (line.match(/^#[a-z_]+:/) ? '' : line))
    .join('\n');

  const parsed = yaml.load(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array in ${filePath}, got ${typeof parsed}`);
  }
  return parsed
    .filter(item => item && typeof item.content === 'string')
    .map(item => item.content);
}

function escapeTemplateLiteral(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

const cssContents = loadDefinitions(CSS_FILE);
const svgContents = loadDefinitions(SVG_FILE);

const cssJoined = escapeTemplateLiteral(cssContents.join('\n'));
const svgJoined = escapeTemplateLiteral(svgContents.join('\n'));

const output = `// AUTO-GENERATED FILE — do not edit manually.
// Run: node scripts/generate-builtin-templates.js
//
// Embeds sak-css-definitions.yml and sak-svg-definitions.yml so the card
// works without external template files in Home Assistant.
//
// License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by/4.0/
// Original author: Mars @ AmoebeLabs.com

/**
 * Built-in SAK system templates bundled with the card.
 * Mirrors the structure of \`sak_sys_templates\` in the Lovelace config.
 */
export const SAK_BUILTIN_TEMPLATES = {
  definitions: {
    sak_css_definitions: [
      {
        content: \`${cssJoined}\`,
      },
    ],
    sak_svg_definitions: [
      {
        content: \`${svgJoined}\`,
      },
    ],
  },
  // No toolset/card templates are bundled — those remain user-defined.
  templates: {} as Record<string, any>,
};

export default SAK_BUILTIN_TEMPLATES;
`;

fs.writeFileSync(OUT_FILE, output, 'utf8');
console.log(`✓ Generated ${path.relative(ROOT, OUT_FILE)}`);
console.log(`  CSS definitions: ${cssContents.length} blocks`);
console.log(`  SVG definitions: ${svgContents.length} blocks`);
