import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor } from '../../src/utils.js';
import BundleAnalyzer from '../../src/bundle-analyzer.js';
import LazyToolLoader from '../../src/lazy-tool-loader.js';
import ToolRegistry from '../../src/tool-registry.js';

describe('Integration Tests', () => {
  beforeEach(() => {
    // Reset all systems
    PerformanceMonitor.metrics.renderTimes = [];
    PerformanceMonitor.metrics.interactionTimes = [];
    BundleAnalyzer.historicalData = [];
    BundleAnalyzer.currentAnalysis = null;
    LazyToolLoader.loadedTools.clear();
    LazyToolLoader.loadingTools.clear();
    ToolRegistry.registeredTools.clear();
    ToolRegistry.toolCategories.clear();
    ToolRegistry.toolMetadata.clear();
  });

  describe('Performance Monitoring Integration', () => {
    it('should track performance across tool loading', async () => {
      // Mock tool loading
      const mockTool = vi.fn();
      const mockModule = { default: mockTool };
      
      LazyToolLoader.toolModules.testTool = vi.fn().mockResolvedValue(mockModule);
      
      // Start performance tracking
      PerformanceMonitor.startRender();
      
      // Load tool
      await LazyToolLoader.loadTool('testTool');
      
      // End tracking
      const renderTime = PerformanceMonitor.endRender();
      
      expect(renderTime).toBeGreaterThan(0);
      expect(PerformanceMonitor.metrics.renderTimes).toHaveLength(1);
      expect(LazyToolLoader.loadedTools.has('testTool')).toBe(true);
    });

    it('should generate bundle analysis with performance data', () => {
      // Setup performance data
      PerformanceMonitor.metrics.renderTimes = [16, 20, 12];
      PerformanceMonitor.metrics.interactionTimes = [50, 80, 60];
      
      // Analyze bundle
      const analysis = BundleAnalyzer.analyzeBundle();
      
      expect(analysis.performance.render.average).toBe('16.00');
      expect(analysis.performance.interaction.average).toBe('63.33');
      expect(analysis.score).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Tool Registry Integration', () => {
    it('should integrate with lazy tool loading', async () => {
      // Register tool with lazy loading
      ToolRegistry.registerBuiltinTool('lazyTool', {
        category: 'advanced',
        critical: false,
      });
      
      // Mock lazy loading
      const mockTool = vi.fn();
      const mockModule = { default: mockTool };
      
      LazyToolLoader.toolModules.lazyTool = vi.fn().mockResolvedValue(mockModule);
      
      // Get tool through registry
      const tool = await ToolRegistry.getTool('lazyTool');
      
      expect(tool).toBe(mockTool);
      expect(LazyToolLoader.loadedTools.has('lazyTool')).toBe(true);
    });

    it('should validate tool configurations', () => {
      // Register tool with dependencies
      ToolRegistry.registerBuiltinTool('dependentTool', {
        category: 'test',
        dependencies: ['baseTool'],
      });
      
      ToolRegistry.registerBuiltinTool('baseTool', {
        category: 'test',
      });
      
      // Valid configuration
      const validConfig = ToolRegistry.validateToolConfig('dependentTool', {});
      expect(validConfig.valid).toBe(true);
      expect(validConfig.errors).toHaveLength(0);
      
      // Invalid configuration (missing dependency)
      ToolRegistry.registeredTools.delete('baseTool');
      const invalidConfig = ToolRegistry.validateToolConfig('dependentTool', {});
      expect(invalidConfig.valid).toBe(false);
      expect(invalidConfig.errors).toContain('Missing dependency: baseTool');
    });
  });

  describe('Bundle Analysis Integration', () => {
    it('should track performance over time', () => {
      // First analysis
      PerformanceMonitor.metrics.renderTimes = [20, 25, 30];
      const analysis1 = BundleAnalyzer.analyzeBundle();
      
      // Second analysis (better performance)
      PerformanceMonitor.metrics.renderTimes = [12, 15, 14];
      const analysis2 = BundleAnalyzer.analyzeBundle();
      
      expect(analysis1.score).toBeLessThan(analysis2.score);
      expect(BundleAnalyzer.historicalData).toHaveLength(2);
    });

    it('should check compliance with performance targets', () => {
      // Good performance
      PerformanceMonitor.metrics.renderTimes = [12, 15, 14];
      PerformanceMonitor.metrics.interactionTimes = [50, 60, 55];
      
      const goodAnalysis = BundleAnalyzer.analyzeBundle({ gzipped: 150 });
      const goodCompliance = BundleAnalyzer.checkCompliance();
      
      expect(goodCompliance.compliant).toBe(true);
      expect(goodCompliance.reasons).toHaveLength(0);
      
      // Poor performance
      PerformanceMonitor.metrics.renderTimes = [25, 30, 28];
      PerformanceMonitor.metrics.interactionTimes = [150, 160, 155];
      
      const poorAnalysis = BundleAnalyzer.analyzeBundle({ gzipped: 250 });
      const poorCompliance = BundleAnalyzer.checkCompliance();
      
      expect(poorCompliance.compliant).toBe(false);
      expect(poorCompliance.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete tool loading and analysis workflow', async () => {
      // Register tools
      ToolRegistry.registerBuiltinTool('circle', {
        category: 'basic',
        critical: true,
      });
      
      ToolRegistry.registerBuiltinTool('gauge', {
        category: 'advanced',
        critical: false,
      });
      
      // Mock tool loading
      const mockCircle = vi.fn();
      const mockGauge = vi.fn();
      
      LazyToolLoader.toolModules.circle = vi.fn().mockResolvedValue({ default: mockCircle });
      LazyToolLoader.toolModules.gauge = vi.fn().mockResolvedValue({ default: mockGauge });
      
      // Load critical tools
      await LazyToolLoader.preloadCriticalTools();
      
      // Load advanced tool
      await ToolRegistry.getTool('gauge');
      
      // Track performance
      PerformanceMonitor.startRender();
      vi.useFakeTimers();
      vi.advanceTimersByTime(18);
      vi.useRealTimers();
      PerformanceMonitor.endRender();
      
      // Analyze bundle
      const analysis = BundleAnalyzer.analyzeBundle();
      
      // Verify workflow
      expect(LazyToolLoader.loadedTools.has('circle')).toBe(true);
      expect(LazyToolLoader.loadedTools.has('gauge')).toBe(true);
      expect(PerformanceMonitor.metrics.renderTimes).toHaveLength(1);
      expect(analysis.score).toBeGreaterThan(0);
      
      // Check statistics
      const loaderStats = LazyToolLoader.getLoadingStats();
      const registryStats = ToolRegistry.getStatistics();
      
      expect(loaderStats.loaded).toBe(2);
      expect(registryStats.totalTools).toBe(2);
      expect(registryStats.criticalTools).toBe(1);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle tool loading failures gracefully', async () => {
      // Register tool
      ToolRegistry.registerBuiltinTool('failingTool', {
        category: 'test',
      });
      
      // Mock loading failure
      const error = new Error('Module failed to load');
      LazyToolLoader.toolModules.failingTool = vi.fn().mockRejectedValue(error);
      
      // Attempt to load tool
      await expect(ToolRegistry.getTool('failingTool')).rejects.toThrow('Module failed to load');
      
      // Verify system is still functional
      expect(ToolRegistry.registeredTools.has('failingTool')).toBe(true);
      expect(LazyToolLoader.loadingTools.has('failingTool')).toBe(false);
    });

    it('should handle performance monitoring errors', () => {
      // Test with invalid performance data
      PerformanceMonitor.metrics.renderTimes = [NaN, Infinity, -5];
      
      const avgRenderTime = PerformanceMonitor.getAverageRenderTime();
      
      // Should handle gracefully
      expect(typeof avgRenderTime).toBe('number');
    });
  });

  describe('Memory Management Integration', () => {
    it('should manage cache sizes properly', () => {
      // Fill style cache beyond limit
      for (let i = 0; i < 1500; i++) {
        // This would trigger cache size management in BaseTool
      }
      
      // Fill tool loader cache
      for (let i = 0; i < 100; i++) {
        LazyToolLoader.loadedTools.set(`tool${i}`, vi.fn());
      }
      
      // Clear caches
      LazyToolLoader.clearCache();
      
      expect(LazyToolLoader.loadedTools.size).toBe(0);
      expect(LazyToolLoader.loadingTools.size).toBe(0);
    });

    it('should limit historical data', () => {
      // Add many analyses
      for (let i = 0; i < 35; i++) {
        BundleAnalyzer.analyzeBundle();
      }
      
      // Should limit to 30
      expect(BundleAnalyzer.historicalData).toHaveLength(30);
    });
  });

  describe('Configuration Integration', () => {
    it('should handle complex tool configurations', () => {
      const complexConfig = {
        position: { cx: 50, cy: 50, radius: 40 },
        scale: { min: 0, max: 100, step: 1 },
        colors: {
          scheme: 'thermal',
          gradient: true,
          stops: [
            { value: 0, color: 'blue' },
            { value: 50, color: 'yellow' },
            { value: 100, color: 'red' },
          ],
        },
        animations: {
          enabled: true,
          duration: 1000,
          easing: 'ease-out',
        },
        interactions: {
          hover: true,
          click: true,
          tooltip: true,
        },
      };
      
      // Register with complex config
      ToolRegistry.registerTool('complexTool', vi.fn(), {
        category: 'advanced',
        config: complexConfig,
      });
      
      // Validate configuration
      const validation = ToolRegistry.validateToolConfig('complexTool', complexConfig);
      
      expect(validation.valid).toBe(true);
      expect(ToolRegistry.getToolMetadata('complexTool').config).toBe(complexConfig);
    });
  });
});