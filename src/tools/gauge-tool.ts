/** ***************************************************************************
  * GaugeTool class
  *
  * Summary.
  * Modern TypeScript-based gauge visualization with advanced features
  */

import BaseTool from '../base-tool.js';
import { svg } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import { PerformanceMonitor } from '../utils.js';

export default class GaugeTool extends BaseTool {

[key: string]: any;


  /**
   * Gauge configuration interface
   * @typedef {Object} GaugeConfig
   * @property {number} min - Minimum value
   * @property {number} max - Maximum value  
   * @property {number} startAngle - Starting angle in degrees
   * @property {number} endAngle - Ending angle in degrees
   * @property {number} strokeWidth - Width of gauge arc
   * @property {Object} colors - Color configuration
   */

  /**
   * Constructor
   * @param {Object} argToolset - Toolset instance
   * @param {GaugeConfig} argConfig - Gauge configuration
   * @param {Object} argPos - Position configuration
   */
  constructor(argToolset, argConfig, argPos) {
    /** @type {GaugeConfig} */
    const DEFAULT_GAUGE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 40,
      },
      scale: {
        min: 0,
        max: 100,
        step: 1,
      },
      gauge: {
        start_angle: -135,
        end_angle: 135,
        stroke_width: 8,
        direction: 'clockwise',
      },
      colors: {
        track: 'var(--primary-background-color)',
        value: 'var(--primary-color)',
        gradient: false,
        stops: [],
      },
      show: {
        value: true,
        label: false,
        uom: false,
        ticks: true,
        tick_labels: false,
      },
      styles: {
        gauge: {},
        track: {},
        value: {},
        ticks: {},
        labels: {},
        pointer: {},
      },
      animations: {
        enabled: true,
        duration: 1000,
        easing: 'ease-out',
      },
    };

    super(argToolset, { ...DEFAULT_GAUGE_CONFIG, ...argConfig }, argPos);

    // Gauge-specific properties
    this.svg.radius = this.calculateSvgDimension(this.config.position.radius);
    this.svg.startAngle = this.config.gauge.start_angle;
    this.svg.endAngle = this.config.gauge.end_angle;
    this.svg.strokeWidth = this.calculateSvgDimension(this.config.gauge.stroke_width);
    this.svg.direction = this.config.gauge.direction === 'counterclockwise' ? -1 : 1;

    // Calculate gauge geometry
    this._calculateGaugeGeometry();

    // Initialize state
    this._currentValue = this.scale.min;
    this._displayValue = this.scale.min;
    this._pointerAngle = this.svg.startAngle;

    // Performance optimization
    this._lastRenderTime = 0;
    this._renderCache = new Map();

    if (this.dev.debug) {
      console.log('GaugeTool constructor:', {
        config: this.config,
        geometry: this.gaugeGeometry,
        initial: {
          value: this._currentValue,
          angle: this._pointerAngle,
        }
      });
    }
  }

  /**
   * Calculate gauge geometry
   * @private
   */
  _calculateGaugeGeometry() {
    const { startAngle, endAngle } = this.svg;
    const angleRange = this.svg.direction * (endAngle - startAngle);
    
    this.gaugeGeometry = {
      startAngle,
      endAngle,
      angleRange,
      centerX: this.svg.cx,
      centerY: this.svg.cy,
      radius: this.svg.radius,
      innerRadius: this.svg.radius - this.svg.strokeWidth,
      angleStartRad: (startAngle - 90) * Math.PI / 180,
      angleEndRad: (endAngle - 90) * Math.PI / 180,
    };

    // Calculate tick positions
    this._calculateTicks();
  }

  /**
   * Calculate tick positions and labels
   * @private
   */
  _calculateTicks() {
    if (!this.config.show.ticks) {
      this.ticks = [];
      return;
    }

    const { min, max, step } = this.scale;
    const tickCount = Math.floor((max - min) / step) + 1;
    const angleRange = this.gaugeGeometry.angleRange;

    this.ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const value = min + (i * step);
      const normalizedValue = (value - min) / (max - min);
      const angle = this.gaugeGeometry.startAngle + (normalizedValue * angleRange);
      const angleRad = (angle - 90) * Math.PI / 180;

      // Calculate tick position
      const x1 = this.gaugeGeometry.centerX + Math.cos(angleRad) * (this.svg.radius - 5);
      const y1 = this.gaugeGeometry.centerY + Math.sin(angleRad) * (this.svg.radius - 5);
      const x2 = this.gaugeGeometry.centerX + Math.cos(angleRad) * this.svg.radius;
      const y2 = this.gaugeGeometry.centerY + Math.sin(angleRad) * this.svg.radius;

      this.ticks.push({
        value,
        angle,
        x1, y1, x2, y2,
        label: this.config.show.tick_labels ? this._formatTickLabel(value) : null
      });
    }
  }

  /**
   * Format tick label
   * @private
   */
  _formatTickLabel(value) {
    if (Math.floor(value) === value) {
      return value.toString();
    }
    return value.toFixed(1);
  }

  /**
   * Convert value to angle
   * @private
   */
  _valueToAngle(value) {
    const { min, max } = this.scale;
    const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return this.gaugeGeometry.startAngle + (normalizedValue * this.gaugeGeometry.angleRange);
  }

  /**
   * Convert angle to SVG path
   * @private
   */
  _angleToPath(startAngle, endAngle, radius, innerRadius = 0) {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = this.gaugeGeometry.centerX + Math.cos(startRad) * radius;
    const y1 = this.gaugeGeometry.centerY + Math.sin(startRad) * radius;
    const x2 = this.gaugeGeometry.centerX + Math.cos(endRad) * radius;
    const y2 = this.gaugeGeometry.centerY + Math.sin(endRad) * radius;
    
    if (innerRadius > 0) {
      const ix1 = this.gaugeGeometry.centerX + Math.cos(startRad) * innerRadius;
      const iy1 = this.gaugeGeometry.centerY + Math.sin(startRad) * innerRadius;
      const ix2 = this.gaugeGeometry.centerX + Math.cos(endRad) * innerRadius;
      const iy2 = this.gaugeGeometry.centerY + Math.sin(endRad) * innerRadius;
      
      const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
      
      return `
        M ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${ix2} ${iy2}
        L ${x2} ${y2}
        A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x1} ${y1}
        Z
      `;
    } else {
      const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
      return `
        M ${this.gaugeGeometry.centerX} ${this.gaugeGeometry.centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      `;
    }
  }

  /**
   * Get color for value
   * @private
   */
  _getValueColor(value) {
    const { colors } = this.config;
    
    if (!colors.gradient || !colors.stops || colors.stops.length === 0) {
      return colors.value || colors.track;
    }

    const { min, max } = this.scale;
    const normalizedValue = (value - min) / (max - min);
    
    // Find appropriate color stop
    let color = colors.stops[0].color;
    for (let i = 0; i < colors.stops.length - 1; i++) {
      const stop = colors.stops[i];
      const nextStop = colors.stops[i + 1];
      
      if (normalizedValue >= stop.value && normalizedValue <= nextStop.value) {
        // Interpolate between stops
        const range = nextStop.value - stop.value;
        const position = (normalizedValue - stop.value) / range;
        color = this._interpolateColor(stop.color, nextStop.color, position);
        break;
      }
    }
    
    return color;
  }

  /**
   * Interpolate between two colors
   * @private
   */
  _interpolateColor(color1, color2, position) {
    // Simple color interpolation (can be enhanced)
    return position > 0.5 ? color2 : color1;
  }

  /**
   * Update gauge value with animation
   * @private
   */
  _updateValue(newValue) {
    if (!this.config.animations.enabled) {
      this._displayValue = newValue;
      this._pointerAngle = this._valueToAngle(newValue);
      return;
    }

    const startTime = performance.now();
    const startValue = this._displayValue;
    const duration = this.config.animations.duration;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easedProgress = this._easeOutCubic(progress);
      
      this._displayValue = startValue + (newValue - startValue) * easedProgress;
      this._pointerAngle = this._valueToAngle(this._displayValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Easing function
   * @private
   */
  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Set value from entity state
   */
  set value(state) {
    super.value = state;
    
    const newValue = parseFloat(state) || this.scale.min;
    const clampedValue = Math.max(this.scale.min, Math.min(this.scale.max, newValue));
    
    if (clampedValue !== this._currentValue) {
      this._currentValue = clampedValue;
      this._updateValue(clampedValue);
      this.requestUpdate();
    }
  }

  /**
   * Render gauge track
   * @private
   */
  _renderTrack() {
    return svg`
      <path
        class="gauge-track"
        d="${this._angleToPath(this.svg.startAngle, this.svg.endAngle, this.svg.radius, this.gaugeGeometry.innerRadius)}"
        style="${styleMap(this.styles.track)}"
        fill="${this.config.colors.track}"
        stroke="${this.config.colors.track}"
        stroke-width="${this.svg.strokeWidth}"
      />
    `;
  }

  /**
   * Render gauge value arc
   * @private
   */
  _renderValueArc() {
    const valueAngle = this._valueToAngle(this._displayValue);
    return svg`
      <path
        class="gauge-value"
        d="${this._angleToPath(this.svg.startAngle, valueAngle, this.svg.radius, this.gaugeGeometry.innerRadius)}"
        style="${styleMap(this.styles.value)}"
        fill="${this._getValueColor(this._displayValue)}"
        stroke="${this._getValueColor(this._displayValue)}"
        stroke-width="${this.svg.strokeWidth}"
      />
    `;
  }

  /**
   * Render ticks
   * @private
   */
  _renderTicks() {
    if (!this.config.show.ticks) return svg``;

    return svg`
      <g class="gauge-ticks">
        ${this.ticks.map(tick => svg`
          <line
            class="gauge-tick"
            x1="${tick.x1}" y1="${tick.y1}"
            x2="${tick.x2}" y2="${tick.y2}"
            style="${styleMap(this.styles.ticks)}"
            stroke="${this.styles.ticks.stroke || 'var(--primary-text-color)'}"
            stroke-width="${this.styles.ticks['stroke-width'] || 1}"
          />
          ${tick.label ? svg`
            <text
              class="gauge-tick-label"
              x="${tick.x2 + (tick.x2 - this.gaugeGeometry.centerX) * 0.15}"
              y="${tick.y2 + (tick.y2 - this.gaugeGeometry.centerY) * 0.15}"
              style="${styleMap(this.styles.labels)}"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="${this.styles.labels['font-size'] || '10px'}"
              fill="${this.styles.labels.fill || 'var(--primary-text-color)'}"
            >
              ${tick.label}
            </text>
          ` : ''}
        `)}
      </g>
    `;
  }

  /**
   * Render value text
   * @private
   */
  _renderValueText() {
    if (!this.config.show.value) return svg``;

    const displayValue = this._formatTickLabel(this._displayValue);
    return svg`
      <text
        class="gauge-value-text"
        x="${this.gaugeGeometry.centerX}"
        y="${this.gaugeGeometry.centerY + this.svg.radius * 0.3}"
        style="${styleMap(this.styles.pointer)}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="${this.styles.pointer['font-size'] || '16px'}"
        font-weight="${this.styles.pointer['font-weight'] || 'bold'}"
        fill="${this.styles.pointer.fill || 'var(--primary-text-color)'}"
      >
        ${displayValue}
      </text>
    `;
  }

  /**
   * Main render method
   */
  render() {
    PerformanceMonitor.startRender();
    
    // Merge styles
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged({
      gauge: this.config.styles.gauge,
      track: this.config.styles.track,
      value: this.config.styles.value,
      ticks: this.config.styles.ticks,
      labels: this.config.styles.labels,
      pointer: this.config.styles.pointer,
    });

    const gauge = svg`
      <g class="sak-gauge ${classMap(this.classes.tool)}" style="${styleMap(this.styles.tool)}">
        ${this._renderTrack()}
        ${this._renderValueArc()}
        ${this._renderTicks()}
        ${this._renderValueText()}
      </g>
    `;

    PerformanceMonitor.endRender();
    return gauge;
  }

  /**
   * Get gauge statistics
   */
  getStats() {
    return {
      value: this._currentValue,
      displayValue: this._displayValue,
      angle: this._pointerAngle,
      percentage: ((this._currentValue - this.scale.min) / (this.scale.max - this.scale.min) * 100).toFixed(1),
      geometry: this.gaugeGeometry,
      tickCount: this.ticks.length,
    };
  }
}