#!/usr/bin/env python3
"""
generate-builtin-templates.py

Reads sak-css-definitions.yml and sak-svg-definitions.yml from dist/ and
generates src/sak-builtin-templates.ts with the content embedded as TypeScript
constants. This makes the card fully standalone in Home Assistant without
requiring external template YAML files.

Run: python3 scripts/generate-builtin-templates.py
  or: npm run gen-templates
"""

import yaml
import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_FILE = os.path.join(ROOT, 'dist', 'sak-css-definitions.yml')
SVG_FILE = os.path.join(ROOT, 'dist', 'sak-svg-definitions.yml')
OUT_FILE = os.path.join(ROOT, 'src', 'sak-builtin-templates.ts')


def load_definitions(path):
    """Parse a SAK definitions YAML file, returning a list of content strings."""
    with open(path, encoding='utf-8') as f:
        raw = f.read()
    # The top-level key (e.g. #sak_css_definitions:) is commented out.
    # Remove those lines so yaml.safe_load sees a plain list.
    cleaned = re.sub(r'^#[a-z_]+:\s*$', '', raw, flags=re.MULTILINE)
    data = yaml.safe_load(cleaned)
    if not isinstance(data, list):
        raise ValueError(f'Expected list in {path}, got {type(data)}')
    return [item['content'] for item in data
            if isinstance(item, dict) and 'content' in item]


def escape_ts_template_literal(s):
    """Escape a string for use inside a TypeScript template literal."""
    s = s.replace('\\', '\\\\')   # backslashes first
    s = s.replace('`', '\\`')     # backticks
    s = s.replace('${', '\\${')   # template expressions
    return s


css_blocks = load_definitions(CSS_FILE)
svg_blocks = load_definitions(SVG_FILE)

css_content = escape_ts_template_literal(''.join(css_blocks))
svg_content = escape_ts_template_literal(''.join(svg_blocks))

output = f"""\
// AUTO-GENERATED FILE — do not edit manually.
// Run: npm run gen-templates  (or: python3 scripts/generate-builtin-templates.py)
//
// Embeds sak-css-definitions.yml and sak-svg-definitions.yml so the card
// works without external template files in Home Assistant.
//
// License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by/4.0/
// Original author: Mars @ AmoebeLabs.com

/**
 * Built-in SAK system templates bundled with the card.
 * Mirrors the structure of `sak_sys_templates` in the Lovelace config.
 * Used automatically when sak_sys_templates is not defined in the HA config.
 */
export const SAK_BUILTIN_TEMPLATES = {{
  definitions: {{
    sak_css_definitions: [
      {{
        content: `{css_content}`,
      }},
    ],
    sak_svg_definitions: [
      {{
        content: `{svg_content}`,
      }},
    ],
  }},
  // Card/toolset templates remain user-defined (not bundled).
  templates: {{}} as Record<string, any>,
}};

export default SAK_BUILTIN_TEMPLATES;
"""

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    f.write(output)

print(f'✓ Generated {os.path.relpath(OUT_FILE, ROOT)}')
print(f'  CSS definitions: {len(css_blocks)} blocks, {len(css_content)} chars')
print(f'  SVG definitions: {len(svg_blocks)} blocks, {len(svg_content)} chars')
