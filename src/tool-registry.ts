/** ***************************************************************************
  * ToolRegistry class
  *
  * Summary.
  * Centralized tool registration and management system
  */

import LazyToolLoader from './lazy-tool-loader.js';

export default class ToolRegistry {

[key: string]: any;


  static registeredTools = new Map();

  static toolCategories = new Map();

  static toolMetadata = new Map();

  constructor() {
    this.initializeBuiltinTools();
  }

  /**
   * Register a new tool type
   */
  static registerTool(toolType, toolClass, metadata = {} as Record<string, any>) {
    if (this.registeredTools.has(toolType)) {
      console.warn(`[SAK] Tool "${toolType}" is already registered. Overwriting...`);
    }

    this.registeredTools.set(toolType, toolClass);
    this.toolMetadata.set(toolType, {
      version: metadata.version || '1.0.0',
      category: metadata.category || 'custom',
      description: metadata.description || '',
      author: metadata.author || 'Unknown',
      deprecated: metadata.deprecated || false,
      experimental: metadata.experimental || false,
      dependencies: metadata.dependencies || [],
      bundleSize: metadata.bundleSize || 0,
      ...metadata,
    });

    // Register in category
    const category = metadata.category || 'custom';
    if (!this.toolCategories.has(category)) {
      this.toolCategories.set(category, new Set());
    }
    this.toolCategories.get(category).add(toolType);

    console.log(`[SAK] Tool "${toolType}" registered in category "${category}"`);
  }

  /**
   * Get tool class by type
   */
  static async getTool(toolType) {

    // First try to get from registry
    if (this.registeredTools.has(toolType)) {
      const toolClass = this.registeredTools.get(toolType);

      // If it's a lazy-loaded tool, load it first
      if (typeof toolClass === 'function' && toolClass.name === 'loadTool') {
        return LazyToolLoader.loadTool(toolType);
      }

      return toolClass;
    }

    // Try to load lazily
    try {
      return LazyToolLoader.loadTool(toolType);
    } catch (error) {
      throw new Error(`Tool "${toolType}" not found and failed to load: ${error.message}`);
    }
  }

  /**
   * Check if tool is registered
   */
  static isToolRegistered(toolType) {
    return this.registeredTools.has(toolType) || (LazyToolLoader as any).isToolAvailable(toolType);
  }

  /**
   * Get all registered tool types
   */
  static getAllTools() {
    return Array.from(this.registeredTools.keys());
  }

  /**
   * Get tools by category
   */
  static getToolsByCategory(category) {
    const tools = this.toolCategories.get(category);
    return tools ? Array.from(tools) : [];
  }

  /**
   * Get tool metadata
   */
  static getToolMetadata(toolType) {
    return this.toolMetadata.get(toolType) || {};
  }

  /**
   * Get all categories
   */
  static getAllCategories() {
    return Array.from(this.toolCategories.keys());
  }

  /**
   * Initialize built-in tools
   */
  static initializeBuiltinTools() {
    // Core tools (always available)
    this.registerBuiltinTool('circle', {
      category: 'basic',
      description: 'Circular shape tool',
      bundleSize: 3,
      critical: true,
    });

    this.registerBuiltinTool('line', {
      category: 'basic',
      description: 'Line tool',
      bundleSize: 2,
      critical: true,
    });

    this.registerBuiltinTool('text', {
      category: 'basic',
      description: 'Text display tool',
      bundleSize: 4,
      critical: true,
    });

    this.registerBuiltinTool('rectangle', {
      category: 'basic',
      description: 'Rectangle shape tool',
      bundleSize: 3,
      critical: true,
    });

    this.registerBuiltinTool('ellipse', {
      category: 'basic',
      description: 'Ellipse shape tool',
      bundleSize: 3,
    });

    // Advanced tools (lazy loaded)
    this.registerBuiltinTool('gauge', {
      category: 'visualization',
      description: 'Advanced gauge visualization',
      bundleSize: 8,
      experimental: false,
    });

    this.registerBuiltinTool('pieChart', {
      category: 'visualization',
      description: 'Pie chart visualization',
      bundleSize: 10,
      experimental: false,
    });

    this.registerBuiltinTool('heatmap', {
      category: 'visualization',
      description: 'Heatmap visualization',
      bundleSize: 12,
      experimental: true,
    });

    // Entity tools
    this.registerBuiltinTool('entityState', {
      category: 'entity',
      description: 'Entity state display',
      bundleSize: 5,
      critical: true,
    });

    this.registerBuiltinTool('entityIcon', {
      category: 'entity',
      description: 'Entity icon display',
      bundleSize: 6,
    });

    this.registerBuiltinTool('entityName', {
      category: 'entity',
      description: 'Entity name display',
      bundleSize: 4,
    });

    // Interactive tools
    this.registerBuiltinTool('circularSlider', {
      category: 'interactive',
      description: 'Circular slider control',
      bundleSize: 8,
    });

    this.registerBuiltinTool('rangeSlider', {
      category: 'interactive',
      description: 'Range slider control',
      bundleSize: 9,
    });

    this.registerBuiltinTool('switch', {
      category: 'interactive',
      description: 'Switch control',
      bundleSize: 6,
    });

    // Initialize lazy loading for non-critical tools
    this.initializeLazyTools();
  }

  /**
   * Register a built-in tool
   */
  static registerBuiltinTool(toolType, metadata) {
    if (metadata.critical) {
      // Critical tools are registered immediately
      this.registeredTools.set(toolType, toolType);
    } else {
      // Non-critical tools are marked for lazy loading
      this.registeredTools.set(toolType, () => LazyToolLoader.loadTool(toolType));
    }

    this.toolMetadata.set(toolType, {
      builtIn: true,
      version: '3.0.0',
      ...metadata,
    });

    // Register in category
    const category = metadata.category;
    if (!this.toolCategories.has(category)) {
      this.toolCategories.set(category, new Set());
    }
    this.toolCategories.get(category).add(toolType);
  }

  /**
   * Initialize lazy loading for advanced tools
   */
  static initializeLazyTools() {
    // Preload critical tools in background
    setTimeout(() => {
      LazyToolLoader.preloadCriticalTools();
    }, 100);
  }

  /**
   * Get registry statistics
   */
  static getStatistics() {
    const totalTools = this.registeredTools.size;
    const categories = this.toolCategories.size;
    const criticalTools = Array.from(this.toolMetadata.entries())
      .filter(([, metadata]) => metadata.critical)
      .length;
    const experimentalTools = Array.from(this.toolMetadata.entries())
      .filter(([, metadata]) => metadata.experimental)
      .length;
    const deprecatedTools = Array.from(this.toolMetadata.entries())
      .filter(([, metadata]) => metadata.deprecated)
      .length;

    return {
      totalTools,
      categories,
      criticalTools,
      experimentalTools,
      deprecatedTools,
      loadingStats: LazyToolLoader.getLoadingStats(),
      bundleSize: LazyToolLoader.getBundleSizeInfo(),
    };
  }

  /**
   * Validate tool configuration
   */
  static validateToolConfig(toolType, config) {
    const metadata = this.getToolMetadata(toolType);

    if (!metadata) {
      return { valid: false, errors: [`Unknown tool type: ${toolType}`] };
    }

    const errors = [];
    const warnings = [];

    // Check deprecated tools
    if (metadata.deprecated) {
      warnings.push(`Tool "${toolType}" is deprecated. Consider using alternatives.`);
    }

    // Check experimental tools
    if (metadata.experimental) {
      warnings.push(`Tool "${toolType}" is experimental. May change in future versions.`);
    }

    // Check dependencies
    if (metadata.dependencies) {
      metadata.dependencies.forEach((dep) => {
        if (!this.isToolRegistered(dep)) {
          errors.push(`Missing dependency: ${dep}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get optimization recommendations
   */
  static getOptimizationRecommendations() {
    const recommendations = [];
    const stats = this.getStatistics();

    // Bundle size recommendations
    if (Number(stats.bundleSize.total) > 200) {
      recommendations.push({
        type: 'bundle_size',
        priority: 'high',
        message: 'Bundle size is large. Consider enabling lazy loading for advanced tools.',
        action: 'Enable lazy loading in configuration',
      });
    }

    // Loading performance recommendations
    if (stats.loadingStats.loaded < stats.criticalTools) {
      recommendations.push({
        type: 'loading',
        priority: 'medium',
        message: 'Not all critical tools are loaded. Consider preloading.',
        action: 'Call LazyToolLoader.preloadCriticalTools() early',
      });
    }

    // Deprecated tools recommendations
    if (stats.deprecatedTools > 0) {
      recommendations.push({
        type: 'deprecation',
        priority: 'low',
        message: `${stats.deprecatedTools} deprecated tools are in use.`,
        action: 'Replace with modern alternatives',
      });
    }

    return recommendations;
  }

  /**
   * Export registry information for debugging
   */
  static exportRegistryInfo() {
    return {
      tools: Object.fromEntries(this.registeredTools),
      metadata: Object.fromEntries(this.toolMetadata),
      categories: Object.fromEntries(
        Array.from(this.toolCategories.entries()).map(([cat, tools]) => [cat, Array.from(tools)]),
      ),
      statistics: this.getStatistics(),
      recommendations: this.getOptimizationRecommendations(),
    };
  }
}
