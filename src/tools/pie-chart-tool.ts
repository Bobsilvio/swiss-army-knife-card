/** ***************************************************************************
  * PieChartTool class
  *
  * Summary.
  * Modern TypeScript-based pie chart visualization with advanced features
  */

import BaseTool from '../base-tool.js';
import { svg } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import { PerformanceMonitor } from '../utils.js';

export default class PieChartTool extends BaseTool {

[key: string]: any;


  /**
   * Pie chart configuration interface
   * @typedef {Object} PieChartConfig
   * @property {Array} data - Chart data array
   * @property {Object} colors - Color configuration
   * @property {Object} labels - Label configuration
   * @property {Object} animations - Animation settings
   */

  /**
   * Constructor
   * @param {Object} argToolset - Toolset instance
   * @param {PieChartConfig} argConfig - Pie chart configuration
   * @param {Object} argPos - Position configuration
   */
  constructor(argToolset, argConfig, argPos) {
    /** @type {PieChartConfig} */
    const DEFAULT_PIE_CHART_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 40,
      },
      data: {
        source: 'entity',
        entity_index: 0,
        attribute: 'attributes.pie_data',
        fallback: [
          { label: 'Segment 1', value: 30, color: 'var(--primary-color)' },
          { label: 'Segment 2', value: 25, color: 'var(--secondary-color)' },
          { label: 'Segment 3', value: 20, color: 'var(--success-color)' },
          { label: 'Segment 4', value: 25, color: 'var(--warning-color)' },
        ],
      },
      colors: {
        scheme: 'default',
        custom: [],
        gradient: false,
      },
      labels: {
        show: true,
        position: 'outside', // 'inside', 'outside', 'none'
        format: 'percentage', // 'percentage', 'value', 'label', 'both'
        font_size: 10,
        threshold: 5, // Minimum percentage to show label
      },
      styles: {
        chart: {},
        segment: {},
        label: {},
        line: {},
      },
      animations: {
        enabled: true,
        duration: 800,
        easing: 'ease-out',
        stagger: 50,
      },
      interactions: {
        hover: true,
        click: false,
        tooltip: true,
      },
    };

    super(argToolset, { ...DEFAULT_PIE_CHART_CONFIG, ...argConfig }, argPos);

    // Pie chart specific properties
    this.svg.radius = this.calculateSvgDimension(this.config.position.radius);
    this.svg.centerX = this.svg.cx;
    this.svg.centerY = this.svg.cy;

    // Data processing
    this._processedData = [];
    this._totalValue = 0;
    this._segments = [];

    // Animation state
    this._animationProgress = 0;
    this._hoveredSegment = null;
    this._selectedSegment = null;

    // Performance optimization
    this._renderCache = new Map();
    this._lastDataHash = '';

    // Initialize
    this._processData();
    this._calculateSegments();

    if (this.dev.debug) {
      console.log('PieChartTool constructor:', {
        config: this.config,
        data: this._processedData,
        segments: this._segments,
        total: this._totalValue,
      });
    }
  }

  /**
   * Process raw data into chart format
   * @private
   */
  _processData() {
    let rawData = [];

    // Get data from entity or fallback
    if (this.config.data.source === 'entity' && this._card?.entities) {
      const entityIndex = this.config.data.entity_index || 0;
      const entity = this._card.entities[entityIndex];
      
      if (entity) {
        const attributePath = this.config.data.attribute.split('.');
        let data = entity;
        
        for (const attr of attributePath) {
          data = data?.[attr];
        }
        
        if (Array.isArray(data)) {
          rawData = data;
        }
      }
    }

    // Use fallback data if no entity data
    if (!rawData || rawData.length === 0) {
      rawData = this.config.data.fallback;
    }

    // Process and validate data
    this._processedData = rawData
      .filter(item => item && typeof item.value === 'number' && item.value > 0)
      .map((item, index) => ({
        ...item,
        label: item.label || `Segment ${index + 1}`,
        color: item.color || this._getSegmentColor(index),
        percentage: 0, // Will be calculated
      }));

    // Calculate total and percentages
    this._totalValue = this._processedData.reduce((sum, item) => sum + item.value, 0);
    
    this._processedData.forEach(item => {
      item.percentage = (item.value / this._totalValue) * 100;
    });

    // Sort by value (descending) for better visualization
    this._processedData.sort((a, b) => b.value - a.value);
  }

  /**
   * Get segment color
   * @private
   */
  _getSegmentColor(index) {
    const { colors } = this.config;
    
    if (colors.custom && colors.custom[index]) {
      return colors.custom[index];
    }

    // Default color schemes
    const schemes = {
      default: [
        'var(--primary-color)',
        'var(--secondary-color)', 
        'var(--success-color)',
        'var(--warning-color)',
        'var(--error-color)',
        'var(--info-color)',
      ],
      material: [
        '#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#00796B'
      ],
      pastel: [
        '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4'
      ],
    };

    const scheme = schemes[colors.scheme] || schemes.default;
    return scheme[index % scheme.length];
  }

  /**
   * Calculate segment geometry
   * @private
   */
  _calculateSegments() {
    this._segments = [];
    let currentAngle = -90; // Start from top

    this._processedData.forEach((item, index) => {
      const angleSpan = (item.percentage / 100) * 360;
      const endAngle = currentAngle + angleSpan;
      
      // Calculate segment path
      const path = this._createSegmentPath(currentAngle, endAngle, this.svg.radius);
      
      // Calculate label position
      const labelAngle = currentAngle + (angleSpan / 2);
      const labelAngleRad = (labelAngle * Math.PI) / 180;
      const labelRadius = this.svg.radius * 0.7; // Position at 70% of radius
      const labelX = this.svg.centerX + Math.cos(labelAngleRad) * labelRadius;
      const labelY = this.svg.centerY + Math.sin(labelAngleRad) * labelRadius;

      this._segments.push({
        index,
        data: item,
        startAngle: currentAngle,
        endAngle: endAngle,
        angleSpan,
        path,
        labelX,
        labelY,
        labelAngleRad,
        hovered: false,
        selected: false,
      });

      currentAngle = endAngle;
    });
  }

  /**
   * Create SVG path for pie segment
   * @private
   */
  _createSegmentPath(startAngle, endAngle, radius) {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = this.svg.centerX + Math.cos(startAngleRad) * radius;
    const y1 = this.svg.centerY + Math.sin(startAngleRad) * radius;
    const x2 = this.svg.centerX + Math.cos(endAngleRad) * radius;
    const y2 = this.svg.centerY + Math.sin(endAngleRad) * radius;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${this.svg.centerX} ${this.svg.centerY}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;
  }

  /**
   * Format label text
   * @private
   */
  _formatLabelText(segment) {
    const { labels } = this.config;
    const { data } = segment;
    
    switch (labels.format) {
      case 'percentage':
        return `${data.percentage.toFixed(1)}%`;
      case 'value':
        return data.value.toString();
      case 'label':
        return data.label;
      case 'both':
        return `${data.label}: ${data.percentage.toFixed(1)}%`;
      default:
        return data.label;
    }
  }

  /**
   * Check if segment should show label
   * @private
   */
  _shouldShowLabel(segment) {
    const { labels } = this.config;
    
    if (labels.position === 'none') return false;
    if (labels.threshold > 0 && segment.data.percentage < labels.threshold) return false;
    
    return true;
  }

  /**
   * Handle segment hover
   * @private
   */
  _handleSegmentHover(segmentIndex, isHovered) {
    if (!this.config.interactions.hover) return;
    
    const segment = this._segments[segmentIndex];
    if (segment.hovered !== isHovered) {
      segment.hovered = isHovered;
      this._hoveredSegment = isHovered ? segment : null;
      this.requestUpdate();
    }
  }

  /**
   * Handle segment click
   * @private
   */
  _handleSegmentClick(segmentIndex) {
    if (!this.config.interactions.click) return;
    
    const segment = this._segments[segmentIndex];
    this._selectedSegment = segment;
    
    // Emit custom event
    this.dispatchEvent(new CustomEvent('segment-click', {
      detail: { segment, data: segment.data }
    }));
    
    this.requestUpdate();
  }

  /**
   * Animate chart rendering
   * @private
   */
  _animateChart() {
    if (!this.config.animations.enabled) {
      this._animationProgress = 1;
      return;
    }

    const startTime = performance.now();
    const duration = this.config.animations.duration;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      this._animationProgress = this._easeOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
        this.requestUpdate();
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
    
    // Re-process data when state changes
    this._processData();
    this._calculateSegments();
    
    // Restart animation
    this._animationProgress = 0;
    this._animateChart();
  }

  /**
   * Render pie segments
   * @private
   */
  _renderSegments() {
    return svg`
      <g class="pie-segments">
        ${this._segments.map((segment, index) => {
          const scale = segment.hovered ? 1.05 : 1;
          const transform = `scale(${scale})`;
          const transformOrigin = `${this.svg.centerX}px ${this.svg.centerY}px`;
          
          return svg`
            <path
              class="pie-segment ${classMap({ 
                'hovered': segment.hovered, 
                'selected': segment.selected 
              })}"
              d="${segment.path}"
              fill="${segment.data.color}"
              stroke="var(--card-background-color)"
              stroke-width="2"
              style="${styleMap({
                ...this.styles.segment,
                transform,
                transformOrigin,
                transition: 'transform 0.2s ease',
                cursor: this.config.interactions.hover ? 'pointer' : 'default',
              })}"
              @mouseenter=${() => this._handleSegmentHover(index, true)}
              @mouseleave=${() => this._handleSegmentHover(index, false)}
              @click=${() => this._handleSegmentClick(index)}
            />
          `;
        })}
      </g>
    `;
  }

  /**
   * Render labels
   * @private
   */
  _renderLabels() {
    if (!this.config.labels.show) return svg``;

    return svg`
      <g class="pie-labels">
        ${this._segments.map((segment) => {
          if (!this._shouldShowLabel(segment)) return svg``;
          
          const labelText = this._formatLabelText(segment);
          const opacity = this._animationProgress;
          
          return svg`
            <text
              class="pie-label"
              x="${segment.labelX}"
              y="${segment.labelY}"
              style="${styleMap({
                ...this.styles.label,
                opacity,
                transition: 'opacity 0.3s ease',
              })}"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="${this.config.labels.font_size}px"
              fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
              pointer-events="none"
            >
              ${labelText}
            </text>
          `;
        })}
      </g>
    `;
  }

  /**
   * Render tooltip
   * @private
   */
  _renderTooltip() {
    if (!this.config.interactions.tooltip || !this._hoveredSegment) return svg``;
    
    const segment = this._hoveredSegment;
    const tooltipText = `${segment.data.label}: ${segment.data.value} (${segment.data.percentage.toFixed(1)}%)`;
    
    return svg`
      <g class="pie-tooltip">
        <rect
          x="${this.svg.centerX - 40}"
          y="${this.svg.centerY + this.svg.radius + 10}"
          width="80"
          height="20"
          rx="4"
          fill="var(--card-background-color)"
          stroke="var(--primary-text-color)"
          stroke-width="1"
          opacity="0.9"
        />
        <text
          x="${this.svg.centerX}"
          y="${this.svg.centerY + this.svg.radius + 20}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="10px"
          fill="var(--primary-text-color)"
        >
          ${tooltipText}
        </text>
      </g>
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
      chart: this.config.styles.chart,
      segment: this.config.styles.segment,
      label: this.config.styles.label,
      line: this.config.styles.line,
    });

    const chart = svg`
      <g class="sak-pie-chart ${classMap(this.classes.tool)}" style="${styleMap(this.styles.tool)}">
        ${this._renderSegments()}
        ${this._renderLabels()}
        ${this._renderTooltip()}
      </g>
    `;

    PerformanceMonitor.endRender();
    return chart;
  }

  /**
   * Get chart statistics
   */
  getStats() {
    return {
      totalValue: this._totalValue,
      segmentCount: this._segments.length,
      animationProgress: this._animationProgress,
      hoveredSegment: this._hoveredSegment?.index || null,
      selectedSegment: this._selectedSegment?.index || null,
      data: this._processedData,
    };
  }

  /**
   * Export chart data
   */
  exportData() {
    return {
      config: this.config,
      data: this._processedData,
      segments: this._segments.map(s => ({
        label: s.data.label,
        value: s.data.value,
        percentage: s.data.percentage,
        color: s.data.color,
      })),
      total: this._totalValue,
    };
  }
}