import { describe, it, expect, beforeEach, vi } from 'vitest';
import LazyToolLoader from '../../src/lazy-tool-loader.js';

describe('LazyToolLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    LazyToolLoader.loadedTools.clear();
    LazyToolLoader.loadingTools.clear();
  });

  describe('tool loading', () => {
    it('should load a tool successfully', async () => {
      // Mock dynamic import
      const mockTool = vi.fn();
      const mockModule = { default: mockTool };
      
      vi.mock('../src/tools/gauge-tool.js', () => mockModule);
      
      // Mock the toolModules
      LazyToolLoader.toolModules.gauge = vi.fn().mockResolvedValue(mockModule);
      
      const tool = await LazyToolLoader.loadTool('gauge');
      
      expect(tool).toBe(mockTool);
      expect(LazyToolLoader.loadedTools.has('gauge')).toBe(true);
      expect(LazyToolLoader.loadingTools.has('gauge')).toBe(false);
    });

    it('should return cached tool', async () => {
      const mockTool = vi.fn();
      LazyToolLoader.loadedTools.set('circle', mockTool);
      
      const tool = await LazyToolLoader.loadTool('circle');
      
      expect(tool).toBe(mockTool);
      expect(LazyToolLoader.toolModules.circle).not.toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      const error = new Error('Module not found');
      LazyToolLoader.toolModules.unknown = vi.fn().mockRejectedValue(error);
      
      await expect(LazyToolLoader.loadTool('unknown')).rejects.toThrow('Module not found');
      expect(LazyToolLoader.loadingTools.has('unknown')).toBe(false);
    });

    it('should handle unknown tool types', async () => {
      await expect(LazyToolLoader.loadTool('nonexistent')).rejects.toThrow('Unknown tool type: nonexistent');
    });
  });

  describe('statistics', () => {
    it('should return loading statistics', () => {
      LazyToolLoader.loadedTools.set('circle', vi.fn());
      LazyToolLoader.loadingTools.set('gauge', Promise.resolve(vi.fn()));
      
      const stats = LazyToolLoader.getLoadingStats();
      
      expect(stats.loaded).toBe(1);
      expect(stats.loading).toBe(1);
      expect(stats.available).toBe(Object.keys(LazyToolLoader.toolModules).length);
      expect(stats.loadedTools).toContain('circle');
      expect(stats.loadingTools).toContain('gauge');
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      LazyToolLoader.loadedTools.set('circle', vi.fn());
      LazyToolLoader.loadingTools.set('gauge', Promise.resolve(vi.fn()));
      
      LazyToolLoader.clearCache();
      
      expect(LazyToolLoader.loadedTools.size).toBe(0);
      expect(LazyToolLoader.loadingTools.size).toBe(0);
    });
  });

  describe('bundle size info', () => {
    it('should return bundle size information', () => {
      const info = LazyToolLoader.getBundleSizeInfo();
      
      expect(info).toHaveProperty('core');
      expect(info).toHaveProperty('advanced');
      expect(info).toHaveProperty('entity');
      expect(info).toHaveProperty('interactive');
      expect(info).toHaveProperty('total');
      expect(info).toHaveProperty('gzipped');
      
      expect(info.core).toContain('KB');
      expect(info.gzipped).toContain('~175KB');
    });
  });

  describe('preload functionality', () => {
    it('should preload critical tools', async () => {
      const mockTool = vi.fn();
      const mockModule = { default: mockTool };
      
      // Mock critical tools
      LazyToolLoader.toolModules.circle = vi.fn().mockResolvedValue(mockModule);
      LazyToolLoader.toolModules.line = vi.fn().mockResolvedValue(mockModule);
      LazyToolLoader.toolModules.text = vi.fn().mockResolvedValue(mockModule);
      LazyToolLoader.toolModules.rectangle = vi.fn().mockResolvedValue(mockModule);
      
      await LazyToolLoader.preloadCriticalTools();
      
      // Check that critical tools were loaded
      expect(LazyToolLoader.toolModules.circle).toHaveBeenCalled();
      expect(LazyToolLoader.toolModules.line).toHaveBeenCalled();
      expect(LazyToolLoader.toolModules.text).toHaveBeenCalled();
      expect(LazyToolLoader.toolModules.rectangle).toHaveBeenCalled();
    });

    it('should preload all tools', async () => {
      const mockTool = vi.fn();
      const mockModule = { default: mockTool };
      
      // Mock all tools
      Object.keys(LazyToolLoader.toolModules).forEach(toolType => {
        LazyToolLoader.toolModules[toolType] = vi.fn().mockResolvedValue(mockModule);
      });
      
      await LazyToolLoader.preloadAllTools();
      
      // Check that all tools were loaded
      Object.keys(LazyToolLoader.toolModules).forEach(toolType => {
        expect(LazyToolLoader.toolModules[toolType]).toHaveBeenCalled();
      });
    });
  });
});