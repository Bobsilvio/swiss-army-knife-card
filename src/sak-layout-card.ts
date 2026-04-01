/**
 * sak-layout-card.ts
 *
 * A lightweight wrapper card (custom:sak-layout) that replaces vertical-stack
 * when you want to define SAK user templates inline in the card YAML.
 *
 * Usage in Lovelace:
 *
 *   type: custom:sak-layout
 *   cards:
 *     - type: custom:swiss-army-knife-card
 *       layout:
 *         template:
 *           name: my_template
 *       ...
 *   my_template:
 *     template:
 *       type: layout
 *     layout:
 *       ...
 *
 * Any top-level key that is not 'type', 'cards', or 'title' is treated as a
 * SAK user template definition and is injected into window.__sakUserTemplates
 * so that swiss-army-knife-card instances can find it.
 */

import { LitElement, html, css, PropertyValues } from 'lit';

const RESERVED_KEYS = new Set(['type', 'cards', 'title', 'direction', 'view_layout', 'card_mod']);

interface HassCard extends HTMLElement {
  hass?: any;
  setConfig?(config: any): void;
}

declare global {
  interface Window {
    __sakUserTemplates?: { templates: Record<string, any> };
  }
}

class SakLayoutCard extends LitElement {
  static properties = {
    hass: { attribute: false },
  };

  hass: any;

  private _config: any;
  private _cards: HassCard[] = [];

  setConfig(config: any) {
    // Extract SAK template definitions: any non-reserved key
    const templates: Record<string, any> = {};
    for (const [key, value] of Object.entries(config)) {
      if (!RESERVED_KEYS.has(key) && value && typeof value === 'object') {
        templates[key] = value;
      }
    }

    if (Object.keys(templates).length > 0) {
      if (!window.__sakUserTemplates) {
        window.__sakUserTemplates = { templates: {} };
      }
      Object.assign(window.__sakUserTemplates.templates, templates);
    }

    this._config = config;
    this._buildCards();
  }

  private _buildCards() {
    this._cards = (this._config?.cards ?? []).map((cardConfig: any) => {
      const tag = (cardConfig.type as string).startsWith('custom:')
        ? (cardConfig.type as string).slice('custom:'.length)
        : `hui-${cardConfig.type}-card`;

      const el = document.createElement(tag) as HassCard;
      try {
        if (typeof el.setConfig === 'function') el.setConfig(cardConfig);
      } catch (e) {
        console.error(`[sak-layout] setConfig failed for "${cardConfig.type}":`, e);
      }
      if (this.hass) el.hass = this.hass;
      return el;
    });
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('hass') && this.hass) {
      for (const card of this._cards) {
        card.hass = this.hass;
      }
    }
  }

  render() {
    const dir = this._config?.direction === 'horizontal' ? 'row' : 'column';
    return html`<div class="sak-layout-stack" style="flex-direction:${dir}">${this._cards}</div>`;
  }

  static styles = css`
    .sak-layout-stack {
      display: flex;
      gap: 8px;
    }
  `;

  // Required by Lovelace for card sizing
  getCardSize() {
    return this._cards.reduce((sum, card: any) => {
      return sum + (typeof card.getCardSize === 'function' ? card.getCardSize() : 1);
    }, 0) || 1;
  }
}

customElements.define('sak-layout', SakLayoutCard);
