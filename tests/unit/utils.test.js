import { describe, it, expect, beforeEach, vi } from 'vitest';
import Utils from '../../src/utils.js';
import { PerformanceMonitor } from '../../src/utils.js';

describe('Utils', () => {
  describe('calculateValueBetween', () => {
    it('should return 0 for invalid values', () => {
      expect(Utils.calculateValueBetween(0, 100, NaN)).toBe(0);
      expect(Utils.calculateValueBetween(0, 100, null)).toBe(0);
      expect(Utils.calculateValueBetween(0, 100, false)).toBe(0);
    });

    it('should return 0 for values outside range', () => {
      expect(Utils.calculateValueBetween(0, 100, -50)).toBe(0);
      expect(Utils.calculateValueBetween(0, 100, 150)).toBe(0);
    });

    it('should return fractional value for valid inputs', () => {
      expect(Utils.calculateValueBetween(0, 100, 50)).toBe(0.5);
      expect(Utils.calculateValueBetween(0, 100, 25)).toBe(0.25);
      expect(Utils.calculateValueBetween(0, 100, 75)).toBe(0.75);
    });

    it('should handle edge cases', () => {
      expect(Utils.calculateValueBetween(0, 100, 0)).toBe(0);
      expect(Utils.calculateValueBetween(0, 100, 100)).toBe(1);
    });
  });

  describe('calculateSvgCoordinate', () => {
    it('should calculate coordinates correctly', () => {
      expect(Utils.calculateSvgCoordinate(50, 0)).toBe(100);
      expect(Utils.calculateSvgCoordinate(25, 50)).toBe(100);
      expect(Utils.calculateSvgCoordinate(75, 50)).toBe(200);
    });
  });

  describe('calculateSvgDimension', () => {
    it('should calculate dimensions correctly', () => {
      expect(Utils.calculateSvgDimension(50)).toBe(100);
      expect(Utils.calculateSvgDimension('25%')).toBe(50);
      expect(Utils.calculateSvgDimension('75%')).toBe(150);
    });
  });
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Clear metrics before each test
    PerformanceMonitor.metrics.renderTimes = [];
    PerformanceMonitor.metrics.interactionTimes = [];
    PerformanceMonitor.metrics.memoryUsage = [];
  });

  describe('render tracking', () => {
    it('should track render times', () => {
      PerformanceMonitor.startRender();
      // Simulate some work
      vi.useFakeTimers();
      vi.advanceTimersByTime(20);
      vi.useRealTimers();
      
      const renderTime = PerformanceMonitor.endRender();
      
      expect(renderTime).toBeGreaterThan(15);
      expect(PerformanceMonitor.metrics.renderTimes).toHaveLength(1);
      expect(PerformanceMonitor.metrics.renderTimes[0]).toBe(renderTime);
    });

    it('should warn for slow renders', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      PerformanceMonitor.startRender();
      vi.useFakeTimers();
      vi.advanceTimersByTime(25); // > 16ms threshold
      vi.useRealTimers();
      
      PerformanceMonitor.endRender();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow render detected')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('interaction tracking', () => {
    it('should track interaction times', () => {
      const endInteraction = PerformanceMonitor.trackInteraction();
      
      // Simulate interaction work
      vi.useFakeTimers();
      vi.advanceTimersByTime(50);
      vi.useRealTimers();
      
      endInteraction();
      
      expect(PerformanceMonitor.metrics.interactionTimes).toHaveLength(1);
      expect(PerformanceMonitor.metrics.interactionTimes[0]).toBe(50);
    });

    it('should warn for slow interactions', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const endInteraction = PerformanceMonitor.trackInteraction();
      
      vi.useFakeTimers();
      vi.advanceTimersByTime(150); // > 100ms threshold
      vi.useRealTimers();
      
      endInteraction();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow interaction')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('metrics calculation', () => {
    it('should calculate average render time', () => {
      PerformanceMonitor.metrics.renderTimes = [10, 20, 30];
      expect(PerformanceMonitor.getAverageRenderTime()).toBe(20);
    });

    it('should return 0 for no render times', () => {
      PerformanceMonitor.metrics.renderTimes = [];
      expect(PerformanceMonitor.getAverageRenderTime()).toBe(0);
    });

    it('should calculate average interaction time', () => {
      PerformanceMonitor.metrics.interactionTimes = [50, 100, 150];
      expect(PerformanceMonitor.getAverageInteractionTime()).toBe(100);
    });

    it('should return 0 for no interaction times', () => {
      PerformanceMonitor.metrics.interactionTimes = [];
      expect(PerformanceMonitor.getAverageInteractionTime()).toBe(0);
    });
  });

  describe('logging', () => {
    it('should log current metrics', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      PerformanceMonitor.metrics.renderTimes = [16];
      PerformanceMonitor.metrics.interactionTimes = [50];
      
      PerformanceMonitor.logMetrics();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[SAK Performance Metrics]',
        expect.objectContaining({
          avgRenderTime: expect.stringContaining('16.00ms'),
          avgInteractionTime: expect.stringContaining('50.00ms'),
          samples: 1,
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
});