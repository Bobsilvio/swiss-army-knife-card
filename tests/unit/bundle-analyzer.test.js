import { describe, it, expect, beforeEach, vi } from 'vitest';
import BundleAnalyzer from '../../src/bundle-analyzer.js';
import { PerformanceMonitor } from '../../src/utils.js';

describe('BundleAnalyzer', () => {
  beforeEach(() => {
    // Clear historical data before each test
    BundleAnalyzer.historicalData = [];
    BundleAnalyzer.currentAnalysis = null;
    
    // Reset performance monitor
    PerformanceMonitor.metrics.renderTimes = [];
    PerformanceMonitor.metrics.interactionTimes = [];
  });

  describe('bundle analysis', () => {
    it('should analyze bundle size correctly', () => {
      const bundleInfo = {
        uncompressed: 300,
        gzipped: 150,
        brotli: 140,
      };
      
      const analysis = BundleAnalyzer.analyzeBundle(bundleInfo);
      
      expect(analysis.bundle.uncompressed.size).toBe(300);
      expect(analysis.bundle.gzipped.size).toBe(150);
      expect(analysis.bundle.brotli.size).toBe(140);
      expect(analysis.bundle.compressionRatio.gzip).toBe('50.0');
    });

    it('should calculate composition correctly', () => {
      const analysis = BundleAnalyzer.analyzeBundle();
      
      expect(analysis.composition.core.size).toBe(45);
      expect(analysis.composition.basicTools.size).toBe(55);
      expect(analysis.composition.entityTools.size).toBe(65);
      expect(analysis.composition.interactiveTools.size).toBe(75);
      expect(analysis.composition.advancedTools.size).toBe(35);
      expect(analysis.composition.dependencies.size).toBe(33);
    });

    it('should analyze performance metrics', () => {
      // Setup test data
      PerformanceMonitor.metrics.renderTimes = [16, 20, 12];
      PerformanceMonitor.metrics.interactionTimes = [50, 80, 60];
      
      const analysis = BundleAnalyzer.analyzeBundle();
      
      expect(analysis.performance.render.average).toBe('16.00');
      expect(analysis.performance.render.status).toBe('good');
      expect(analysis.performance.render.fps).toBe('62.5');
      expect(analysis.performance.interaction.average).toBe('63.33');
      expect(analysis.performance.interaction.status).toBe('good');
    });
  });

  describe('recommendations', () => {
    it('should generate bundle size recommendations', () => {
      const bundleInfo = { gzipped: 250 }; // Over target
      const analysis = BundleAnalyzer.analyzeBundle(bundleInfo);
      
      const sizeRec = analysis.recommendations.find(r => r.category === 'bundle_size');
      expect(sizeRec).toBeDefined();
      expect(sizeRec.priority).toBe('high');
      expect(sizeRec.title).toBe('Reduce Bundle Size');
      expect(sizeRec.savings).toBe('30-40KB');
    });

    it('should generate performance recommendations', () => {
      // Setup slow performance
      PerformanceMonitor.metrics.renderTimes = [25, 30, 28];
      
      const analysis = BundleAnalyzer.analyzeBundle();
      
      const perfRec = analysis.recommendations.find(r => r.category === 'performance');
      expect(perfRec).toBeDefined();
      expect(perfRec.priority).toBe('medium');
      expect(perfRec.title).toBe('Optimize Render Performance');
    });

    it('should generate composition recommendations', () => {
      // Mock high advanced tools percentage
      const analysis = BundleAnalyzer.analyzeBundle();
      analysis.composition.advancedTools.percentage = 20;
      
      const compRec = analysis.recommendations.find(r => r.category === 'composition');
      expect(compRec).toBeDefined();
      expect(compRec.title).toBe('Optimize Tool Loading');
    });
  });

  describe('scoring', () => {
    it('should calculate score correctly', () => {
      const analysis = BundleAnalyzer.analyzeBundle();
      
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
      expect(typeof analysis.score).toBe('number');
    });

    it('should set status based on score', () => {
      const analysis = BundleAnalyzer.analyzeBundle();
      
      expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(analysis.status);
    });
  });

  describe('compliance checking', () => {
    it('should check bundle size compliance', () => {
      const bundleInfo = { gzipped: 180 }; // Within target
      const analysis = BundleAnalyzer.analyzeBundle(bundleInfo);
      
      const compliance = BundleAnalyzer.checkCompliance();
      
      expect(compliance.compliant).toBe(true);
      expect(compliance.reasons).toHaveLength(0);
    });

    it('should identify non-compliance issues', () => {
      const bundleInfo = { gzipped: 250 }; // Over target
      PerformanceMonitor.metrics.renderTimes = [25, 30]; // Slow renders
      
      const analysis = BundleAnalyzer.analyzeBundle(bundleInfo);
      const compliance = BundleAnalyzer.checkCompliance();
      
      expect(compliance.compliant).toBe(false);
      expect(compliance.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('data export', () => {
    it('should export as JSON', () => {
      BundleAnalyzer.analyzeBundle();
      
      const jsonExport = BundleAnalyzer.exportData('json');
      
      expect(jsonExport).toBeDefined();
      expect(typeof jsonExport).toBe('string');
      expect(JSON.parse(jsonExport)).toHaveProperty('bundle');
      expect(JSON.parse(jsonExport)).toHaveProperty('score');
    });

    it('should export as CSV', () => {
      // Add some historical data
      BundleAnalyzer.analyzeBundle();
      BundleAnalyzer.analyzeBundle();
      
      const csvExport = BundleAnalyzer.exportData('csv');
      
      expect(csvExport).toBeDefined();
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain('timestamp,score,bundle_size_kb,render_time_ms,interaction_time_ms');
    });
  });

  describe('report generation', () => {
    it('should generate detailed report', () => {
      BundleAnalyzer.analyzeBundle();
      
      const report = BundleAnalyzer.generateReport();
      
      expect(typeof report).toBe('string');
      expect(report).toContain('# Swiss Army Knife - Bundle Analysis Report');
      expect(report).toContain('## 📊 Bundle Size Analysis');
      expect(report).toContain('## 🏗️ Bundle Composition');
      expect(report).toContain('## ⚡ Performance Metrics');
      expect(report).toContain('## 🎯 Optimization Recommendations');
    });

    it('should handle no analysis data', () => {
      const report = BundleAnalyzer.generateReport();
      
      expect(report).toBe('No analysis available. Run analyzeBundle() first.');
    });
  });

  describe('historical data', () => {
    it('should maintain historical data', () => {
      BundleAnalyzer.analyzeBundle();
      BundleAnalyzer.analyzeBundle();
      BundleAnalyzer.analyzeBundle();
      
      expect(BundleAnalyzer.historicalData).toHaveLength(3);
    });

    it('should limit historical data', () => {
      // Add 35 analyses (more than limit of 30)
      for (let i = 0; i < 35; i++) {
        BundleAnalyzer.analyzeBundle();
      }
      
      expect(BundleAnalyzer.historicalData).toHaveLength(30);
    });
  });
});