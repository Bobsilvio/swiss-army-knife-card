import { describe, it, expect, beforeEach, vi } from 'vitest';
import HeatmapTool from '../../src/tools/heatmap-tool.js';

// Mock BaseTool
vi.mock('../src/base-tool.js', () => ({
  default: class MockBaseTool {
    constructor(toolset, config, pos) {
      this.toolId = 'test-tool-id';
      this.toolset = toolset;
      this.config = config;
      this._card = toolset._card;
      this.svg = {};
      this.dev = { debug: false };
    }
    
    calculateSvgDimension(value) {
      return parseFloat(value) || 0;
    }
    
    MergeAnimationClassIfChanged() {}
    MergeAnimationStyleIfChanged() {}
    
    requestUpdate() {}
  }
}));

// Mock lit-element
vi.mock('lit-element', () => ({
  svg: vi.fn(),
}));

vi.mock('lit-html/directives/class-map', () => ({
  classMap: vi.fn(),
}));

vi.mock('lit-html/directives/style-map', () => ({
  styleMap: vi.fn(),
}));

describe('HeatmapTool', () => {
  let heatmapTool;
  let mockToolset;
  let mockCard;

  beforeEach(() => {
    mockCard = {
      dev: { debug: false },
      entities: [],
    };
    
    mockToolset = {
      _card: mockCard,
    };
    
    const config = {
      position: {
        cx: 50,
        cy: 50,
        width: 80,
        height: 80,
      },
      grid: {
        rows: 4,
        cols: 4,
        gap: 1,
      },
      colors: {
        scheme: 'thermal',
        steps: 5,
      },
    };
    
    heatmapTool = new HeatmapTool(mockToolset, config, {});
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(heatmapTool.config.position.cx).toBe(50);
      expect(heatmapTool.config.position.cy).toBe(50);
      expect(heatmapTool.config.grid.rows).toBe(4);
      expect(heatmapTool.config.grid.cols).toBe(4);
      expect(heatmapTool.config.colors.scheme).toBe('thermal');
    });

    it('should calculate geometry correctly', () => {
      expect(heatmapTool.svg.width).toBe(80);
      expect(heatmapTool.svg.height).toBe(80);
      expect(heatmapTool.gridGeometry.rows).toBe(4);
      expect(heatmapTool.gridGeometry.cols).toBe(4);
    });

    it('should generate fallback data', () => {
      expect(heatmapTool._processedData).toHaveLength(4);
      expect(heatmapTool._processedData[0]).toHaveLength(4);
    });

    it('should generate color scale', () => {
      expect(heatmapTool._colorScale).toHaveLength(5);
      expect(heatmapTool._colorScale[0]).toBeDefined();
      expect(heatmapTool._colorScale[4]).toBeDefined();
    });
  });

  describe('fallback data generation', () => {
    it('should generate data with correct dimensions', () => {
      const data = heatmapTool._generateFallbackData();
      
      expect(data).toHaveLength(8); // Default rows
      expect(data[0]).toHaveLength(8); // Default cols
    });

    it('should generate valid numeric values', () => {
      const data = heatmapTool._generateFallbackData();
      
      data.forEach(row => {
        row.forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('grid geometry calculation', () => {
    it('should calculate cell dimensions correctly', () => {
      const { cellWidth, cellHeight } = heatmapTool.gridGeometry;
      
      expect(cellWidth).toBeGreaterThan(0);
      expect(cellHeight).toBeGreaterThan(0);
      expect(cellWidth).toBe((80 - 3) / 4); // (width - totalGap) / cols
      expect(cellHeight).toBe((80 - 3) / 4); // (height - totalGap) / rows
    });

    it('should calculate start position correctly', () => {
      const { startX, startY } = heatmapTool.gridGeometry;
      
      expect(startX).toBe(50 - 80 / 2); // centerX - width/2
      expect(startY).toBe(50 - 80 / 2); // centerY - height/2
    });
  });

  describe('data processing', () => {
    it('should filter invalid data values', () => {
      const config = {
        ...heatmapTool.config,
        data: {
          source: 'fallback',
          fallback: [
            [0.5, 'invalid', 0.3, null],
            [0.8, 0.2, 'not a number', 0.4],
          ],
        },
      };
      
      const tool = new HeatmapTool(mockToolset, config, {});
      
      expect(tool._processedData[0][1]).toBe(0); // invalid -> 0
      expect(tool._processedData[0][3]).toBe(0); // null -> 0
      expect(tool._processedData[1][2]).toBe(0); // not a number -> 0
    });

    it('should calculate min and max values correctly', () => {
      expect(heatmapTool._minValue).toBeLessThanOrEqual(heatmapTool._maxValue);
      expect(typeof heatmapTool._minValue).toBe('number');
      expect(typeof heatmapTool._maxValue).toBe('number');
    });

    it('should handle equal values', () => {
      const config = {
        ...heatmapTool.config,
        data: {
          source: 'fallback',
          fallback: [
            [0.5, 0.5, 0.5],
            [0.5, 0.5, 0.5],
          ],
        },
      };
      
      const tool = new HeatmapTool(mockToolset, config, {});
      
      expect(tool._minValue).toBe(0);
      expect(tool._maxValue).toBe(1);
    });
  });

  describe('color scale generation', () => {
    it('should generate correct number of colors', () => {
      expect(heatmapTool._colorScale).toHaveLength(5);
    });

    it('should use thermal scheme by default', () => {
      const tool = new HeatmapTool(mockToolset, {
        ...heatmapTool.config,
        colors: { scheme: 'thermal' },
      }, {});
      
      expect(tool._colorScale[0]).toBe('#0000FF');
      expect(tool._colorScale[tool._colorScale.length - 1]).toBe('#FF0000');
    });

    it('should reverse colors when specified', () => {
      const config = {
        ...heatmapTool.config,
        colors: { reverse: true },
      };
      
      const tool = new HeatmapTool(mockToolset, config, {});
      const normalTool = new HeatmapTool(mockToolset, heatmapTool.config, {});
      
      expect(tool._colorScale[0]).toBe(normalTool._colorScale[normalTool._colorScale.length - 1]);
    });

    it('should handle different color schemes', () => {
      const schemes = ['thermal', 'cool', 'rainbow', 'grayscale'];
      
      schemes.forEach(scheme => {
        const config = { ...heatmapTool.config, colors: { scheme } };
        const tool = new HeatmapTool(mockToolset, config, {});
        
        expect(tool._colorScale).toHaveLength(5);
        expect(tool._colorScale[0]).toBeDefined();
      });
    });
  });

  describe('color interpolation', () => {
    it('should return color for valid value', () => {
      const color = heatmapTool._getColorForValue(0.5);
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    it('should handle edge values', () => {
      const minColor = heatmapTool._getColorForValue(heatmapTool._minValue);
      const maxColor = heatmapTool._getColorForValue(heatmapTool._maxValue);
      
      expect(minColor).toBeDefined();
      expect(maxColor).toBeDefined();
    });

    it('should handle equal min/max values', () => {
      const config = {
        ...heatmapTool.config,
        data: {
          source: 'fallback',
          fallback: [[0.5]],
        },
      };
      
      const tool = new HeatmapTool(mockToolset, config, {});
      tool._minValue = tool._maxValue = 0.5;
      
      const color = tool._getColorForValue(0.5);
      expect(color).toBeDefined();
    });
  });

  describe('cell positioning', () => {
    it('should calculate cell position correctly', () => {
      const position = heatmapTool._getCellPosition(0, 0);
      
      expect(position.x).toBe(heatmapTool.gridGeometry.startX);
      expect(position.y).toBe(heatmapTool.gridGeometry.startY);
      expect(position.width).toBe(heatmapTool.gridGeometry.cellWidth);
      expect(position.height).toBe(heatmapTool.gridGeometry.cellHeight);
    });

    it('should calculate different positions for different cells', () => {
      const pos1 = heatmapTool._getCellPosition(0, 0);
      const pos2 = heatmapTool._getCellPosition(1, 1);
      
      expect(pos1.x).not.toBe(pos2.x);
      expect(pos1.y).not.toBe(pos2.y);
    });
  });

  describe('interactions', () => {
    it('should handle cell hover', () => {
      heatmapTool.config.interactions.hover = true;
      
      heatmapTool._handleCellHover(0, 0, true);
      expect(heatmapTool._hoveredCell).toEqual({
        row: 0,
        col: 0,
        value: heatmapTool._processedData[0][0],
      });
      
      heatmapTool._handleCellHover(0, 0, false);
      expect(heatmapTool._hoveredCell).toBe(null);
    });

    it('should handle cell click', () => {
      const eventSpy = vi.fn();
      heatmapTool.addEventListener = vi.fn();
      heatmapTool.dispatchEvent = eventSpy;
      
      heatmapTool.config.interactions.click = true;
      heatmapTool._handleCellClick(1, 1);
      
      expect(heatmapTool._selectedCell).toEqual({
        row: 1,
        col: 1,
        value: heatmapTool._processedData[1][1],
      });
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should ignore interactions when disabled', () => {
      heatmapTool.config.interactions.hover = false;
      heatmapTool.config.interactions.click = false;
      
      heatmapTool._handleCellHover(0, 0, true);
      heatmapTool._handleCellClick(0, 0);
      
      expect(heatmapTool._hoveredCell).toBe(null);
      expect(heatmapTool._selectedCell).toBe(null);
    });
  });

  describe('animation', () => {
    it('should initialize animations when enabled', () => {
      const config = { ...heatmapTool.config, animations: { enabled: true } };
      const tool = new HeatmapTool(mockToolset, config, {});
      
      expect(tool._cellAnimations.size).toBeGreaterThan(0);
    });

    it('should skip animations when disabled', () => {
      const config = { ...heatmapTool.config, animations: { enabled: false } };
      const tool = new HeatmapTool(mockToolset, config, {});
      
      expect(tool._animationProgress).toBe(1);
      expect(tool._cellAnimations.size).toBe(0);
    });

    it('should start animation', () => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
      
      heatmapTool._startAnimation();
      
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
      
      requestAnimationFrameSpy.mockRestore();
    });
  });

  describe('state management', () => {
    it('should update data when state changes', () => {
      const oldDataCount = heatmapTool._processedData.length;
      
      heatmapTool.value = 'new state';
      
      expect(heatmapTool._animationProgress).toBe(0);
    });
  });

  describe('rendering', () => {
    it('should render heatmap components', () => {
      const svg = require('lit-element').svg;
      svg.mockReturnValue('mock-svg');
      
      const result = heatmapTool.render();
      
      expect(svg).toHaveBeenCalled();
      expect(result).toBe('mock-svg');
    });
  });

  describe('statistics', () => {
    it('should return heatmap statistics', () => {
      const stats = heatmapTool.getStats();
      
      expect(stats.rows).toBe(4);
      expect(stats.cols).toBe(4);
      expect(stats.totalCells).toBe(16);
      expect(stats.minValue).toBeDefined();
      expect(stats.maxValue).toBeDefined();
      expect(stats.animationProgress).toBeDefined();
    });
  });

  describe('data export', () => {
    it('should export heatmap data', () => {
      const exportData = heatmapTool.exportData();
      
      expect(exportData).toHaveProperty('config');
      expect(exportData).toHaveProperty('data');
      expect(exportData).toHaveProperty('colorScale');
      expect(exportData).toHaveProperty('statistics');
      
      expect(exportData.data).toBe(heatmapTool._processedData);
      expect(exportData.colorScale).toBe(heatmapTool._colorScale);
    });
  });
});