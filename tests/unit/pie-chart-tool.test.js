import { describe, it, expect, beforeEach, vi } from 'vitest';
import PieChartTool from '../../src/tools/pie-chart-tool.js';

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

describe('PieChartTool', () => {
  let pieChartTool;
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
        radius: 40,
      },
      data: {
        source: 'fallback',
        fallback: [
          { label: 'Segment 1', value: 30, color: 'blue' },
          { label: 'Segment 2', value: 25, color: 'red' },
          { label: 'Segment 3', value: 20, color: 'green' },
          { label: 'Segment 4', value: 25, color: 'yellow' },
        ],
      },
    };
    
    pieChartTool = new PieChartTool(mockToolset, config, {});
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(pieChartTool.config.position.cx).toBe(50);
      expect(pieChartTool.config.position.cy).toBe(50);
      expect(pieChartTool.config.position.radius).toBe(40);
      expect(pieChartTool.config.colors.scheme).toBe('default');
    });

    it('should calculate geometry correctly', () => {
      expect(pieChartTool.svg.radius).toBe(40);
      expect(pieChartTool.svg.centerX).toBe(50);
      expect(pieChartTool.svg.centerY).toBe(50);
    });

    it('should process fallback data', () => {
      expect(pieChartTool._processedData).toHaveLength(4);
      expect(pieChartTool._totalValue).toBe(100);
    });

    it('should calculate segments', () => {
      expect(pieChartTool._segments).toHaveLength(4);
      expect(pieChartTool._segments[0]).toHaveProperty('path');
      expect(pieChartTool._segments[0]).toHaveProperty('labelX');
      expect(pieChartTool._segments[0]).toHaveProperty('labelY');
    });
  });

  describe('data processing', () => {
    it('should filter invalid data', () => {
      const config = {
        ...pieChartTool.config,
        data: {
          source: 'fallback',
          fallback: [
            { label: 'Valid', value: 30 },
            { label: 'Invalid', value: 'not a number' },
            { label: 'Zero', value: 0 },
            { label: 'Negative', value: -10 },
            { label: 'Another Valid', value: 20 },
          ],
        },
      };
      
      const tool = new PieChartTool(mockToolset, config, {});
      
      expect(tool._processedData).toHaveLength(2);
      expect(tool._processedData[0].value).toBe(30);
      expect(tool._processedData[1].value).toBe(20);
    });

    it('should calculate percentages correctly', () => {
      expect(pieChartTool._processedData[0].percentage).toBe(30);
      expect(pieChartTool._processedData[1].percentage).toBe(25);
      expect(pieChartTool._processedData[2].percentage).toBe(20);
      expect(pieChartTool._processedData[3].percentage).toBe(25);
    });

    it('should sort data by value descending', () => {
      expect(pieChartTool._processedData[0].value).toBe(30);
      expect(pieChartTool._processedData[1].value).toBe(25);
      expect(pieChartTool._processedData[2].value).toBe(20);
    });
  });

  describe('color management', () => {
    it('should use custom colors when provided', () => {
      const config = {
        ...pieChartTool.config,
        colors: {
          custom: ['custom1', 'custom2', 'custom3'],
        },
      };
      
      const tool = new PieChartTool(mockToolset, config, {});
      
      expect(tool._getSegmentColor(0)).toBe('custom1');
      expect(tool._getSegmentColor(1)).toBe('custom2');
      expect(tool._getSegmentColor(2)).toBe('custom3');
    });

    it('should use color scheme colors', () => {
      const config = {
        ...pieChartTool.config,
        colors: {
          scheme: 'material',
        },
      };
      
      const tool = new PieChartTool(mockToolset, config, {});
      
      expect(tool._getSegmentColor(0)).toBe('#1976D2');
      expect(tool._getSegmentColor(1)).toBe('#388E3C');
    });

    it('should cycle through color array', () => {
      const color = pieChartTool._getSegmentColor(10);
      expect(color).toBeDefined();
    });
  });

  describe('path generation', () => {
    it('should generate correct segment path', () => {
      const path = pieChartTool._createSegmentPath(0, 90, 40);
      
      expect(typeof path).toBe('string');
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should handle large arc flag correctly', () => {
      const path1 = pieChartTool._createSegmentPath(0, 90, 40);
      const path2 = pieChartTool._createSegmentPath(0, 200, 40);
      
      expect(path1).toContain(' 0 ');
      expect(path2).toContain(' 1 ');
    });
  });

  describe('label formatting', () => {
    it('should format percentage labels', () => {
      pieChartTool.config.labels.format = 'percentage';
      const label = pieChartTool._formatLabelText(pieChartTool._segments[0]);
      expect(label).toBe('30.0%');
    });

    it('should format value labels', () => {
      pieChartTool.config.labels.format = 'value';
      const label = pieChartTool._formatLabelText(pieChartTool._segments[0]);
      expect(label).toBe('30');
    });

    it('should format label labels', () => {
      pieChartTool.config.labels.format = 'label';
      const label = pieChartTool._formatLabelText(pieChartTool._segments[0]);
      expect(label).toBe('Segment 1');
    });

    it('should format both labels', () => {
      pieChartTool.config.labels.format = 'both';
      const label = pieChartTool._formatLabelText(pieChartTool._segments[0]);
      expect(label).toBe('Segment 1: 30.0%');
    });
  });

  describe('label visibility', () => {
    it('should show labels when above threshold', () => {
      pieChartTool.config.labels.threshold = 5;
      const shouldShow = pieChartTool._shouldShowLabel(pieChartTool._segments[0]);
      expect(shouldShow).toBe(true);
    });

    it('should hide labels when below threshold', () => {
      pieChartTool.config.labels.threshold = 35;
      const shouldShow = pieChartTool._shouldShowLabel(pieChartTool._segments[0]);
      expect(shouldShow).toBe(false);
    });

    it('should hide all labels when position is none', () => {
      pieChartTool.config.labels.position = 'none';
      const shouldShow = pieChartTool._shouldShowLabel(pieChartTool._segments[0]);
      expect(shouldShow).toBe(false);
    });
  });

  describe('interactions', () => {
    it('should handle segment hover', () => {
      pieChartTool.config.interactions.hover = true;
      
      pieChartTool._handleSegmentHover(0, true);
      expect(pieChartTool._hoveredSegment).toBe(pieChartTool._segments[0]);
      expect(pieChartTool._segments[0].hovered).toBe(true);
      
      pieChartTool._handleSegmentHover(0, false);
      expect(pieChartTool._hoveredSegment).toBe(null);
      expect(pieChartTool._segments[0].hovered).toBe(false);
    });

    it('should handle segment click', () => {
      const eventSpy = vi.fn();
      pieChartTool.addEventListener = vi.fn();
      pieChartTool.dispatchEvent = eventSpy;
      
      pieChartTool.config.interactions.click = true;
      pieChartTool._handleSegmentClick(0);
      
      expect(pieChartTool._selectedSegment).toBe(pieChartTool._segments[0]);
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should ignore interactions when disabled', () => {
      pieChartTool.config.interactions.hover = false;
      pieChartTool.config.interactions.click = false;
      
      pieChartTool._handleSegmentHover(0, true);
      pieChartTool._handleSegmentClick(0);
      
      expect(pieChartTool._hoveredSegment).toBe(null);
      expect(pieChartTool._selectedSegment).toBe(null);
    });
  });

  describe('animation', () => {
    it('should start animation when enabled', () => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
      
      pieChartTool.config.animations.enabled = true;
      pieChartTool._animateChart();
      
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
      
      requestAnimationFrameSpy.mockRestore();
    });

    it('should skip animation when disabled', () => {
      pieChartTool.config.animations.enabled = false;
      pieChartTool._animateChart();
      
      expect(pieChartTool._animationProgress).toBe(1);
    });

    it('should apply easing function', () => {
      expect(pieChartTool._easeOutCubic(0)).toBe(0);
      expect(pieChartTool._easeOutCubic(1)).toBe(1);
      expect(pieChartTool._easeOutCubic(0.5)).toBeCloseTo(0.875, 2);
    });
  });

  describe('state management', () => {
    it('should update data when state changes', () => {
      const oldDataCount = pieChartTool._processedData.length;
      
      pieChartTool.value = 'new state';
      
      expect(pieChartTool._animationProgress).toBe(0);
    });
  });

  describe('rendering', () => {
    it('should render chart components', () => {
      const svg = require('lit-element').svg;
      svg.mockReturnValue('mock-svg');
      
      const result = pieChartTool.render();
      
      expect(svg).toHaveBeenCalled();
      expect(result).toBe('mock-svg');
    });
  });

  describe('statistics', () => {
    it('should return chart statistics', () => {
      const stats = pieChartTool.getStats();
      
      expect(stats.totalValue).toBe(100);
      expect(stats.segmentCount).toBe(4);
      expect(stats.data).toBe(pieChartTool._processedData);
      expect(stats.animationProgress).toBeDefined();
    });
  });

  describe('data export', () => {
    it('should export chart data', () => {
      const exportData = pieChartTool.exportData();
      
      expect(exportData).toHaveProperty('config');
      expect(exportData).toHaveProperty('data');
      expect(exportData).toHaveProperty('segments');
      expect(exportData).toHaveProperty('total');
      
      expect(exportData.segments).toHaveLength(4);
      expect(exportData.total).toBe(100);
    });
  });
});