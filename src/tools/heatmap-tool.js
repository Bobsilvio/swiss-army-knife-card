/** ***************************************************************************
  * HeatmapTool class
  *
  * Summary.
  * Modern TypeScript-based heatmap visualization with advanced features
  */

import BaseTool from '../base-tool.js';
import { svg } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import { PerformanceMonitor } from '../utils.js';

export default class HeatmapTool extends BaseTool {
  /**
   * Heatmap configuration interface
   * @typedef {Object} HeatmapConfig
   * @property {Array} data - 2D data array
   * @property {Object} colors - Color scale configuration
   * @property {Object} grid - Grid configuration
   * @property {Object} labels - Label configuration
   */

  /**
   * Constructor
   * @param {Object} argToolset - Toolset instance
   * @param {HeatmapConfig} argConfig - Heatmap configuration
   * @param {Object} argPos - Position configuration
   */
  constructor(argToolset, argConfig, argPos) {
    /** @type {HeatmapConfig} */
    const DEFAULT_HEATMAP_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        width: 80,
        height: 80,
      },
      data: {
        source: 'entity',
        entity_index: 0,
        attribute: 'attributes.heatmap_data',
        fallback: this._generateFallbackData(),
      },
      colors: {
        scheme: 'thermal', // 'thermal', 'cool', 'rainbow', 'grayscale'
        min: 'var(--success-color)',
        max: 'var(--error-color)',
        steps: 10,
        reverse: false,
      },
      grid: {
        rows: 8,
        cols: 8,
        gap: 1,
        show: true,
      },
      labels: {
        x: {
          show: false,
          values: [],
          rotation: 0,
        },
        y: {
          show: false,
          values: [],
          rotation: 0,
        },
        font_size: 8,
      },
      styles: {
        heatmap: {},
        cell: {},
        label: {},
        legend: {},
      },
      animations: {
        enabled: true,
        duration: 1000,
        easing: 'ease-out',
      },
      interactions: {
        hover: true,
        click: false,
        tooltip: true,
      },
      legend: {
        show: true,
        position: 'right', // 'bottom', 'right', 'left', 'top'
        orientation: 'vertical', // 'horizontal', 'vertical'
        width: 10,
        height: 40,
      },
    };

    super(argToolset, { ...DEFAULT_HEATMAP_CONFIG, ...argConfig }, argPos);

    // Heatmap specific properties
    this.svg.width = this.calculateSvgDimension(this.config.position.width);
    this.svg.height = this.calculateSvgDimension(this.config.position.height);
    this.svg.centerX = this.svg.cx;
    this.svg.centerY = this.svg.cy;

    // Grid calculations
    this._calculateGridGeometry();
    
    // Data processing
    this._processedData = [];
    this._colorScale = [];
    this._minValue = 0;
    this._maxValue = 1;

    // Interaction state
    this._hoveredCell = null;
    this._selectedCell = null;

    // Animation state
    this._animationProgress = 0;
    this._cellAnimations = new Map();

    // Performance optimization
    this._renderCache = new Map();
    this._lastDataHash = '';

    // Initialize
    this._processData();
    this._generateColorScale();
    this._initializeAnimations();

    if (this.dev.debug) {
      console.log('HeatmapTool constructor:', {
        config: this.config,
        grid: this.gridGeometry,
        data: this._processedData,
        colorScale: this._colorScale,
        range: { min: this._minValue, max: this._maxValue },
      });
    }
  }

  /**
   * Generate fallback data for testing
   * @private
   */
  _generateFallbackData() {
    const rows = 8;
    const cols = 8;
    const data = [];
    
    for (let i = 0; i < rows; i++) {
      data[i] = [];
      for (let j = 0; j < cols; j++) {
        // Create some interesting patterns
        const value = Math.sin(i * 0.5) * Math.cos(j * 0.5) + Math.random() * 0.5;
        data[i][j] = Math.max(0, Math.min(1, value));
      }
    }
    
    return data;
  }

  /**
   * Calculate grid geometry
   * @private
   */
  _calculateGridGeometry() {
    const { grid } = this.config;
    const gap = this.calculateSvgDimension(grid.gap);
    
    const totalGapX = (grid.cols - 1) * gap;
    const totalGapY = (grid.rows - 1) * gap;
    
    this.gridGeometry = {
      rows: grid.rows,
      cols: grid.cols,
      gap,
      cellWidth: (this.svg.width - totalGapX) / grid.cols,
      cellHeight: (this.svg.height - totalGapY) / grid.rows,
      startX: this.svg.centerX - this.svg.width / 2,
      startY: this.svg.centerY - this.svg.height / 2,
    };
  }

  /**
   * Process raw data
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
        
        if (Array.isArray(data) && data.length > 0) {
          rawData = data;
        }
      }
    }

    // Use fallback data if no entity data
    if (!rawData || rawData.length === 0) {
      rawData = this.config.data.fallback;
    }

    // Validate and process data
    this._processedData = [];
    this._minValue = Infinity;
    this._maxValue = -Infinity;

    for (let i = 0; i < this.gridGeometry.rows && i < rawData.length; i++) {
      const row = [];
      for (let j = 0; j < this.gridGeometry.cols && j < rawData[i].length; j++) {
        const value = parseFloat(rawData[i][j]);
        const validValue = !isNaN(value) ? value : 0;
        
        row.push(validValue);
        this._minValue = Math.min(this._minValue, validValue);
        this._maxValue = Math.max(this._maxValue, validValue);
      }
      this._processedData.push(row);
    }

    // Normalize values if no variation
    if (this._minValue === this._maxValue) {
      this._minValue = 0;
      this._maxValue = 1;
    }
  }

  /**
   * Generate color scale
   * @private
   */
  _generateColorScale() {
    const { colors } = this.config;
    const steps = colors.steps;
    
    this._colorScale = [];
    
    for (let i = 0; i < steps; i++) {
      const position = i / (steps - 1);
      this._colorScale.push(this._getColorForPosition(position));
    }

    if (colors.reverse) {
      this._colorScale.reverse();
    }
  }

  /**
   * Get color for position in scale
   * @private
   */
  _getColorForPosition(position) {
    const { colors, scheme } = this.config;
    
    const schemes = {
      thermal: [
        '#0000FF', // Blue (cold)
        '#00FFFF', // Cyan
        '#00FF00', // Green
        '#FFFF00', // Yellow
        '#FF7F00', // Orange
        '#FF0000', // Red (hot)
      ],
      cool: [
        '#FF0000', // Red
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#00FF00', // Green
        '#00FFFF', // Cyan
        '#0000FF', // Blue
      ],
      rainbow: [
        '#9400D3', // Violet
        '#4B0082', // Indigo
        '#0000FF', // Blue
        '#00FF00', // Green
        '#FFFF00', // Yellow
        '#FF7F00', // Orange
        '#FF0000', // Red
      ],
      grayscale: [
        '#000000', // Black
        '#333333', // Dark gray
        '#666666', // Medium gray
        '#999999', // Light gray
        '#CCCCCC', // Pale gray
        '#FFFFFF', // White
      ],
    };

    const colorArray = schemes[colors.scheme] || schemes.thermal;
    const index = Math.floor(position * (colorArray.length - 1));
    return colorArray[index];
  }

  /**
   * Get color for value
   * @private
   */
  _getColorForValue(value) {
    if (this._maxValue === this._minValue) {
      return this._colorScale[Math.floor(this._colorScale.length / 2)];
    }

    const normalizedValue = (value - this._minValue) / (this._maxValue - this._minValue);
    const index = Math.floor(normalizedValue * (this._colorScale.length - 1));
    return this._colorScale[Math.min(index, this._colorScale.length - 1)];
  }

  /**
   * Get cell position
   * @private
   */
  _getCellPosition(row, col) {
    const { cellWidth, cellHeight, gap, startX, startY } = this.gridGeometry;
    
    return {
      x: startX + col * (cellWidth + gap),
      y: startY + row * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight,
    };
  }

  /**
   * Handle cell hover
   * @private
   */
  _handleCellHover(row, col, isHovered) {
    if (!this.config.interactions.hover) return;
    
    const key = `${row}-${col}`;
    if (isHovered) {
      this._hoveredCell = { row, col, value: this._processedData[row]?.[col] };
    } else {
      this._hoveredCell = null;
    }
    
    this.requestUpdate();
  }

  /**
   * Handle cell click
   * @private
   */
  _handleCellClick(row, col) {
    if (!this.config.interactions.click) return;
    
    this._selectedCell = { row, col, value: this._processedData[row]?.[col] };
    
    // Emit custom event
    this.dispatchEvent(new CustomEvent('cell-click', {
      detail: this._selectedCell
    }));
    
    this.requestUpdate();
  }

  /**
   * Initialize animations
   * @private
   */
  _initializeAnimations() {
    if (!this.config.animations.enabled) {
      this._animationProgress = 1;
      return;
    }

    // Create animation delays for each cell
    this._cellAnimations.clear();
    let delay = 0;
    
    for (let row = 0; row < this.gridGeometry.rows; row++) {
      for (let col = 0; col < this.gridGeometry.cols; col++) {
        this._cellAnimations.set(`${row}-${col}`, {
          startTime: delay,
          progress: 0,
        });
        delay += this.config.animations.duration / (this.gridGeometry.rows * this.gridGeometry.cols);
      }
    }

    this._startAnimation();
  }

  /**
   * Start animation
   * @private
   */
  _startAnimation() {
    const startTime = performance.now();
    const totalDuration = this.config.animations.duration;
    const stagger = this.config.animations.duration / (this.gridGeometry.rows * this.gridGeometry.cols);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      this._animationProgress = Math.min(elapsed / totalDuration, 1);

      // Update individual cell animations
      this._cellAnimations.forEach((animation, key) => {
        const cellElapsed = Math.max(0, elapsed - animation.startTime);
        animation.progress = Math.min(cellElapsed / stagger, 1);
      });

      if (this._animationProgress < 1) {
        requestAnimationFrame(animate);
        this.requestUpdate();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Set value from entity state
   */
  set value(state) {
    super.value = state;
    
    // Re-process data when state changes
    this._processData();
    this._generateColorScale();
    this._initializeAnimations();
  }

  /**
   * Render heatmap cells
   * @private
   */
  _renderCells() {
    return svg`
      <g class="heatmap-cells">
        ${this._processedData.map((row, rowIndex) => 
          row.map((value, colIndex) => {
            const position = this._getCellPosition(rowIndex, colIndex);
            const color = this._getColorForValue(value);
            const animation = this._cellAnimations.get(`${rowIndex}-${colIndex}`) || { progress: 1 };
            const isHovered = this._hoveredCell?.row === rowIndex && this._hoveredCell?.col === colIndex;
            const isSelected = this._selectedCell?.row === rowIndex && this._selectedCell?.col === colIndex;
            
            return svg`
              <rect
                class="heatmap-cell ${classMap({ 
                  'hovered': isHovered, 
                  'selected': isSelected 
                })}"
                x="${position.x}"
                y="${position.y}"
                width="${position.width}"
                height="${position.height}"
                fill="${color}"
                stroke="var(--card-background-color)"
                stroke-width="${this.config.grid.gap}"
                style="${styleMap({
                  ...this.styles.cell,
                  opacity: animation.progress * (isHovered ? 1 : 0.8),
                  transform: `scale(${animation.progress * (isHovered ? 1.1 : 1)})`,
                  transformOrigin: `${position.x + position.width / 2}px ${position.y + position.height / 2}px`,
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  cursor: this.config.interactions.hover ? 'pointer' : 'default',
                })}"
                @mouseenter=${() => this._handleCellHover(rowIndex, colIndex, true)}
                @mouseleave=${() => this._handleCellHover(rowIndex, colIndex, false)}
                @click=${() => this._handleCellClick(rowIndex, colIndex)}
              />
            `;
          })
        )}
      </g>
    `;
  }

  /**
   * Render labels
   * @private
   */
  _renderLabels() {
    const { labels } = this.config;
    
    if (!labels.x.show && !labels.y.show) return svg``;

    return svg`
      <g class="heatmap-labels">
        ${labels.x.show ? svg`
          <g class="x-labels">
            ${Array.from({ length: this.gridGeometry.cols }, (_, colIndex) => {
              const label = labels.x.values[colIndex] || colIndex.toString();
              const x = this._getCellPosition(0, colIndex).x + this.gridGeometry.cellWidth / 2;
              const y = this.gridGeometry.startY + this.gridGeometry.rows * (this.gridGeometry.cellHeight + this.gridGeometry.gap) + 5;
              
              return svg`
                <text
                  x="${x}"
                  y="${y}"
                  style="${styleMap({
                    ...this.styles.label,
                    fontSize: `${labels.font_size}px`,
                    textAnchor: 'middle',
                    transform: `rotate(${labels.x.rotation} ${x} ${y})`,
                  })}"
                  fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
                >
                  ${label}
                </text>
              `;
            })}
          </g>
        ` : ''}
        
        ${labels.y.show ? svg`
          <g class="y-labels">
            ${Array.from({ length: this.gridGeometry.rows }, (_, rowIndex) => {
              const label = labels.y.values[rowIndex] || rowIndex.toString();
              const x = this.gridGeometry.startX - 5;
              const y = this._getCellPosition(rowIndex, 0).y + this.gridGeometry.cellHeight / 2;
              
              return svg`
                <text
                  x="${x}"
                  y="${y}"
                  style="${styleMap({
                    ...this.styles.label,
                    fontSize: `${labels.font_size}px`,
                    textAnchor: 'end',
                    dominantBaseline: 'middle',
                    transform: `rotate(${labels.y.rotation} ${x} ${y})`,
                  })}"
                  fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
                >
                  ${label}
                </text>
              `;
            })}
          </g>
        ` : ''}
      </g>
    `;
  }

  /**
   * Render legend
   * @private
   */
  _renderLegend() {
    if (!this.config.legend.show) return svg``;

    const { legend, colors } = this.config;
    const isVertical = legend.orientation === 'vertical';
    
    let legendX, legendY;
    
    // Position calculation based on config
    switch (legend.position) {
      case 'right':
        legendX = this.svg.centerX + this.svg.width / 2 + 10;
        legendY = this.svg.centerY - legend.height / 2;
        break;
      case 'bottom':
        legendX = this.svg.centerX - legend.width / 2;
        legendY = this.svg.centerY + this.svg.height / 2 + 10;
        break;
      case 'left':
        legendX = this.svg.centerX - this.svg.width / 2 - legend.width - 10;
        legendY = this.svg.centerY - legend.height / 2;
        break;
      case 'top':
        legendX = this.svg.centerX - legend.width / 2;
        legendY = this.svg.centerY - this.svg.height / 2 - legend.height - 10;
        break;
      default:
        return svg``;
    }

    return svg`
      <g class="heatmap-legend">
        ${isVertical ? svg`
          <defs>
            <linearGradient id="legend-gradient-${this.toolId}" x1="0%" y1="0%" x2="0%" y2="100%">
              ${this._colorScale.map((color, index) => {
                const position = (index / (this._colorScale.length - 1)) * 100;
                return svg`<stop offset="${position}%" stop-color="${color}" />`;
              })}
            </linearGradient>
          </defs>
          <rect
            x="${legendX}"
            y="${legendY}"
            width="${legend.width}"
            height="${legend.height}"
            fill="url(#legend-gradient-${this.toolId})"
            stroke="var(--primary-text-color)"
            stroke-width="1"
          />
          <text
            x="${legendX + legend.width + 5}"
            y="${legendY}"
            font-size="${labels.font_size - 1}px"
            fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
          >
            ${this._maxValue.toFixed(1)}
          </text>
          <text
            x="${legendX + legend.width + 5}"
            y="${legendY + legend.height}"
            font-size="${labels.font_size - 1}px"
            fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
          >
            ${this._minValue.toFixed(1)}
          </text>
        ` : svg`
          <defs>
            <linearGradient id="legend-gradient-${this.toolId}" x1="0%" y1="0%" x2="100%" y2="0%">
              ${this._colorScale.map((color, index) => {
                const position = (index / (this._colorScale.length - 1)) * 100;
                return svg`<stop offset="${position}%" stop-color="${color}" />`;
              })}
            </linearGradient>
          </defs>
          <rect
            x="${legendX}"
            y="${legendY}"
            width="${legend.width}"
            height="${legend.height}"
            fill="url(#legend-gradient-${this.toolId})"
            stroke="var(--primary-text-color)"
            stroke-width="1"
          />
          <text
            x="${legendX}"
            y="${legendY - 3}"
            font-size="${labels.font_size - 1}px"
            fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
          >
            ${this._minValue.toFixed(1)}
          </text>
          <text
            x="${legendX + legend.width}"
            y="${legendY - 3}"
            font-size="${labels.font_size - 1}px"
            fill="${this.styles.label.fill || 'var(--primary-text-color)'}"
          >
            ${this._maxValue.toFixed(1)}
          </text>
        `}
      </g>
    `;
  }

  /**
   * Render tooltip
   * @private
   */
  _renderTooltip() {
    if (!this.config.interactions.tooltip || !this._hoveredCell) return svg``;
    
    const { row, col, value } = this._hoveredCell;
    const position = this._getCellPosition(row, col);
    
    return svg`
      <g class="heatmap-tooltip">
        <rect
          x="${position.x + position.width / 2 - 30}"
          y="${position.y - 25}"
          width="60"
          height="20"
          rx="3"
          fill="var(--card-background-color)"
          stroke="var(--primary-text-color)"
          stroke-width="1"
          opacity="0.9"
        />
        <text
          x="${position.x + position.width / 2}"
          y="${position.y - 10}"
          text-anchor="middle"
          font-size="10px"
          fill="var(--primary-text-color)"
        >
          [${row},${col}]: ${value.toFixed(2)}
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
      heatmap: this.config.styles.heatmap,
      cell: this.config.styles.cell,
      label: this.config.styles.label,
      legend: this.config.styles.legend,
    });

    const heatmap = svg`
      <g class="sak-heatmap ${classMap(this.classes.tool)}" style="${styleMap(this.styles.tool)}">
        ${this._renderCells()}
        ${this._renderLabels()}
        ${this._renderLegend()}
        ${this._renderTooltip()}
      </g>
    `;

    PerformanceMonitor.endRender();
    return heatmap;
  }

  /**
   * Get heatmap statistics
   */
  getStats() {
    return {
      rows: this.gridGeometry.rows,
      cols: this.gridGeometry.cols,
      totalCells: this.gridGeometry.rows * this.gridGeometry.cols,
      minValue: this._minValue,
      maxValue: this._maxValue,
      animationProgress: this._animationProgress,
      hoveredCell: this._hoveredCell,
      selectedCell: this._selectedCell,
    };
  }

  /**
   * Export heatmap data
   */
  exportData() {
    return {
      config: this.config,
      data: this._processedData,
      colorScale: this._colorScale,
      statistics: this.getStats(),
    };
  }
}