import { describe, it, expect, beforeEach, vi } from 'vitest';
import GaugeTool from '../../src/tools/gauge-tool.js';

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

describe('GaugeTool', () => {
  let gaugeTool;
  let mockToolset;
  let mockCard;

  beforeEach(() => {
    mockCard = {
      dev: { debug: false },
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
      scale: {
        min: 0,
        max: 100,
      },
    };
    
    gaugeTool = new GaugeTool(mockToolset, config, {});
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(gaugeTool.config.scale.min).toBe(0);
      expect(gaugeTool.config.scale.max).toBe(100);
      expect(gaugeTool.config.gauge.start_angle).toBe(-135);
      expect(gaugeTool.config.gauge.end_angle).toBe(135);
    });

    it('should calculate gauge geometry', () => {
      expect(gaugeTool.svg.radius).toBe(40);
      expect(gaugeTool.gaugeGeometry).toBeDefined();
      expect(gaugeTool.gaugeGeometry.centerX).toBe(50);
      expect(gaugeTool.gaugeGeometry.centerY).toBe(50);
    });

    it('should calculate ticks', () => {
      expect(gaugeTool.ticks).toBeDefined();
      expect(gaugeTool.ticks.length).toBeGreaterThan(0);
    });
  });

  describe('value conversion', () => {
    it('should convert value to angle correctly', () => {
      const minAngle = gaugeTool._valueToAngle(0);
      const maxAngle = gaugeTool._valueToAngle(100);
      const midAngle = gaugeTool._valueToAngle(50);
      
      expect(minAngle).toBe(gaugeTool.svg.startAngle);
      expect(maxAngle).toBe(gaugeTool.svg.endAngle);
      expect(midAngle).toBe((gaugeTool.svg.startAngle + gaugeTool.svg.endAngle) / 2);
    });

    it('should clamp values to scale range', () => {
      const minAngle = gaugeTool._valueToAngle(-10);
      const maxAngle = gaugeTool._valueToAngle(150);
      
      expect(minAngle).toBe(gaugeTool.svg.startAngle);
      expect(maxAngle).toBe(gaugeTool.svg.endAngle);
    });
  });

  describe('color management', () => {
    it('should return default color for non-gradient', () => {
      gaugeTool.config.colors.gradient = false;
      const color = gaugeTool._getValueColor(50);
      
      expect(color).toBe(gaugeTool.config.colors.value || gaugeTool.config.colors.track);
    });

    it('should interpolate gradient colors', () => {
      gaugeTool.config.colors.gradient = true;
      gaugeTool.config.colors.stops = [
        { value: 0, color: 'blue' },
        { value: 100, color: 'red' },
      ];
      
      const lowColor = gaugeTool._getValueColor(25);
      const highColor = gaugeTool._getValueColor(75);
      
      expect(lowColor).toBeDefined();
      expect(highColor).toBeDefined();
    });
  });

  describe('animation', () => {
    it('should update value with animation', () => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
      
      gaugeTool.config.animations.enabled = true;
      gaugeTool._updateValue(75);
      
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
      
      requestAnimationFrameSpy.mockRestore();
    });

    it('should update value immediately when animation disabled', () => {
      gaugeTool.config.animations.enabled = false;
      gaugeTool._updateValue(75);
      
      expect(gaugeTool._displayValue).toBe(75);
      expect(gaugeTool._pointerAngle).toBe(gaugeTool._valueToAngle(75));
    });
  });

  describe('state management', () => {
    it('should set value from state', () => {
      gaugeTool.value = '50';
      
      expect(gaugeTool._currentValue).toBe(50);
      expect(gaugeTool._displayValue).toBe(50);
    });

    it('should handle invalid state values', () => {
      gaugeTool.value = 'invalid';
      
      expect(gaugeTool._currentValue).toBe(gaugeTool.config.scale.min);
    });

    it('should clamp values to scale range', () => {
      gaugeTool.value = '150';
      
      expect(gaugeTool._currentValue).toBe(gaugeTool.config.scale.max);
    });
  });

  describe('path generation', () => {
    it('should generate correct segment path', () => {
      const path = gaugeTool._angleToPath(-135, 0, 40, 32);
      
      expect(typeof path).toBe('string');
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should generate different paths for different angles', () => {
      const path1 = gaugeTool._angleToPath(-135, 0, 40, 32);
      const path2 = gaugeTool._angleToPath(0, 135, 40, 32);
      
      expect(path1).not.toBe(path2);
    });
  });

  describe('tick formatting', () => {
    it('should format integer tick labels', () => {
      const label = gaugeTool._formatTickLabel(50);
      expect(label).toBe('50');
    });

    it('should format decimal tick labels', () => {
      const label = gaugeTool._formatTickLabel(50.5);
      expect(label).toBe('50.5');
    });
  });

  describe('rendering', () => {
    it('should render gauge components', () => {
      const svg = require('lit-element').svg;
      svg.mockReturnValue('mock-svg');
      
      const result = gaugeTool.render();
      
      expect(svg).toHaveBeenCalled();
      expect(result).toBe('mock-svg');
    });
  });

  describe('statistics', () => {
    it('should return gauge statistics', () => {
      gaugeTool._currentValue = 75;
      gaugeTool._displayValue = 75;
      gaugeTool._pointerAngle = 45;
      
      const stats = gaugeTool.getStats();
      
      expect(stats.value).toBe(75);
      expect(stats.displayValue).toBe(75);
      expect(stats.angle).toBe(45);
      expect(stats.percentage).toBe('75.0');
      expect(stats.geometry).toBeDefined();
      expect(stats.tickCount).toBe(gaugeTool.ticks.length);
    });
  });

  describe('easing functions', () => {
    it('should apply ease-out cubic easing', () => {
      expect(gaugeTool._easeOutCubic(0)).toBe(0);
      expect(gaugeTool._easeOutCubic(1)).toBe(1);
      expect(gaugeTool._easeOutCubic(0.5)).toBeCloseTo(0.875, 2);
    });
  });
});