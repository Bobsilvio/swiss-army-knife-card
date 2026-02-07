import { describe, it, expect, beforeEach, vi } from 'vitest';
import ToolRegistry from '../../src/tool-registry.js';

describe('ToolRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    ToolRegistry.registeredTools.clear();
    ToolRegistry.toolCategories.clear();
    ToolRegistry.toolMetadata.clear();
  });

  describe('tool registration', () => {
    it('should register a new tool', () => {
      const mockToolClass = vi.fn();
      const metadata = {
        category: 'test',
        description: 'Test tool',
        version: '1.0.0',
      };
      
      ToolRegistry.registerTool('testTool', mockToolClass, metadata);
      
      expect(ToolRegistry.registeredTools.has('testTool')).toBe(true);
      expect(ToolRegistry.toolMetadata.has('testTool')).toBe(true);
      expect(ToolRegistry.toolCategories.has('test')).toBe(true);
    });

    it('should overwrite existing tool registration', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const mockTool1 = vi.fn();
      const mockTool2 = vi.fn();
      
      ToolRegistry.registerTool('testTool', mockTool1);
      ToolRegistry.registerTool('testTool', mockTool2);
      
      expect(ToolRegistry.registeredTools.get('testTool')).toBe(mockTool2);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered')
      );
      
      consoleSpy.mockRestore();
    });

    it('should add tool to category', () => {
      const mockTool = vi.fn();
      
      ToolRegistry.registerTool('testTool', mockTool, { category: 'visualization' });
      
      const categoryTools = ToolRegistry.getToolsByCategory('visualization');
      expect(categoryTools).toContain('testTool');
    });
  });

  describe('tool retrieval', () => {
    it('should get registered tool', async () => {
      const mockTool = vi.fn();
      ToolRegistry.registeredTools.set('testTool', mockTool);
      
      const tool = await ToolRegistry.getTool('testTool');
      
      expect(tool).toBe(mockTool);
    });

    it('should check if tool is registered', () => {
      ToolRegistry.registeredTools.set('testTool', vi.fn());
      
      expect(ToolRegistry.isToolRegistered('testTool')).toBe(true);
      expect(ToolRegistry.isToolRegistered('nonexistent')).toBe(false);
    });

    it('should get all registered tools', () => {
      ToolRegistry.registeredTools.set('tool1', vi.fn());
      ToolRegistry.registeredTools.set('tool2', vi.fn());
      
      const tools = ToolRegistry.getAllTools();
      
      expect(tools).toHaveLength(2);
      expect(tools).toContain('tool1');
      expect(tools).toContain('tool2');
    });
  });

  describe('metadata management', () => {
    it('should get tool metadata', () => {
      const metadata = {
        version: '2.0.0',
        category: 'test',
        description: 'Test description',
      };
      
      ToolRegistry.registerTool('testTool', vi.fn(), metadata);
      
      const retrievedMetadata = ToolRegistry.getToolMetadata('testTool');
      
      expect(retrievedMetadata.version).toBe('2.0.0');
      expect(retrievedMetadata.category).toBe('test');
      expect(retrievedMetadata.description).toBe('Test description');
    });

    it('should return empty metadata for unknown tool', () => {
      const metadata = ToolRegistry.getToolMetadata('unknown');
      
      expect(metadata).toEqual({});
    });
  });

  describe('category management', () => {
    it('should get all categories', () => {
      ToolRegistry.registerTool('tool1', vi.fn(), { category: 'basic' });
      ToolRegistry.registerTool('tool2', vi.fn(), { category: 'advanced' });
      
      const categories = ToolRegistry.getAllCategories();
      
      expect(categories).toHaveLength(2);
      expect(categories).toContain('basic');
      expect(categories).toContain('advanced');
    });

    it('should return empty array for no categories', () => {
      const categories = ToolRegistry.getAllCategories();
      
      expect(categories).toHaveLength(0);
    });
  });

  describe('configuration validation', () => {
    it('should validate valid configuration', () => {
      ToolRegistry.registerTool('testTool', vi.fn(), {
        category: 'test',
        dependencies: [],
      });
      
      const validation = ToolRegistry.validateToolConfig('testTool', {});
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should identify unknown tool', () => {
      const validation = ToolRegistry.validateToolConfig('unknown', {});
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Unknown tool type: unknown');
    });

    it('should warn about deprecated tools', () => {
      ToolRegistry.registerTool('oldTool', vi.fn(), {
        category: 'test',
        deprecated: true,
      });
      
      const validation = ToolRegistry.validateToolConfig('oldTool', {});
      
      expect(validation.warnings).toContain(
        expect.stringContaining('deprecated')
      );
    });

    it('should warn about experimental tools', () => {
      ToolRegistry.registerTool('expTool', vi.fn(), {
        category: 'test',
        experimental: true,
      });
      
      const validation = ToolRegistry.validateToolConfig('expTool', {});
      
      expect(validation.warnings).toContain(
        expect.stringContaining('experimental')
      );
    });

    it('should identify missing dependencies', () => {
      ToolRegistry.registerTool('toolWithDep', vi.fn(), {
        category: 'test',
        dependencies: ['missingDep'],
      });
      
      const validation = ToolRegistry.validateToolConfig('toolWithDep', {});
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing dependency: missingDep');
    });
  });

  describe('statistics', () => {
    it('should calculate registry statistics', () => {
      ToolRegistry.registerBuiltinTool('circle', {
        category: 'basic',
        critical: true,
      });
      ToolRegistry.registerBuiltinTool('gauge', {
        category: 'visualization',
        critical: false,
      });
      
      const stats = ToolRegistry.getStatistics();
      
      expect(stats.totalTools).toBe(2);
      expect(stats.categories).toBe(2);
      expect(stats.criticalTools).toBe(1);
      expect(stats.bundleSize).toBeDefined();
    });
  });

  describe('optimization recommendations', () => {
    it('should generate optimization recommendations', () => {
      ToolRegistry.registerBuiltinTool('circle', { critical: true });
      ToolRegistry.registerBuiltinTool('gauge', { critical: false });
      
      const recommendations = ToolRegistry.getOptimizationRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('message');
        expect(rec).toHaveProperty('action');
      });
    });
  });

  describe('data export', () => {
    it('should export registry information', () => {
      ToolRegistry.registerBuiltinTool('testTool', {
        category: 'test',
        description: 'Test tool',
      });
      
      const exportData = ToolRegistry.exportRegistryInfo();
      
      expect(exportData).toHaveProperty('tools');
      expect(exportData).toHaveProperty('metadata');
      expect(exportData).toHaveProperty('categories');
      expect(exportData).toHaveProperty('statistics');
      expect(exportData).toHaveProperty('recommendations');
    });
  });
});