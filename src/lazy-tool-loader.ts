/** ***************************************************************************
  * LazyToolLoader class
  *
  * Summary.
  * Dynamic tool loading for code splitting and performance optimization
  */

import PerformanceMonitor from './performance-monitor.js';

export default class LazyToolLoader {

[key: string]: any;


  static loadedTools = new Map();

  static loadingTools = new Map();

  static toolModules = {
    // Core tools (always loaded)
    circle: () => import('./circle-tool.js'),
    line: () => import('./line-tool.js'),
    text: () => import('./text-tool.js'),
    rectangle: () => import('./rectangle-tool.js'),
    ellipse: () => import('./ellipse-tool.js'),

    // Advanced tools (lazy loaded)
    gauge: () => import('./tools/gauge-tool.js'),
    pieChart: () => import('./tools/pie-chart-tool.js'),
    heatmap: () => import('./tools/heatmap-tool.js'),
  };

  static async loadTool(toolType) {
    // Return cached tool if already loaded
    if (this.loadedTools.has(toolType)) {
      return this.loadedTools.get(toolType);
    }

    // Return existing promise if tool is currently loading
    if (this.loadingTools.has(toolType)) {
      return this.loadingTools.get(toolType);
    }

    // Check if tool module exists
    if (!this.toolModules[toolType]) {
      throw new Error(`Unknown tool type: ${toolType}`);
    }

    // Start loading process
    const loadingPromise = this._loadToolModule(toolType);
    this.loadingTools.set(toolType, loadingPromise);

    try {
      const toolModule = await loadingPromise;
      this.loadedTools.set(toolType, toolModule.default || toolModule);
      this.loadingTools.delete(toolType);

      console.log(`[SAK] Tool "${toolType}" loaded successfully`);
      return this.loadedTools.get(toolType);
    } catch (error) {
      this.loadingTools.delete(toolType);
      console.error(`[SAK] Failed to load tool "${toolType}":`, error);
      throw error;
    }
  }

  static async _loadToolModule(toolType) {
    const endInteraction = PerformanceMonitor.trackInteraction();

    try {
      const moduleLoader = this.toolModules[toolType];
      const module = await moduleLoader();

      // Preload commonly used tools in background
      this._preloadCommonTools(toolType);

      return module;
    } finally {
      endInteraction();
    }
  }

  static _preloadCommonTools(currentTool) {
    // Background preload for tools that are commonly used together
    const toolGroups = {
      gauge: ['heatmap'],
      pieChart: ['heatmap'],
      heatmap: ['gauge'],
    };

    const relatedTools = toolGroups[currentTool];
    if (relatedTools) {
      setTimeout(() => {
        relatedTools.forEach((toolType) => {
          if (!this.loadedTools.has(toolType) && !this.loadingTools.has(toolType)) {
            this.loadTool(toolType).catch(() => {
              // Silently fail preload
            });
          }
        });
      }, 1000); // 1 second delay
    }
  }

  static preloadCriticalTools() {
    // Preload critical tools for better initial experience
    const criticalTools = ['circle', 'line', 'text', 'rectangle'];

    criticalTools.forEach((toolType) => {
      if (!this.loadedTools.has(toolType)) {
        this.loadTool(toolType).catch((error) => {
          console.warn(`[SAK] Failed to preload critical tool "${toolType}":`, error);
        });
      }
    });
  }

  static getLoadingStats() {
    return {
      loaded: this.loadedTools.size,
      loading: this.loadingTools.size,
      available: Object.keys(this.toolModules).length,
      loadedTools: Array.from(this.loadedTools.keys()),
      loadingTools: Array.from(this.loadingTools.keys()),
    };
  }

  static clearCache() {
    // Clear cache for memory management
    this.loadedTools.clear();
    this.loadingTools.clear();
    console.log('[SAK] Tool loader cache cleared');
  }

  static async preloadAllTools() {
    // Preload all tools (useful for development/testing)
    const allTools = Object.keys(this.toolModules);
    const loadPromises = allTools.map((toolType) => this.loadTool(toolType).catch((error) => {
        console.warn(`[SAK] Failed to preload tool "${toolType}":`, error);
      }),
    );

    await Promise.allSettled(loadPromises);
    console.log('[SAK] All tools preloaded');
  }

  static getBundleSizeInfo() {
    // Estimated bundle sizes (based on typical sizes)
    const coreToolsSize = 45; // KB - circle, line, text, rectangle, ellipse
    const advancedToolsSize = 35; // KB - gauge, pie chart, heatmap, etc.
    const entityToolsSize = 25; // KB - entity-specific tools
    const interactiveToolsSize = 20; // KB - sliders, switches, buttons

    return {
      core: `${coreToolsSize}KB`,
      advanced: `${advancedToolsSize}KB`,
      entity: `${entityToolsSize}KB`,
      interactive: `${interactiveToolsSize}KB`,
      total: `${coreToolsSize + advancedToolsSize + entityToolsSize + interactiveToolsSize}KB`,
      gzipped: '~175KB', // Estimated gzipped size
    };
  }
}
