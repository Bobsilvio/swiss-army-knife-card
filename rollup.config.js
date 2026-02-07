import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const dev = process.env.ROLLUP_WATCH || process.env.DEV;

const serveopts = {
  contentBase: ['dist'],
  host: '0.0.0.0',
  port: 5050,
  open: true,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/swiss-army-knife-card.js',
    format: 'es',
    name: 'SwissArmyKnifeCard',
    sourcemap: !!dev,
  },
  onwarn(warning, warn) {
    // See: https://github.com/reduxjs/redux-toolkit/issues/1466
    // Skip certain warnings
    // should intercept ... but doesn't in some rollup versions
    if (warning.code === 'THIS_IS_UNDEFINED') { return; }
    // console.warn everything else
    warn(warning);
  },
  watch: {
    exclude: 'node_modules/**',
  },
  plugins: [
    commonjs(),
    //   json({
    //   include: 'package.json',
    //   preferConst: true,
    // }),
    json(),
    resolve(),
    dev && serve(serveopts),
    !dev && terser({
      mangle: {
        safari10: true,
      },
    }),
    !dev && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
};
