// AUTO-GENERATED FILE — do not edit manually.
// Run: npm run gen-templates  (or: python3 scripts/generate-builtin-templates.py)
//
// Embeds sak-css-definitions.yml and sak-svg-definitions.yml so the card
// works without external template files in Home Assistant.
//
// License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by/4.0/
// Original author: Mars @ AmoebeLabs.com

/**
 * Built-in SAK system templates bundled with the card.
 * Mirrors the structure of `sak_sys_templates` in the Lovelace config.
 * Used automatically when sak_sys_templates is not defined in the HA config.
 */
export const SAK_BUILTIN_TEMPLATES = {
  definitions: {
    sak_css_definitions: [
      {
        content: `.sak-state__value {
  --descr: extra-css;
  letter-spacing: 0.05em;
}
.toolset__group-outer {
  overflow: visible;
  /*filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.8));*/
  /*filter: url(#shadow);*/
} .toolset__group {
  overflow: visible;
  /*filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.8));*/
  /*filter: url(#shadow);*/
}
.sak-circslider__group-inner {
  pointer-events: none;
  }
#as-thumb-group {
  overflow: visible;
  pointer-events: all;
} #as-label {
  overflow: visible;
} .sak-circslider {
  overflow: visible;
  fill: none;
  stroke: none;
  pointer-events: none;
} .sak-circslider__capture {
  overflow: visible;
  pointer-events: all;
  fill: none;
  stroke-width: 0;
  touch-action: manipulation;
  fill: grey;
  fill-opacity: 0.1;
  stroke-width: 0em;
  stroke: red;
} .sak-circslider__active {
  stroke: var(--theme-sys-color-primary);
  stroke-width: 4em;
  pointer-events: all;
} .sak-circslider__track {
  fill: none;
  stroke-width: 2em;
  stroke: var(--theme-sys-elevation-surface-neutral10);
  overflow: visible;
  pointer-events: all;
} .sak-circslider__thumb {
  overflow: visible;
  fill: var(--theme-sys-color-primary);
  fill-opacity: 1;
  transform-origin: center;
  transform-box: fill-box;
} .sak-circslider__value {
  overflow: visible;
  fill: var(--primary-text-color);
  font-size: 8em;
  font-weight: 400;
  dominant-baseline: central;
  pointer-events: none;
} .sak-circslider__uom {
  overflow: visible;
  fill: var(--primary-text-color);
  text-anchor: middle;
  dominant-baseline: central;
  opacity: 0.7;
  letter-spacing: 0.05em;
  pointer-events: none;
}
.sak-area { }
.sak-area__area {
  font-size: 3em;
  fill: var(--primary-text-color);
  opacity: 0.8;
  text-anchor: middle;
  dominant-baseline: central;
  letter-spacing: 0.05em;
}
.sak-badge { } .sak-badge__left {
  stroke-width: 0;
  fill: grey;
} .sak-badge__right {
  stroke-width: 0;
  fill: var(--theme-gradient-color-03, darkgrey);
}
.sak-barchart { } .sak-barchart__line {
  stroke-linecap: round;
  stroke-linejoin: round;
}
.sak-circle { } .sak-circle__circle {
  fill: var(--primary-background-color);
}
.sak-ellipse { } .sak-ellipse__ellipse {
  fill: var(--primary-background-color);
}
.sak-horseshoe { } .sak-horseshoe__todo { }
.sak-icon { } .sak-icon__icon {
  --mdc-icon-size: 100%;
  align-self: center;
  height: 100%;
  width: 100%;
  fill: var(--primary-text-color);
  color: var(--primary-text-color);
}
.sak-line {
  overflow: visible;
} .sak-line__line {
  stroke-linecap: round;
  stroke: var(--primary-text-color);
  opacity: 1.0;
  stroke-width: 2;
}
.sak-name {
  overflow: visible;
} .sak-name__name {
  font-size: 3em;
  fill: var(--primary-text-color);
  opacity: 1.0;
  text-anchor: middle;
  dominant-baseline: central;
  letter-spacing: 0.05em;
}
.sak-polygon {
  overflow: visible;
} .sak-polygon__regpoly {
  stroke: var(--primary-text-color);
  fill: var(--primary-background-color);
  fill-rule: nonzero;
}
.sak-rectangle {
  overflow: visible;
} .sak-rectangle__rectangle {
  stroke-linecap: round;
  stroke: var(--primary-text-color);
  opacity: 1.0;
  stroke-width: 2em;
  fill: var(--primary-background-color);
}
  
.sak-rectex { } .sak-rectex__rectex {
  stroke-linecap: round;
  stroke: var(--primary-text-color);
  opacity: 1.0;
  stroke-width: 0;
  fill: var(--primary-background-color);
}
.sak-segarc { } .sak-segarc__background {
  stroke-linecap: round;
  fill: var(--primary-background-color);
  stroke-width: 0;
  fill-rule: evenodd;
  stroke-linejoin: round;
} .sak-segarc__foreground {
  stroke-linecap: round;
  fill: var(--primary-color);
  stroke: none;
  stroke-width: 0.5;
  fill-rule: evenodd;
  stroke-linejoin: round;
}
#rs-thumb-group {
  overflow: visible;
} #rs-label {
  overflow: visible;
} .sak-slider {
  pointer-events: none;
  overflow: visible;
} .sak-slider__capture {
  overflow: visible;
  pointer-events: all;
  fill: none;
  stroke-width: 0;
  touch-action: manipulation;
} .sak-slider__track {
  overflow: visible;
  fill-opacity: 0.38;
  stroke-width: 0;
  stroke: var(--primary-text-color);
  fill: var(--switch-unchecked-track-color);
  transition: all .5s ease;
  pointer-events: none;
} .sak-slider__thumb {
  overflow: visible;
  --thumb-stroke: var(--secondary-text-color);
  stroke: var(--thumb-stroke);
  fill: var(--primary-background-color);
  pointer-events: none;
} .sak-slider__value {
  overflow: visible;
  fill: var(--primary-text-color);
  font-size: 8em;
  font-weight: 400;
  transition: all .5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  dominant-baseline: central;
} .sak-slider__uom {
  overflow: visible;
  fill: var(--primary-text-color);
  text-anchor: middle;
  dominant-baseline: central;
  opacity: 0.7;
  letter-spacing: 0.05em;
}
  
.sak-state { } .sak-state__value {
  --descr: original;
  font-size: 3em;
  fill: var(--primary-text-color);
  opacity: 1.0;
  text-anchor: middle;
  dominant-baseline: central;
  letter-spacing: 0.05em;
} .sak-state__uom {
  fill: var(--primary-text-color);
  text-anchor: middle;
  dominant-baseline: central;
  opacity: 0.7;
  letter-spacing: 0.05em;
}
.sak-switch { } .sak-switch__track {
  fill-opacity: 0.38;
  stroke-width: 0;
  stroke: var(--primary-text-color);
  fill: var(--primary-background-color);
  transition: all .5s ease;
  pointer-events: none;
} .sak-switch__thumb {
  --thumb-stroke: var(--secondary-text-color);
  stroke: var(--thumb-stroke);
  fill: var(--primary-background-color);
  transition: all .5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}
.sak-text { } .sak-text__text {
  font-size: 3em;
  fill: var(--primary-text-color);
  opacity: 1.0;
  text-anchor: middle;
  dominant-baseline: central;
}
.sak-usersvg__group { } .sak-usersvg__image { }
@keyframes blinkingText {
  0%{   opacity: 0%;   }
  49%{  opacity: 0%;   }
  60%{  opacity: 100%; }
  99%{  opacity: 100%; }
  100%{ opacity: 0%;   }
}
@keyframes zoomOut {
  from {
    opacity: 1;
  }
  50% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 0;
  }
}
@keyframes bounce {
  from,
  20%,
  53%,
  80%,
  to {
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
  animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
  transform: translate3d(0, -30px, 0);
  }
  70% {
  animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
  transform: translate3d(0, -15px, 0);
  }
  90% {
  transform: translate3d(0, -4px, 0);
  }
}
@-webkit-keyframes flash {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
} @keyframes flash {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
@keyframes flashold {
  from,
  50%,
  to {
  opacity: 1;
  }
  25%,
  75% {
  opacity: 0;
  }
}
@keyframes headShake {
  0% {
  transform: translateX(0);
  }
  6.5% {
  transform: translateX(-6px) rotateY(-9deg);
  }
  18.5% {
  transform: translateX(5px) rotateY(7deg);
  }
  31.5% {
  transform: translateX(-3px) rotateY(-5deg);
  }
  43.5% {
  transform: translateX(2px) rotateY(3deg);
  }
  50% {
  transform: translateX(0);
  }
}
@keyframes heartBeat {
  0% {
  transform: scale(1);
  }
  14% {
  transform: scale(1.3);
  }
  28% {
  transform: scale(1);
  }
  42% {
  transform: scale(1.3);
  }
  70% {
  transform: scale(1);
  }
}
@keyframes jello {
  from,
  11.1%,
  to {
  transform: translate3d(0, 0, 0);
  }
  22.2% {
  transform: skewX(-12.5deg) skewY(-12.5deg);
  }
  33.3% {
  transform: skewX(6.25deg) skewY(6.25deg);
  }
  44.4% {
  transform: skewX(-3.125deg) skewY(-3.125deg);
  }
  55.5% {
  transform: skewX(1.5625deg) skewY(1.5625deg);
  }
  66.6% {
  transform: skewX(-0.78125deg) skewY(-0.78125deg);
  }
  77.7% {
  transform: skewX(0.390625deg) skewY(0.390625deg);
  }
  88.8% {
  transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
  }
}
@keyframes pulse {
  from {
  transform: scale3d(1, 1, 1);
  }
  50% {
  transform: scale3d(1.05, 1.05, 1.05);
  }
  to {
  transform: scale3d(1, 1, 1);
  }
}
@keyframes rubberBand {
  from {
  transform: scale3d(1, 1, 1);
  }
  30% {
  transform: scale3d(1.25, 0.75, 1);
  }
  40% {
  transform: scale3d(0.75, 1.25, 1);
  }
  50% {
  transform: scale3d(1.15, 0.85, 1);
  }
  65% {
  transform: scale3d(0.95, 1.05, 1);
  }
  75% {
  transform: scale3d(1.05, 0.95, 1);
  }
  to {
  transform: scale3d(1, 1, 1);
  }
}
@keyframes shake {
  from,
  to {
  transform: translate3d(0, 0, 0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
  transform: translate3d(-10px, 0, 0);
  }
  20%,
  40%,
  60%,
  80% {
  transform: translate3d(10px, 0, 0);
  }
}
@keyframes swing {
  20% {
  transform: rotate3d(0, 0, 1, 15deg);
  }
  40% {
  transform: rotate3d(0, 0, 1, -10deg);
  }
  60% {
  transform: rotate3d(0, 0, 1, 5deg);
  }
  80% {
  transform: rotate3d(0, 0, 1, -5deg);
  }
  to {
  transform: rotate3d(0, 0, 1, 0deg);
  }
}
@keyframes tada {
  from {
  transform: scale3d(1, 1, 1);
  }
  10%,
  20% {
  transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg);
  }
  30%,
  50%,
  70%,
  90% {
  transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
  }
  40%,
  60%,
  80% {
  transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
  }
  to {
  transform: scale3d(1, 1, 1);
  }
}
@keyframes wobble {
  from {
  transform: translate3d(0, 0, 0);
  }
  15% {
  transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
  }
  30% {
  transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
  }
  45% {
  transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
  }
  60% {
  transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
  }
  75% {
  transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
  }
  to {
  transform: translate3d(0, 0, 0);
  }
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0);
            transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
} @keyframes spin {
  0% {
    -webkit-transform: rotate(0);
            transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
} @keyframes spinold {
    from {
        -webkit-transform: -webkit-rotate(0deg);
        transform:rotate(0deg);
    }
    to {
        -webkit-transform: -webkit-rotate(360deg);
        transform:rotate(360deg);
    }
}
@keyframes spinn {
  100% {
    -webkit-transform: -webkit-rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes spinn {
  100% {
    -webkit-transform: -webkit-rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin-stop {
  100% {
    -webkit-transform: -webkit-rotate(0deg);
    transform: rotate(0deg);
  }
}
`,
      },
    ],
    sak_svg_definitions: [
      {
        content: `<filter id="sak-inset-1" x="-50%" y="-50%" width="400%" height="400%">
  <feComponentTransfer in=SourceAlpha>
    <feFuncA type="table" tableValues="1 0" />
  </feComponentTransfer>
  <feGaussianBlur stdDeviation="1"/>
  <feOffset dx="0" dy="1" result="offsetblur"/>
  <feFlood flood-color="rgba(0, 0, 0, 0.3)" result="color"/>
  <feComposite in2="offsetblur" operator="in"/>
  <feComposite in2="SourceAlpha" operator="in" />
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode />
  </feMerge>
</filter>
<filter id="sak-inset-2">
  <!-- Shadow Offset -->
  <feOffset
    dx='1'
    dy='1'
  />
  <!-- Shadow Blur -->
  <feGaussianBlur
    stdDeviation='0.5'
    result='offset-blur'
  />
  <!-- Invert the drop shadow
       to create an inner shadow -->
  <feComposite
    operator='out'
    in='SourceGraphic'
    in2='offset-blur'
    result='inverse'
  />
  <!-- Color & Opacity -->
  <feFlood
    flood-color='black'
    flood-opacity='0.4'
    result='color'
  />
  <!-- Clip color inside shadow -->
  <feComposite
    operator='in'
    in='color'
    in2='inverse'
    result='shadow'
  />
  <!-- Put shadow over original object -->
  <feComposite
    operator='over'
    in='shadow'
    in2='SourceGraphic'
  />
</filter>
<!-- Neumorphic filter -->
<!-- -->
<!-- Light Shadow, #FFFFFF at 50%, x:-6, Y:-6, Blur:16 -->
<!-- Dark Shadow: #d1cdc7 at 50%, x:6, y:6, Blur:16 -->
<!-- Main Background: #efeeee -->
<!-- Shape Background: #efeeee -->
<!-- Optional Border: #fff at 20% Alpha -->
<!-- Dark Shadow was: 0d2750 -->

<!-- 2021.11.17 -->
<!-- Performance with inset shadow and width/height=150% seems to be optimal setting -->
<!-- Smaller settings give clipping, and larger settings performance hits -->
<!-- Absolute settings (userSpaceOnUse) seem to be difficult to find right settings -->
<filter id="is-1" x="-25%" y="-25%" width="150%" height="150%">
  <feComponentTransfer in=SourceAlpha>
    <feFuncA type="table" tableValues="1 0" />
  </feComponentTransfer>
  <feGaussianBlur stdDeviation="1"/>
  <feOffset dx="2" dy="2" result="offsetblur"/>
  <feFlood flood-color="#0d2750" flood-opacity="0.5" result="color"/>
  <feComposite in2="offsetblur" operator="in"/>
  <feComposite in2="SourceAlpha" operator="in" />
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode />
  </feMerge>
</filter>

<filter id="is-1b" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="1000">
  <feComponentTransfer in=SourceAlpha>
    <feFuncA type="table" tableValues="1 0" />
  </feComponentTransfer>
  <feGaussianBlur stdDeviation="1"/>
  <feOffset dx="2" dy="2" result="offsetblur"/>
  <feFlood flood-color="#0d2750" flood-opacity="0.5" result="color"/>
  <feComposite in2="offsetblur" operator="in"/>
  <feComposite in2="SourceAlpha" operator="in" />
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode />
  </feMerge>
</filter>

<!-- Using feComposite in="offsetblur" operator="in" instead of in2 gives a -->
<!-- much larger shadow area, much deeper! WHY?? -->

<filter id="nm-2" x="-50%" y="-50%" width="200%" height="200%">
  <feComponentTransfer in=SourceAlpha out=transfer>
    <feFuncA type="table" tableValues="1 0" />
  </feComponentTransfer>
  
  <feGaussianBlur input="transfer" stdDeviation="5" result="blurdark"/>
  <feOffset input="blurdark" dx="12" dy="12" result="offsetblurdark"/>
  <feFlood input="offsetblurdark" flood-color="#d1cdc7" flood-opacity="0.4" result="colordark"/>
  
  <feGaussianBlur input="transfer" stdDeviation="5" result="blurlight"/>
  <feOffset input="blurlight" dx="-12" dy="-12" result="offsetblurlight"/>
  <feFlood input="offsetblurlight" flood-color="white" flood-opacity="0.9" result="colorlight"/>
  
  <feComposite in="offsetblurdark" operator="in"/>
  <feComposite in="SourceAlpha" operator="in" />
  
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode />
  </feMerge>
</filter>

<filter id="filter-yoksel" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB">
  <feFlood flood-color="#eeebe7" flood-opacity="0.7" x="0%" y="0%" width="100%" height="100%" result="flood2"/>
  <feComposite in="flood2" in2="SourceAlpha" operator="out" x="0%" y="0%" width="100%" height="100%" result="composite5"/>
  <feOffset dx="-9" dy="-7" x="0%" y="0%" width="100%" height="100%" in="composite5" result="offset1"/>
  <feGaussianBlur stdDeviation="3 10" x="0%" y="0%" width="100%" height="100%" in="offset1" edgeMode="none" result="blur2"/>
  <feComposite in="merge3" in2="SourceAlpha" operator="in" x="0%" y="0%" width="100%" height="100%" result="composite7"/>
  <feFlood flood-color="#0f0f0f" flood-opacity="1" x="0%" y="0%" width="100%" height="100%" result="flood4"/>
  <feComposite in="flood4" in2="SourceAlpha" operator="out" x="0%" y="0%" width="100%" height="100%" result="composite8"/>
  <feOffset dx="6" dy="6" x="0%" y="0%" width="100%" height="100%" in="merge3" result="offset2"/>
  <feGaussianBlur stdDeviation="3 10" x="0%" y="0%" width="100%" height="100%" in="offset2" edgeMode="none" result="blur3"/>
  <feComposite in="blur3" in2="SourceAlpha" operator="in" x="0%" y="0%" width="100%" height="100%" result="composite9"/>
  <feMerge x="0%" y="0%" width="100%" height="100%" result="merge3">
        <feMergeNode in="SourceGraphic"/>
    <feMergeNode in="composite7"/>
    <feMergeNode in="composite9"/>
    </feMerge>
</filter>

<!-- 2021.11.15 -->
<!-- For some reason, changing the filter width/height from 160% to 600% improves performance on iOS 15 -->

<!-- second try... -->
<filter id="filter" x="-50%" y="-50%" width="300%" height="300%">
  <feFlood flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="flood2"/>
  <feComposite in="flood2" in2="SourceAlpha" operator="out" result="composite5"/>
  <feOffset dx="-6" dy="-6" in="composite5" result="offset1"/>
  <feGaussianBlur stdDeviation="5" in="offset1" edgeMode="none" result="blur2"/>
  <feComposite in="blur2" in2="SourceAlpha" operator="in"  result="composite7"/>
  
  <!-- flood-color="#777777" -->
  <feFlood flood-color="var(--cs-theme-shadow-darker)" flood-opacity="1" result="flood4"/>
  <feComposite in="flood4" in2="SourceAlpha" operator="out" result="composite8"/>
  <feOffset dx="6" dy="6" in="composite8" result="offset2"/>
  <feGaussianBlur stdDeviation="15" in="offset2" edgeMode="none" result="blur3"/>
  <feComposite in="blur3" in2="SourceAlpha" operator="in" result="composite9"/>
  
  <feMerge result="merge3">
    <feMergeNode in="SourceGraphic"/>
    <feMergeNode in="composite7"/>
    <feMergeNode in="composite9"/>
    </feMerge>
</filter>

<filter id="filterb" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="1000">
  <feFlood flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="flood2"/>
  <feComposite in="flood2" in2="SourceAlpha" operator="out" result="composite5"/>
  <feOffset dx="-6" dy="-6" in="composite5" result="offset1"/>
  <feGaussianBlur stdDeviation="5" in="offset1" edgeMode="none" result="blur2"/>
  <feComposite in="blur2" in2="SourceAlpha" operator="in"  result="composite7"/>
  
  <!-- flood-color="#777777" -->
  <feFlood flood-color="var(--cs-theme-shadow-darker)" flood-opacity="1" result="flood4"/>
  <feComposite in="flood4" in2="SourceAlpha" operator="out" result="composite8"/>
  <feOffset dx="6" dy="6" in="composite8" result="offset2"/>
  <feGaussianBlur stdDeviation="15" in="offset2" edgeMode="none" result="blur3"/>
  <feComposite in="blur3" in2="SourceAlpha" operator="in" result="composite9"/>
  
  <feMerge result="merge3">
    <feMergeNode in="SourceGraphic"/>
    <feMergeNode in="composite7"/>
    <feMergeNode in="composite9"/>
    </feMerge>
</filter>

<filter id="bold" x="-50%" y="-50%" width="240%" height="240%">
  <feFlood flood-color="#FFFFFF" flood-opacity="0.8" result="flood2"/>
  <feComposite in="flood2" in2="SourceAlpha" operator="out" result="composite5"/>
  <feOffset dx="12" dy="12" in="composite5" result="offset1"/>
  <feGaussianBlur stdDeviation="5" in="offset1" edgeMode="none" result="blur2"/>
  <feComposite in="blur2" in2="SourceAlpha" operator="in"  result="composite7"/>
  
  <feFlood flood-color="#777777" flood-opacity="0.6" result="flood4"/>
  <feComposite in="flood4" in2="SourceAlpha" operator="out" result="composite8"/>
  <feOffset dx="-12" dy="-12" in="composite8" result="offset2"/>
  <feGaussianBlur stdDeviation="15" in="offset2" edgeMode="none" result="blur3"/>
  <feComposite in="blur3" in2="SourceAlpha" operator="in" result="composite9"/>
  
  <feMerge result="merge3">
    <feMergeNode in="SourceGraphic"/>
    <feMergeNode in="composite7"/>
    <feMergeNode in="composite9"/>
    </feMerge>
</filter>

<filter id="filterss" x="-20%" y="-20%" width="140%" height="140%">
  <feFlood flood-color="#eeebe7" flood-opacity="0.9" result="flood2"/>
  <feComposite in="flood2" in2="SourceAlpha" operator="out" result="composite5"/>
  <feOffset dx="-15" dy="-15" in="composite5" result="offset1"/>
  <feGaussianBlur stdDeviation="5" in="offset1" edgeMode="none" result="blur2"/>
  <feComposite in="blur2" in2="SourceAlpha" operator="in" result="composite7"/>
  
  <feFlood flood-color="#0f0f0f" flood-opacity="1" result="flood4"/>
  <feComposite in="flood4" in2="SourceAlpha" operator="out" result="composite8"/>
  <feOffset dx="6" dy="6" in="composite8" result="offset2"/>
  <feGaussianBlur stdDeviation="5" in="offset2" edgeMode="none" result="blur3"/>
  <feComposite in="blur3" in2="SourceAlpha" operator="in" result="composite9"/>
  
  <feMerge result="merge3">
    <feMergeNode in="SourceGraphic"/>
    <feMergeNode in="composite7"/>
    <feMergeNode in="composite9"/>
    </feMerge>
</filter>

<!-- flood-color="#d1cdc7" -->
<!-- flood-color="#FFFFFF" -->
<filter id="nm-11" x="-50%" y="-50%" width="300%" height="300%">
  <feDropShadow stdDeviation="5" in="SourceGraphic"
    dx="6" dy="6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"
  </feDropShadow>
  <feDropShadow stdDeviation="4.5" in="SourceGraphic"
    dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>

<!-- 2021.11.15 -->
<!-- For some reason, changing the filter width/height from 300% to 600% improves performance on iOS 15 -->
<!-- Changing this value to 3000% improves performance also, but pixelates some of the views, so unusable! -->
<!-- A value of 1000% seems to be a good value too! Switching views is now instant again for some reason! -->
<!-- However, some views (sake5) becomes very, very, very slow. Views sake4 and sake6 are very fast. -->
<!-- 2021.11.17 -->
<!-- Let's settle for now with x/y=-10% and width/height=120%. This is actually the default for svg filters... -->

<filter id="sak-nm-default" x="-10%" y="-10%" width="120%" height="120%">
  <feDropShadow stdDeviation="5" in="SourceGraphic" dx="6" dy="6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"/>
  <feDropShadow stdDeviation="4.5" in="SourceGraphic" dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>

<filter id="nm-1" x="-10%" y="-10%" width="120%" height="120%">
  <feDropShadow stdDeviation="5" in="SourceGraphic" dx="6" dy="6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"/>
  <feDropShadow stdDeviation="4.5" in="SourceGraphic" dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>

<filter id="sak-nm-default-b" filterUnits="userSpaceOnUse" x="-100" y="-100" width="5000" height="800">
  <feDropShadow stdDeviation="5" in="SourceGraphic" dx="6" dy="6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"/>
  <feDropShadow stdDeviation="4.5" in="SourceGraphic" dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>

<filter id="nm-1b" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="2000">
  <feDropShadow stdDeviation="5" in="SourceGraphic" dx="6" dy="6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"/>
  <feDropShadow stdDeviation="4.5" in="SourceGraphic" dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>

<filter id="nm-1-reverse" x="-10%" y="-10%" width="120%" height="120%">
  <feDropShadow stdDeviation="4.5" in="SourceGraphic" dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"/>
  <feDropShadow stdDeviation="5" in="SourceGraphic" dx="6" dy="6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>

<filter id="nm-1b-reverse" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
  <feDropShadow stdDeviation="4.5" in="SourceGraphic" dx="-6" dy="-6" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5" result="dropShadow"/>
  <feDropShadow stdDeviation="5" in="SourceGraphic" dx="6" dy="6" flood-color="var(--cs-theme-shadow-lighter)" flood-opacity="1" result="dropShadow1"/>
  <feMerge result="merge">
    <feMergeNode in="dropShadow1"/>
    <feMergeNode in="dropShadow"/>
  </feMerge>
</filter>
<filter id='shadow' color-interpolation-filters="sRGB">
  <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="var(--cs-theme-shadow-darker)" flood-opacity="0.5"/>
</filter>      
<filter id="sak-drop-1" y="-50%" x="-50%" width="200%" height="400%">
  <feDropShadow dx="0" dy="1.5" flood-color="var(--cs-theme-shadow-darker)" stdDeviation=".3"/>
</filter>

<filter id="sak-drop-1a" y="-50%" x="-50%" width="200%" height="400%">
  <feDropShadow dx="1" dy="2" flood-color="var(--cs-theme-shadow-darker)" stdDeviation=".5"/>
</filter>

<filter id="sak-drop-1b" y="-50%" x="-50%" width="200%" height="400%">
  <feDropShadow dx="2" dy="4" flood-color="var(--cs-theme-shadow-darker)" stdDeviation="6"/>
</filter>

<filter id="sak-drop-2" width="10" height="10">
  <feDropShadow dx="2" dy="3" flood-color="var(--cs-theme-shadow-darker)" stdDeviation="0.5"/>
</filter>

<filter id="sak-drop-3" x="0" y="0" width="200%" height="200%">
  <feOffset result="offOut" in="SourceAlpha" dx="20" dy="20" />
  <feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
  <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
</filter>

<filter id="sak-drop-4" x="0" y="0" width="200%" height="200%">
  <feGaussianBlur stdDeviation="1" />
</filter>
<marker viewBox="0 0 200 200" id="markerCircle" markerWidth="8" markerHeight="8" refX="5" refY="5">
    <circle cx="5" cy="5" r="3" style="stroke: none; fill:currentColor;"/>
</marker>

<marker viewBox="0 0 200 200" id="markerArrow" markerWidth="13" markerHeight="13" refX="2" refY="6"
       orient="auto">
    <path d="M2,2 L2,11 L10,6 L2,2" style="fill: currentColor;" />
</marker>
<rect id="cliprect" width="100%" height="100%" fill="none" stroke="none" rx="3" />
<clipPath id="clip">
  <use xlink:href="#cliprect"/>
</clipPath>
<linearGradient id="sak-light-brightness-gradient" x1="1" x2="0">
  <stop stop-color="#eeeeee"/>
  <stop offset="1" stop-color="#555555"/>
</linearGradient>

<linearGradient id="sak-light-brightness-gradient--orange" x1="1" x2="0">
  <stop stop-color="white"/>
  <stop offset="1" stop-color="darkorange"/>
</linearGradient>

<linearGradient id="sak-light-brightness-gradient--reverse" x1="1" x2="0">
  <stop stop-color="#555555"/>
  <stop offset="1" stop-color="#eeeeee"/>
</linearGradient>

<linearGradient id="sak-light-color-temperature-gradient" x1="1" x2="0">
  <stop stop-color="#ffa000"/>
  <stop offset=".5" stop-color="#fff"/>
  <stop offset="1" stop-color="#a6d1ff"/>
</linearGradient>

<linearGradient id="sak-boiler-setpoint-blue-orange-gradient" x1="1" x2="0">
  <stop stop-color="#ff8c00"/>
  <stop offset="1" stop-color="#0094ff"/>
</linearGradient>

<radialGradient id="sak-mask-radial-gradient">
  <stop offset="0" stop-color="white" stop-opacity="1"/>
  <stop offset="0.8" stop-color="white" stop-opacity="0.8"/>
  <stop offset="1" stop-color="white" stop-opacity="0"/>
</radialGradient>`,
      },
    ],
  },
  // Card/toolset templates remain user-defined (not bundled).
  templates: {} as Record<string, any>,
};

export default SAK_BUILTIN_TEMPLATES;
