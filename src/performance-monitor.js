/** ***************************************************************************
  * PerformanceMonitor class
  *
  * Summary.
  * Runtime performance tracking and optimization monitoring
  */

export default class PerformanceMonitor {
  static metrics = {
    renderTimes: [],
    memoryUsage: [],
    interactionTimes: [],
  };

  static startRender() {
    this.renderStart = performance.now();
  }

  static endRender() {
    const renderTime = performance.now() - this.renderStart;
    this.metrics.renderTimes.push(renderTime);

    // Keep only last 100 measurements
    if (this.metrics.renderTimes.length > 100) {
      this.metrics.renderTimes.shift();
    }

    // Warning if render takes longer than 16ms (60fps target)
    if (renderTime > 16) {
      console.warn(`[SAK] Slow render detected: ${renderTime.toFixed(2)}ms (target: <16ms)`);
    }

    return renderTime;
  }

  static trackInteraction() {
    const interactionStart = performance.now();
    return () => {
      const interactionTime = performance.now() - interactionStart;
      this.metrics.interactionTimes.push(interactionTime);

      if (this.metrics.interactionTimes.length > 100) {
        this.metrics.interactionTimes.shift();
      }

      // Warning if interaction takes longer than 100ms
      if (interactionTime > 100) {
        console.warn(`[SAK] Slow interaction: ${interactionTime.toFixed(2)}ms (target: <100ms)`);
      }
    };
  }

  static getAverageRenderTime() {
    if (this.metrics.renderTimes.length === 0) return 0;
    const sum = this.metrics.renderTimes.reduce((a, b) => a + b, 0);
    return sum / this.metrics.renderTimes.length;
  }

  static getAverageInteractionTime() {
    if (this.metrics.interactionTimes.length === 0) return 0;
    const sum = this.metrics.interactionTimes.reduce((a, b) => a + b, 0);
    return sum / this.metrics.interactionTimes.length;
  }

  static logMetrics() {
    console.log('[SAK Performance Metrics]', {
      avgRenderTime: `${this.getAverageRenderTime().toFixed(2)}ms`,
      avgInteractionTime: `${this.getAverageInteractionTime().toFixed(2)}ms`,
      fps: `${(1000 / this.getAverageRenderTime()).toFixed(1)}`,
      samples: this.metrics.renderTimes.length,
    });
  }
}
