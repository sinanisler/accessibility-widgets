/*
===========================================
  ACCESSIBILITY WIDGET
  A comprehensive web accessibility tool
===========================================
*/

// ===========================================
// CONFIGURATION VARIABLES
// ===========================================

// Default configuration - can be overridden by user
const DEFAULT_WIDGET_CONFIG = {
  // Core Features
  enableHighContrast: true,
  enableBiggerText: true,
  enableTextSpacing: true,
  enablePauseAnimations: true,
  enableHideImages: true,
  enableDyslexiaFont: true,
  enableBiggerCursor: true,
  enableLineHeight: true,
  enableTextAlign: true,

  // Advanced Features
  enableScreenReader: true,
  enableVoiceControl: true,
  enableReducedMotion: true,
  enableFontSelection: true,
  enableColorFilter: true,

  // Widget Styling
  widgetWidth: '440px',
  widgetPosition: {
    side: 'right', // 'left' or 'right'
    right: '20px',
    left: '20px',
    bottom: '20px'
  },

  // Colors
  colors: {
    primary: '#1663d7',           // Header bg, main button bg, active border, close hover bg
    secondary: '#ffffff',         // Main button icon color
    optionBg: '#ffffff',         // Option button background
    optionText: '#333333',       // Option button text color
    optionIcon: '#000000'        // Option button icon color
  },

  // Button styling
  button: {
    size: '55px',
    borderRadius: '100px',
    iconSize: '40px',
    shadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },

  // Menu styling
  menu: {
    headerHeight: '55px',
    padding: '0 10px 10px 10px',
    optionPadding: '20px 10px',
    optionMargin: '10px',
    borderRadius: '8px',
    fontSize: '16px',
    titleFontSize: '22px',
    closeButtonSize: '44px'
  },

  // Typography
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    titleFontSize: '22px',
    titleFontWeight: '500',
    lineHeight: '1'
  },

  // Animation
  animation: {
    transition: '0.2s',
    hoverScale: '1.05'
  },

  // Language/Text Configuration
  lang: {
    accessibilityMenu: 'Accessibility Menu',
    closeAccessibilityMenu: 'Close Accessibility Menu',
    accessibilityTools: 'Accessibility Tools',
    resetAllSettings: 'Reset All Settings',
    screenReader: 'Screen Reader',
    voiceCommand: 'Voice Command',
    textSpacing: 'Text Spacing',
    pauseAnimations: 'Pause Animations',
    hideImages: 'Hide Images',
    dyslexiaFriendly: 'Dyslexia Friendly',
    biggerCursor: 'Bigger Cursor',
    lineHeight: 'Line Height',
    reducedMotion: 'Reduced Motion',
    fontSelection: 'Font Selection',
    colorFilter: 'Color Filter',
    textAlign: 'Text Align',
    textSize: 'Text Size',
    highContrast: 'High Contrast',
    defaultFont: 'Default Font',
    noFilter: 'No Filter',
    default: 'Default',
    screenReaderOn: 'Screen reader on',
    screenReaderOff: 'Screen reader off',
    voiceControlActivated: 'Voice control activated',
    notSupportedBrowser: 'is not supported in this browser',
    close: 'Close',
    reset: 'Reset'
  },

  // Voice Command Configuration - Developers can customize commands for different languages
  voiceCommands: {
    showMenu: ['show menu', 'open menu', 'accessibility menu'],
    highContrast: ['high contrast'],
    biggerText: ['bigger text', 'large text'],
    textSpacing: ['text spacing'],
    pauseAnimations: ['pause animations', 'stop animations'],
    hideImages: ['hide images'],
    dyslexiaFont: ['dyslexia friendly', 'dyslexia font'],
    biggerCursor: ['bigger cursor', 'large cursor'],
    lineHeight: ['line height'],
    textAlign: ['align text', 'text align'],
    screenReader: ['screen reader'],
    voiceControl: ['voice command', 'voice control'],
    resetAll: ['reset all', 'reset everything']
  },

  // Grid Layout Configuration
  gridLayout: {
    columns: '1fr 1fr', // Default 2-column layout (can be changed to '1fr 1fr 1fr' for 3 columns, etc.)
    gap: '10px' // Gap between grid items
  }
};

// Function to deep merge user configuration with defaults
function mergeConfigs(defaultConfig, userConfig) {
  const result = { ...defaultConfig };

  if (!userConfig) return result;

  for (const key in userConfig) {
    if (userConfig.hasOwnProperty(key)) {
      if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
        result[key] = mergeConfigs(defaultConfig[key] || {}, userConfig[key]);
      } else {
        result[key] = userConfig[key];
      }
    }
  }

  return result;
}

// Merge user configuration with defaults
// Users can define window.ACCESSIBILITY_WIDGET_CONFIG before loading this script
const WIDGET_CONFIG = mergeConfigs(DEFAULT_WIDGET_CONFIG, window.ACCESSIBILITY_WIDGET_CONFIG || {});

// ===========================================
// STYLES & VISUAL ASSETS
// ===========================================

// Widget styles (will go inside Shadow DOM - NOT affected by page styles or accessibility features)
const widgetStyles = `
  :host {
    all: initial;
    font-family: ${WIDGET_CONFIG.typography.fontFamily};
  }
  
  * {
    box-sizing: border-box;
  }
  
  #snn-accessibility-fixed-button {
    position: fixed !important;
    ${WIDGET_CONFIG.widgetPosition.side}: ${WIDGET_CONFIG.widgetPosition[WIDGET_CONFIG.widgetPosition.side]} !important;
    bottom: ${WIDGET_CONFIG.widgetPosition.bottom} !important;
    z-index: 9999;
  }
  
  #snn-accessibility-button {
    background: ${WIDGET_CONFIG.colors.primary};
    border: none;
    border-radius: ${WIDGET_CONFIG.button.borderRadius};
    cursor: pointer;
    width: ${WIDGET_CONFIG.button.size};
    height: ${WIDGET_CONFIG.button.size};
    box-shadow: ${WIDGET_CONFIG.button.shadow};
    transition: ${WIDGET_CONFIG.animation.transition} !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #snn-accessibility-button:hover {
    transform: scale(${WIDGET_CONFIG.animation.hoverScale});
  }
  
  #snn-accessibility-button:focus {
    outline: 2px solid ${WIDGET_CONFIG.colors.secondary};
    outline-offset: 2px;
  }
  
  #snn-accessibility-button svg {
    width: ${WIDGET_CONFIG.button.iconSize};
    height: ${WIDGET_CONFIG.button.iconSize};
    fill: ${WIDGET_CONFIG.colors.secondary};
    pointer-events: none;
  }
  
  #snn-accessibility-menu {
    position: fixed;
    top: 0;
    ${WIDGET_CONFIG.widgetPosition.side}: 0;
    width: ${WIDGET_CONFIG.widgetWidth};
    height: 100vh;
    overflow-y: auto;
    background-color: #e2e2e2;
    padding: 0;
    display: none;
    font-family: ${WIDGET_CONFIG.typography.fontFamily};
    z-index: 999999;
    scrollbar-width: thin;
  }
  
  .snn-accessibility-option {
    font-size: ${WIDGET_CONFIG.menu.fontSize};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 10px;
    width: 100%;
    background-color: ${WIDGET_CONFIG.colors.optionBg};
    color: ${WIDGET_CONFIG.colors.optionText};
    border: 2px solid ${WIDGET_CONFIG.colors.optionBg};
    cursor: pointer;
    border-radius: ${WIDGET_CONFIG.menu.borderRadius};
    transition: background-color ${WIDGET_CONFIG.animation.transition}, border-color ${WIDGET_CONFIG.animation.transition};
    line-height: ${WIDGET_CONFIG.typography.lineHeight} !important;
    gap: 10px;
    min-height: 120px;
  }
  
  .snn-accessibility-option:hover {
    border-color: ${WIDGET_CONFIG.colors.primary};
  }
  
  .snn-accessibility-option.active {
    border-color: ${WIDGET_CONFIG.colors.primary};
  }
  
  .snn-accessibility-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .snn-icon {
    width: ${WIDGET_CONFIG.button.iconSize};
    height: ${WIDGET_CONFIG.button.iconSize};
    fill: ${WIDGET_CONFIG.colors.optionIcon};
    flex-shrink: 0;
  }
  
  .snn-icon svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
  
  .snn-button-text {
    text-align: center;
    line-height: 1.2;
    font-size:16px;
    font-weight: 600;
  }
  
  .snn-option-steps {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    margin-top: 5px;
  }
  
  .snn-option-step {
    width: 30px;
    height: 10px;
    border-radius: 3px;
    background-color: #d0d0d0;
    transition: background-color ${WIDGET_CONFIG.animation.transition};
  }
  
  .snn-option-step.active {
    background-color: ${WIDGET_CONFIG.colors.primary};
  }
  
  .snn-close, .snn-reset-button {
    background: none;
    border: none;
    font-size: ${WIDGET_CONFIG.menu.closeButtonSize};
    color: ${WIDGET_CONFIG.colors.secondary};
    cursor: pointer;
    line-height: ${WIDGET_CONFIG.typography.lineHeight};
    border-radius: ${WIDGET_CONFIG.button.borderRadius};
    width: ${WIDGET_CONFIG.menu.closeButtonSize};
    height: ${WIDGET_CONFIG.menu.closeButtonSize};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .snn-close::before {
    content: '×';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${WIDGET_CONFIG.menu.closeButtonSize};
    line-height: 1;
  }
  
  .snn-reset-button svg {
    width: 22px;
    height: 22px;
    fill: ${WIDGET_CONFIG.colors.secondary};
  }
  
  .snn-close:focus, .snn-reset-button:focus {
    outline: solid 2px ${WIDGET_CONFIG.colors.secondary};
  }
  
  .snn-close:hover, .snn-reset-button:hover {
    color: ${WIDGET_CONFIG.colors.secondary};
    background: rgba(255, 255, 255, 0.2);
  }
  
  /* Tooltip styles */
  .snn-tooltip {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 1000;
  }
  
  .snn-tooltip::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.8);
  }
  
  .snn-close:hover .snn-tooltip,
  .snn-close:focus .snn-tooltip,
  .snn-reset-button:hover .snn-tooltip,
  .snn-reset-button:focus .snn-tooltip {
    opacity: 1;
  }
  
  .snn-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    background: ${WIDGET_CONFIG.colors.primary};
    height: ${WIDGET_CONFIG.menu.headerHeight};
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    gap: 8px;
  }
  
  .snn-content {
    padding: 0 10px 10px 10px;
  }
  
  .snn-options-grid {
    display: grid;
    grid-template-columns: ${WIDGET_CONFIG.gridLayout.columns};
    gap: ${WIDGET_CONFIG.gridLayout.gap};
    margin-bottom: 20px;
  }
  
  .snn-title {
    margin: 0;
    font-size: ${WIDGET_CONFIG.menu.titleFontSize};
    color: ${WIDGET_CONFIG.colors.secondary};
    line-height: ${WIDGET_CONFIG.typography.lineHeight} !important;
    margin-left: 5px;
    font-weight: ${WIDGET_CONFIG.typography.titleFontWeight};
    flex: 1;
  }
`;

// Page accessibility styles (will go in main document - these affect the page, NOT the widget)
const pageStyles = `
  /* High Contrast Modes */
  .snn-high-contrast-medium {
    filter: none !important;
  }
  .snn-high-contrast-medium *:not(#snn-accessibility-widget-container):not(#snn-accessibility-widget-container *) {
    filter: contrast(1.3) !important;
  }
  
  .snn-high-contrast-high {
    background-color: #000 !important;
    color: #fff !important;
    filter: none !important;
  }
  .snn-high-contrast-high *:not(#snn-accessibility-widget-container):not(#snn-accessibility-widget-container *) {
    background-color: #000 !important;
    color: #fff !important;
    filter: contrast(1.5) !important;
  }
  
  .snn-high-contrast-ultra {
    background-color: #000 !important;
    color: #ffff00 !important;
    filter: none !important;
  }
  .snn-high-contrast-ultra *:not(#snn-accessibility-widget-container):not(#snn-accessibility-widget-container *) {
    background-color: #000 !important;
    color: #ffff00 !important;
    filter: contrast(2.0) !important;
  }
  
  /* Text Size */
  .snn-bigger-text-medium * {
    font-size: 20px !important;
  }
  .snn-bigger-text-large * {
    font-size: 24px !important;
  }
  .snn-bigger-text-xlarge * {
    font-size: 28px !important;
  }
  
  /* Text Spacing */
  .snn-text-spacing * {
    letter-spacing: 0.2em !important;
    word-spacing: 0.3em !important;
  }
  
  /* Pause Animations */
  .snn-pause-animations * {
    animation: none !important;
    transition: none !important;
  }
  
  /* Dyslexia Font */
  .snn-dyslexia-font {
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Bradley Hand', 'Brush Script MT', fantasy !important;
  }
  .snn-dyslexia-font * {
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Bradley Hand', 'Brush Script MT', fantasy !important;
  }
  
  /* Line Height */
  .snn-line-height * {
    line-height: 2.5 !important;
  }
  
  /* Text Alignment */
  .snn-text-align-left * {
    text-align: left !important;
  }
  .snn-text-align-center * {
    text-align: center !important;
  }
  .snn-text-align-right * {
    text-align: right !important;
  }
  
  /* Bigger Cursor */
  .snn-bigger-cursor {
    cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA0OCA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAyVjcwTDIwIDU0SDM2TDQgMloiIGZpbGw9IiMwMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9zdmc+'), auto !important;
  }
  .snn-bigger-cursor * {
    cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA0OCA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAyVjcwTDIwIDU0SDM2TDQgMloiIGZpbGw9IiMwMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9zdmc+'), auto !important;
  }
  
  /* Font Selection */
  .snn-font-arial {
    font-family: Arial, sans-serif !important;
  }
  .snn-font-arial * {
    font-family: Arial, sans-serif !important;
  }
  .snn-font-times {
    font-family: 'Times New Roman', serif !important;
  }
  .snn-font-times * {
    font-family: 'Times New Roman', serif !important;
  }
  .snn-font-verdana {
    font-family: Verdana, sans-serif !important;
  }
  .snn-font-verdana * {
    font-family: Verdana, sans-serif !important;
  }
  
  /* Color Filters */
  .snn-filter-protanopia {
    filter: none !important;
  }
  .snn-filter-protanopia body > *:not(#snn-accessibility-widget-container) {
    filter: url('#protanopia-filter') !important;
  }
  .snn-filter-deuteranopia {
    filter: none !important;
  }
  .snn-filter-deuteranopia body > *:not(#snn-accessibility-widget-container) {
    filter: url('#deuteranopia-filter') !important;
  }
  .snn-filter-tritanopia {
    filter: none !important;
  }
  .snn-filter-tritanopia body > *:not(#snn-accessibility-widget-container) {
    filter: url('#tritanopia-filter') !important;
  }
  .snn-filter-grayscale {
    filter: none !important;
  }
  .snn-filter-grayscale body > *:not(#snn-accessibility-widget-container) {
    filter: grayscale(100%) !important;
  }
  .snn-reduced-motion * {
    animation: none !important;
    transition: none !important;
  }
  .snn-reduced-motion *::before {
    animation: none !important;
    transition: none !important;
  }
  .snn-reduced-motion *::after {
    animation: none !important;
    transition: none !important;
  }
  
  /* Protect widget container from page styles */
  #snn-accessibility-widget-container,
  #snn-accessibility-widget-container * {
    filter: none !important;
    background-color: initial !important;
    color: initial !important;
  }
`;

// ===========================================
// SVG ICONS
// ===========================================

const icons = {
  buttonsvg: `<svg xmlns="http://www.w3.org/2000/svg" style="fill:white;" viewBox="0 0 24 24" width="30px" height="30px"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>`,
  highContrast: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.2" viewBox="0 0 35 35"><path fill="currentColor" fill-rule="evenodd" d="M1.89998 15.6285c0-7.58203 6.14649-13.72852 13.72852-13.72852 7.5821 0 13.7286 6.14649 13.7286 13.72852 0 .6081-.0395 1.2069-.1161 1.794.5933.2913 1.1478.6497 1.6534 1.0654.1725-.9268.2627-1.8825.2627-2.8594 0-8.57615-6.9524-15.5285244-15.5286-15.5285244C7.05235.0999756.0999756 7.05235.0999756 15.6285c0 8.5762 6.9523744 15.5286 15.5285244 15.5286 1.2241 0 2.415-.1416 3.5574-.4093-.4388-.4866-.8222-1.0242-1.1402-1.6028-.7847.1394-1.5924.2121-2.4172.2121-7.58203 0-13.72852-6.1465-13.72852-13.7286Z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M2.35 15.6286C2.35 8.29502 8.29502 2.35 15.6286 2.35c7.3335 0 13.2785 5.94502 13.2785 13.2786 0 .5408-.0323 1.0741-.0951 1.5979.444.1881.8687.4128 1.2703.6703.1151-.7392.1748-1.4967.1748-2.2682C30.2571 7.54943 23.7077 1 15.6286 1 7.54943 1 1 7.54943 1 15.6286c0 8.0791 6.54943 14.6285 14.6286 14.6285 1.0033 0 1.9831-.101 2.9297-.2934-.276-.3898-.52-.8038-.7282-1.2382-.716.1195-1.4515.1816-2.2015.1816-7.33358 0-13.2786-5.945-13.2786-13.2785Z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M15.6286 1C7.54943 1 1 7.54943 1 15.6286c0 8.0791 6.54943 14.6285 14.6286 14.6285" clip-rule="evenodd"/><path stroke="currentColor" stroke-width="1.8" d="M15.6286 1C7.54943 1 1 7.54943 1 15.6286c0 8.0791 6.54943 14.6285 14.6286 14.6285"/><path fill="currentColor" fill-rule="evenodd" d="M22.8729 25.114c0-1.3811 1.0901-2.5007 2.4359-2.5007 1.3459 0 2.436 1.1196 2.436 2.5007 0 1.38-1.0901 2.4997-2.436 2.4997-1.3458 0-2.4359-1.1197-2.4359-2.4997Zm7.2258-2.0373c-.0899-.2248-.071-.4785.0512-.6875l.912-1.5598c.0898-.1532.0668-.3504-.0574-.4779l-1.0556-1.0832c-.1232-.1264-.3153-.1511-.4657-.0589l-1.5225.9374c-.201.1237-.4495.1427-.667.051-.2181-.092-.3797-.2819-.4358-.5118l-.4329-1.7763c-.0428-.1735-.1953-.2957-.3696-.2957h-1.4931c-.1744 0-.3268.1222-.3696.2957l-.433 1.7763c-.056.2299-.2177.4198-.4357.5118-.2176.0917-.466.0727-.6671-.051l-1.5225-.9374c-.1503-.0922-.3424-.0675-.4656.0589l-1.0556 1.0832c-.1243.1275-.1473.3247-.0575.4779l.9121 1.5598c.1222.209.1411.4627.0511.6875-.0895.2239-.2806.3916-.5142.4514l-1.7165.4395c-.1692.0439-.2882.2003-.2882.3803v1.5311c0 .18.119.3364.2882.3804l1.7165.4394c.2336.0599.4247.2276.5142.4515.09.2247.0711.4785-.0511.6874l-.9121 1.5599c-.0898.1532-.0668.3503.0575.4778l1.0556 1.0833c.1232.1264.3153.151.4656.0589l1.5225-.9374c.2011-.1238.4495-.1428.6671-.051.218.092.3797.2818.4357.5118l.433 1.7762c.0428.1736.1952.2968.3696.2968h1.4931c.1743 0 .3268-.1232.3696-.2968l.4329-1.7762c.0561-.23.2177-.4198.4358-.5118.2175-.0918.466-.0728.667.051l1.5225.9374c.1504.0921.3425.0675.4657-.0589l1.0556-1.0833c.1242-.1275.1472-.3246.0574-.4778l-.912-1.5599c-.1222-.2089-.1411-.4627-.0512-.6874.0896-.2239.2806-.3916.5142-.4515l1.7166-.4394c.1691-.044.2881-.2004.2881-.3804v-1.5311c0-.18-.119-.3364-.2881-.3803l-1.7166-.4395c-.2336-.0598-.4246-.2275-.5142-.4514Z" clip-rule="evenodd"/></svg>`,
  biggerText: `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 23"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-linejoin="round" d="M26.58 21.3225806V1m-7.92 4.06451613V1H34.5v4.06451613"/><path d="M22.62 21.3225806h7.92"/><path stroke-linejoin="round" d="M6.78 18.6129032V5.06451613M1.5 7.77419355V5.06451613h10.56v2.70967742"/><path d="M4.14 18.6129032h5.28"/></g></svg>`,
  textSpacing: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 16h44v4H10zm0 12h44v4H10zm0 12h44v4H10zm0 12h44v4H10z"/></svg>`,
  pauseAnimations: `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 37 36"><g fill="none" fill-rule="evenodd"><path fill="currentColor" d="M15.8087111 23.6666667h-1.2702778c-.4429444 0-.8018333-.3598334-.8018333-.8027778v-9.7277778c0-.4429444.3588889-.8027778.8018333-.8027778h1.2702778c.4429445 0 .8027778.3598334.8027778.8027778v9.7277778c0 .4429444-.3598333.8027778-.8027778.8027778m6.6525722 0h-1.2702777c-.442 0-.8018334-.3598334-.8018334-.8027778v-9.7277778c0-.4429444.3598334-.8027778.8018334-.8027778h1.2702777c.4438889 0 .8027778.3598334.8027778.8027778v9.7277778c0 .4429444-.3588889.8027778-.8027778.8027778"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.88888889" d="M18.5 4.77777778V1m0 34v-3.7777778M31.7222222 18H35.5m-34 0h3.77777778m3.87278889-9.34943333L6.47873333 5.97967778M30.5204167 30.0204167l-2.6708889-2.6708889m-.0000945-18.69896113 2.6708889-2.67088889M6.47911111 30.0204167l2.67183333-2.6708889M23.5542889 5.78219444l1.4440555-3.49066666M12.0013722 33.7087556l1.4440556-3.4906667m17.2723778-7.1638 3.4906666 1.4440555M2.79124444 11.5013722l3.49066667 1.4440556m7.15274999-7.15860558L11.9877722 2.2971m13.0246445 31.4061778-1.4468889-3.4897222m7.14765-17.2788945L34.2029 11.4877722M2.79672222 24.5124167l3.48972222-1.4468889"/></g></svg>`,
  hideImages: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 12C16 12 4 32 4 32s12 20 28 20 28-20 28-20S48 12 32 12zm0 32a12 12 0 1112-12 12 12 0 01-12 12z"/><circle cx="32" cy="32" r="8"/></svg>`,
  dyslexiaFont: `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 31 22"><path fill="currentColor" fill-rule="evenodd" d="M.5 22V1.0083333h7.2421899c6.8051611 0 11.6124768 4.3388889 11.6124768 10.4805556C19.3546667 17.6305556 14.547351 22 7.7421899 22H.5Zm2.4348742-4.31h4.8073157c5.3692097 0 9.1463863-2.8616703 9.1463863-7.27 0-4.3807776-3.7771766-7.2422222-9.1463863-7.2422222H2.9348742V17.69ZM26.2735913 4.0333333l.0114609 2.1694445h4.0126191V8.25h-4.001719L26.77 22h-3.535416L23.78 8.25h-2.4238344V6.2027778h2.55923l.0751088-2.1694445C24.0706908 1.6805556 25.6007488 0 27.697782 0 28.6896221 0 29.677687.3666667 30.5 1.0083333l-.9627285 1.6805556c-.3479788-.3666667-.9515992-.6416667-1.627768-.6416667-.8819593 0-1.6420082.825-1.6359122 1.9861111Z"/></svg>`,
  biggerCursor: `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 27 27"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15.9983464 11.5517813 9.5269972 9.52699721-4.4465655 4.44656549-9.5269972-9.52699717-4.05145413 9.06403815L1 1.0000004l24.0623846 6.5003268z"/></svg>`,
  lineHeight: `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 47 25"><g fill="none" fill-rule="evenodd"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M3.99999962 2.71042226V22.7104223"/><path fill="currentColor" d="m.16814235 20.5270412 3.44487862 4.2104072c.17486379.2137224.48987514.2452235.70359754.0703597a.4999988.4999988 0 0 0 .07035976-.0703597l3.44487862-4.2104072c.17486378-.2137225.14336265-.5287338-.07035976-.7035976-.08933106-.073089-.20119771-.1130213-.31661889-.1130213H.555121c-.27614238 0-.5.2238576-.5.5 0 .1154211.0399323.2272878.11302135.3166189Zm0-16.1332381L3.61302097.18339592c.17486379-.21372241.48987514-.24522355.70359754-.07035976a.49999975.49999975 0 0 1 .07035976.07035976l3.44487862 4.2104072c.17486378.2137224.14336265.52873375-.07035976.70359754-.08933106.07308905-.20119771.11302135-.31661889.11302135H.555121c-.27614237 0-.5-.22385762-.5-.5 0-.11542118.0399323-.22728783.11302135-.3166189Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.4999996 1.71042226h30m-30 7h30m-30 7.00000004h30m-30 7h24"/></g></svg>`,
  textAlign: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 16h44v4H10zm0 12h44v4H10zm0 12h44v4H10zm0 12h44v4H10z"/></svg>`,
  screenReader: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 24 L24 24 L32 16 L32 48 L24 40 L16 40 Z" fill="#333" stroke="#555" stroke-width="2"/><path d="M36 20 C42 24, 42 40, 36 44" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M36 12 C48 24, 48 40, 36 52" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"/><rect x="28" y="48" width="8" height="8" fill="#ccc"/></svg>`,
  resetAll: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 17" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-width="1.84"><path d="M16.20106 8c0 .9667-.189683 1.8872-.5324673 2.7251-.3427843.8372-.8386698 1.5911-1.4517524 2.2246-.6130825.6335-1.3426846 1.1459-2.152902 1.5001-.8108948.3542-1.70172746.5502-2.6372711.5502-.93554365 0-1.8263763-.196-2.63727112-.5502-.81021738-.3542-1.53981948-.8666-2.15290203-1.5001M2.6522744 8c0-.9667.189683-1.8872.53246728-2.7251.34278427-.8372.83866982-1.5911 1.45175237-2.2246.61308255-.6335 1.34268465-1.1459 2.15290203-1.5001C7.6002909 1.196 8.49112355 1 9.4266672 1c.93554364 0 1.8263763.196 2.6372711.5502.8102174.3542 1.5398195.8666 2.152902 1.5001"></path><path stroke-linejoin="round" d="m4.92576062 6.96092-2.48958935 1.484L1 5.87242m13.0125924 2.93832 2.3886509-1.652L18 9.62694"></path></g></svg>`,
  voiceControl: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 44a12 12 0 0012-12V20a12 12 0 10-24 0v12a12 12 0 0012 12z" fill="#333"/><path d="M20 32h24v4H20z" fill="#555"/><path d="M32 48v8" stroke="#555" stroke-width="4" stroke-linecap="round"/></svg>`,
  fontSelection: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="40" font-family="serif" font-size="24" text-anchor="middle" fill="#333">Aa</text><path d="M8 48h48v2H8z"/></svg>`,
  colorFilter: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#333" stroke-width="2"/><path d="M32 8a24 24 0 000 48V8z" fill="#f00" opacity="0.3"/><path d="M32 8a24 24 0 000 48" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="4,2"/></svg>`,
  reducedMotion: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="24" width="8" height="16" fill="#333"/><rect x="28" y="24" width="8" height="16" fill="#333"/><rect x="40" y="24" width="8" height="16" fill="#333"/></svg>`,
};

// ===========================================
// SHADOW DOM SETUP
// ===========================================

let shadowRoot = null;

// Inject styles into the page (NOT the widget)
function injectPageStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = pageStyles;
  styleSheet.id = 'snn-accessibility-page-styles';
  document.head.appendChild(styleSheet);

  // Add SVG color blindness filters to main document
  const svgFilters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgFilters.style.position = 'absolute';
  svgFilters.style.width = '0';
  svgFilters.setAttribute('class', 'snn-accessibility-filters');
  svgFilters.style.height = '0';
  svgFilters.innerHTML = `
    <defs>
      <filter id="protanopia-filter">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="deuteranopia-filter">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="tritanopia-filter">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svgFilters);
}

// Create shadow DOM container
function createShadowContainer() {
  const container = document.createElement('div');
  container.id = 'snn-accessibility-widget-container';
  document.body.appendChild(container);

  // Create shadow root
  shadowRoot = container.attachShadow({ mode: 'open' });

  // Add widget styles to shadow DOM
  const styleElement = document.createElement('style');
  styleElement.textContent = widgetStyles;
  shadowRoot.appendChild(styleElement);

  return shadowRoot;
}

// ===========================================
// CORE UTILITY FUNCTIONS
// ===========================================

// Cache for DOM elements to improve performance
const domCache = {
  body: document.body,
  documentElement: document.documentElement,
  images: null,
  lastImageUpdate: 0,
  getImages: function () {
    const now = Date.now();
    if (!this.images || now - this.lastImageUpdate > 5000) {
      this.images = document.querySelectorAll('img');
      this.lastImageUpdate = now;
    }
    return this.images;
  }
};

// Apply saved settings from localStorage (optimized)
function applySettings() {
  const settings = [
    { key: 'biggerCursor', className: 'snn-bigger-cursor' },
    { key: 'biggerText', className: 'snn-bigger-text' },
    { key: 'highContrast', className: 'snn-high-contrast' },
    { key: 'dyslexiaFont', className: 'snn-dyslexia-font' },
    { key: 'lineHeight', className: 'snn-line-height' },
    { key: 'textAlign', className: 'snn-text-align' },
    { key: 'pauseAnimations', className: 'snn-pause-animations' },
    { key: 'textSpacing', className: 'snn-text-spacing' },
    { key: 'reducedMotion', className: 'snn-reduced-motion' },
  ];

  // Batch DOM operations for better performance
  const bodyClassesToAdd = [];
  const bodyClassesToRemove = [];
  const docClassesToAdd = [];
  const docClassesToRemove = [];

  settings.forEach(({ key, className, target = domCache.body }) => {
    const isActive = localStorage.getItem(key) === 'true';
    if (className) {
      if (target === domCache.documentElement) {
        if (isActive) {
          docClassesToAdd.push(className);
        } else {
          docClassesToRemove.push(className);
        }
      } else {
        if (isActive) {
          bodyClassesToAdd.push(className);
        } else {
          bodyClassesToRemove.push(className);
        }
      }
    }
  });

  // Apply all class changes at once
  if (bodyClassesToAdd.length > 0) {
    domCache.body.classList.add(...bodyClassesToAdd);
  }
  if (bodyClassesToRemove.length > 0) {
    domCache.body.classList.remove(...bodyClassesToRemove);
  }
  if (docClassesToAdd.length > 0) {
    domCache.documentElement.classList.add(...docClassesToAdd);
  }
  if (docClassesToRemove.length > 0) {
    domCache.documentElement.classList.remove(...docClassesToRemove);
  }

  // Handle font selection
  const fontClasses = ['snn-font-arial', 'snn-font-times', 'snn-font-verdana'];
  domCache.body.classList.remove(...fontClasses);
  const selectedFont = localStorage.getItem('fontSelection');
  if (selectedFont) {
    domCache.body.classList.add(`snn-font-${selectedFont}`);
  }

  // Handle color filters
  const filterClasses = ['snn-filter-protanopia', 'snn-filter-deuteranopia', 'snn-filter-tritanopia', 'snn-filter-grayscale'];
  domCache.documentElement.classList.remove(...filterClasses);
  const selectedFilter = localStorage.getItem('colorFilter');
  if (selectedFilter) {
    domCache.documentElement.classList.add(`snn-filter-${selectedFilter}`);
  }

  // Handle text alignment
  const alignClasses = ['snn-text-align-left', 'snn-text-align-center', 'snn-text-align-right'];
  domCache.body.classList.remove(...alignClasses);
  const selectedAlign = localStorage.getItem('textAlign');
  if (selectedAlign) {
    domCache.body.classList.add(`snn-text-align-${selectedAlign}`);
  }

  // Handle bigger text
  const textClasses = ['snn-bigger-text-medium', 'snn-bigger-text-large', 'snn-bigger-text-xlarge'];
  domCache.body.classList.remove(...textClasses);
  const selectedTextSize = localStorage.getItem('biggerText');
  if (selectedTextSize) {
    domCache.body.classList.add(`snn-bigger-text-${selectedTextSize}`);
  }

  // Handle high contrast
  const contrastClasses = ['snn-high-contrast-medium', 'snn-high-contrast-high', 'snn-high-contrast-ultra'];
  domCache.body.classList.remove(...contrastClasses);
  const selectedContrast = localStorage.getItem('highContrast');
  if (selectedContrast) {
    domCache.body.classList.add(`snn-high-contrast-${selectedContrast}`);
  }

  // Handle images with cached query
  const hideImages = localStorage.getItem('hideImages') === 'true';
  const displayStyle = hideImages ? 'none' : '';
  domCache.getImages().forEach((img) => {
    img.style.display = displayStyle;
  });

  if (screenReader.active && screenReader.isSupported) {
    document.addEventListener('focusin', screenReader.handleFocus);
  }

  if (voiceControl.isActive && voiceControl.isSupported) {
    voiceControl.startListening();
  }
}

// ===========================================
// UI COMPONENTS
// ===========================================

// Create the accessibility button
function createAccessibilityButton() {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'snn-accessibility-fixed-button';

  const button = document.createElement('button');
  button.id = 'snn-accessibility-button';
  button.innerHTML = icons.buttonsvg;
  button.setAttribute('aria-label', WIDGET_CONFIG.lang.accessibilityMenu);

  button.addEventListener('click', function () {
    toggleMenu();
  });

  button.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  buttonContainer.appendChild(button);
  shadowRoot.appendChild(buttonContainer);
}

// Reset all accessibility settings
function resetAccessibilitySettings() {
  const keys = [
    'biggerCursor',
    'biggerText',
    'dyslexiaFont',
    'hideImages',
    'lineHeight',
    'pauseAnimations',
    'screenReader',
    'textAlign',
    'textSpacing',
    'highContrast',
    'voiceControl',
    'reducedMotion',
    'fontSelection',
    'colorFilter',
  ];
  keys.forEach((key) => localStorage.removeItem(key));

  // Remove all CSS classes
  const cssClasses = [
    'snn-bigger-cursor',
    'snn-bigger-text',
    'snn-dyslexia-font',
    'snn-pause-animations',
    'snn-text-spacing',
    'snn-line-height',
    'snn-text-align',
    'snn-reduced-motion',
    'snn-font-arial',
    'snn-font-times',
    'snn-font-verdana'
  ];
  cssClasses.forEach(cls => document.body.classList.remove(cls));

  const bodyClasses2 = [
    'snn-high-contrast-medium',
    'snn-high-contrast-high',
    'snn-high-contrast-ultra'
  ];
  bodyClasses2.forEach(cls => document.body.classList.remove(cls));

  const documentClasses = [
    'snn-filter-protanopia',
    'snn-filter-deuteranopia',
    'snn-filter-tritanopia',
    'snn-filter-grayscale'
  ];
  documentClasses.forEach(cls => document.documentElement.classList.remove(cls));

  const textSizeClasses = [
    'snn-bigger-text-medium',
    'snn-bigger-text-large',
    'snn-bigger-text-xlarge'
  ];
  textSizeClasses.forEach(cls => document.body.classList.remove(cls));

  domCache.getImages().forEach((img) => (img.style.display = ''));

  if (screenReader.active) {
    screenReader.toggle(false);
  }

  if (voiceControl.isActive) {
    voiceControl.toggle(false);
  }

  applySettings();

  const buttons = shadowRoot.querySelectorAll('#snn-accessibility-menu .snn-accessibility-option');
  buttons.forEach((button) => {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
    
    // Reset step indicators
    const steps = button.querySelectorAll('.snn-option-step');
    steps.forEach(step => step.classList.remove('active'));
  });
}

// Create toggle buttons for accessibility options
function createToggleButton(
  buttonText,
  localStorageKey,
  className,
  targetElement = document.body,
  customToggleFunction = null,
  iconSVG = '',
  requiresFeature = null
) {
  const button = document.createElement('button');
  button.innerHTML = `
    <span class="snn-icon">${iconSVG}</span>
    <span class="snn-button-text">${buttonText}</span>
  `;
  button.setAttribute('data-key', localStorageKey);
  button.setAttribute('aria-label', buttonText);
  button.classList.add('snn-accessibility-option');

  // Check if feature is supported
  if (requiresFeature && !requiresFeature.isSupported) {
    button.disabled = true;
    button.setAttribute('title', `${buttonText} ${WIDGET_CONFIG.lang.notSupportedBrowser}`);
    button.style.opacity = '0.5';
    return button;
  }

  const isActive = localStorage.getItem(localStorageKey) === 'true';
  button.setAttribute('aria-pressed', isActive);
  button.setAttribute('role', 'switch');
  if (isActive) {
    button.classList.add('active');
  }

  button.addEventListener('click', function () {
    handleToggle();
  });

  button.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  });

  function handleToggle() {
    const newIsActive = localStorage.getItem(localStorageKey) !== 'true';

    // If there's a custom toggle function, call it and check if it succeeded
    if (customToggleFunction) {
      const success = customToggleFunction(newIsActive);
      if (success === false) {
        // Feature not supported or failed
        return;
      }
    }

    localStorage.setItem(localStorageKey, newIsActive);
    button.setAttribute('aria-pressed', newIsActive);

    if (newIsActive) {
      button.classList.add('active');
      if (className) {
        targetElement.classList.add(className);
      }
    } else {
      button.classList.remove('active');
      if (className) {
        targetElement.classList.remove(className);
      }
    }
  }

  return button;
}

// Create special action buttons (for cycling through options)
function createActionButton(buttonText, actionFunction, iconSVG, optionsConfig = null) {
  const button = document.createElement('button');
  
  let buttonHTML = `
    <span class="snn-icon">${iconSVG}</span>
    <span class="snn-button-text">${buttonText}</span>
  `;
  
  // Add option steps if configured
  if (optionsConfig) {
    buttonHTML += '<div class="snn-option-steps">';
    for (let i = 0; i < optionsConfig.count; i++) {
      buttonHTML += '<div class="snn-option-step"></div>';
    }
    buttonHTML += '</div>';
  }
  
  button.innerHTML = buttonHTML;
  button.setAttribute('aria-label', buttonText);
  button.classList.add('snn-accessibility-option');
  button.setAttribute('data-options-config', optionsConfig ? JSON.stringify(optionsConfig) : '');

  // Update initial status
  updateActionButtonStatus(button, buttonText, optionsConfig);

  button.addEventListener('click', function () {
    const result = actionFunction();
    if (result) {
      updateActionButtonStatus(button, buttonText, optionsConfig);
    }
  });

  button.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const result = actionFunction();
      if (result) {
        updateActionButtonStatus(button, buttonText, optionsConfig);
      }
    }
  });

  return button;
}

// Update action button status on page load
function updateActionButtonStatus(button, buttonText, optionsConfig) {
  if (!optionsConfig) return;
  
  const steps = button.querySelectorAll('.snn-option-step');
  let currentIndex = -1;
  
  if (buttonText.includes('Font')) {
    const currentFont = localStorage.getItem('fontSelection');
    const fonts = ['arial', 'times', 'verdana'];
    currentIndex = currentFont ? fonts.indexOf(currentFont) : -1;
  } else if (buttonText.includes('Color')) {
    const currentFilter = localStorage.getItem('colorFilter');
    const filters = ['protanopia', 'deuteranopia', 'tritanopia', 'grayscale'];
    currentIndex = currentFilter ? filters.indexOf(currentFilter) : -1;
  } else if (buttonText.includes('Text Align')) {
    const currentAlign = localStorage.getItem('textAlign');
    const alignments = ['left', 'center', 'right'];
    currentIndex = currentAlign ? alignments.indexOf(currentAlign) : -1;
  } else if (buttonText.includes('Text Size')) {
    const currentSize = localStorage.getItem('biggerText');
    const sizes = ['medium', 'large', 'xlarge'];
    currentIndex = currentSize ? sizes.indexOf(currentSize) : -1;
  } else if (buttonText.includes('High Contrast')) {
    const currentContrast = localStorage.getItem('highContrast');
    const contrasts = ['medium', 'high', 'ultra'];
    currentIndex = currentContrast ? contrasts.indexOf(currentContrast) : -1;
  }
  
  // Update step indicators
  steps.forEach((step, index) => {
    if (index === currentIndex) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// ===========================================
// FEATURE TOGGLE FUNCTIONS
// ===========================================

// Function to hide or show images (optimized)
function toggleHideImages(isActive) {
  const displayStyle = isActive ? 'none' : '';
  domCache.getImages().forEach((img) => {
    img.style.display = displayStyle;
  });
}

// Font selection handler (optimized)
function handleFontSelection() {
  const fonts = ['arial', 'times', 'verdana'];
  const currentFont = localStorage.getItem('fontSelection') || 'default';
  const currentIndex = fonts.indexOf(currentFont);
  const nextIndex = (currentIndex + 1) % (fonts.length + 1); // +1 for default

  // Remove all font classes in one operation
  const fontClasses = ['snn-font-arial', 'snn-font-times', 'snn-font-verdana'];
  domCache.body.classList.remove(...fontClasses);

  if (nextIndex === fonts.length) {
    // Default font
    localStorage.removeItem('fontSelection');
    return WIDGET_CONFIG.lang.defaultFont;
  } else {
    const selectedFont = fonts[nextIndex];
    localStorage.setItem('fontSelection', selectedFont);
    domCache.body.classList.add(`snn-font-${selectedFont}`);
    return selectedFont.charAt(0).toUpperCase() + selectedFont.slice(1);
  }
}

// Color filter handler (optimized)
function handleColorFilter() {
  const filters = ['protanopia', 'deuteranopia', 'tritanopia', 'grayscale'];
  const currentFilter = localStorage.getItem('colorFilter') || 'none';
  const currentIndex = filters.indexOf(currentFilter);
  const nextIndex = (currentIndex + 1) % (filters.length + 1); // +1 for none

  // Remove all filter classes in one operation
  const filterClasses = ['snn-filter-protanopia', 'snn-filter-deuteranopia', 'snn-filter-tritanopia', 'snn-filter-grayscale'];
  domCache.documentElement.classList.remove(...filterClasses);

  if (nextIndex === filters.length) {
    // No filter
    localStorage.removeItem('colorFilter');
    return WIDGET_CONFIG.lang.noFilter;
  } else {
    const selectedFilter = filters[nextIndex];
    localStorage.setItem('colorFilter', selectedFilter);
    domCache.documentElement.classList.add(`snn-filter-${selectedFilter}`);
    return selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);
  }
}

// Text align handler with 3 states
function handleTextAlign() {
  const alignments = ['left', 'center', 'right'];
  const currentAlign = localStorage.getItem('textAlign') || 'none';
  const currentIndex = alignments.indexOf(currentAlign);
  const nextIndex = (currentIndex + 1) % (alignments.length + 1); // +1 for none

  // Remove all alignment classes
  const alignClasses = ['snn-text-align-left', 'snn-text-align-center', 'snn-text-align-right'];
  domCache.body.classList.remove(...alignClasses);

  if (nextIndex === alignments.length) {
    // Default alignment
    localStorage.removeItem('textAlign');
    return WIDGET_CONFIG.lang.default;
  } else {
    const selectedAlign = alignments[nextIndex];
    localStorage.setItem('textAlign', selectedAlign);
    domCache.body.classList.add(`snn-text-align-${selectedAlign}`);
    return selectedAlign.charAt(0).toUpperCase() + selectedAlign.slice(1);
  }
}

// Bigger text handler with 3 states
function handleBiggerText() {
  const textSizes = ['medium', 'large', 'xlarge'];
  const currentSize = localStorage.getItem('biggerText') || 'none';
  const currentIndex = textSizes.indexOf(currentSize);
  const nextIndex = (currentIndex + 1) % (textSizes.length + 1); // +1 for none

  // Remove all text size classes
  const textClasses = ['snn-bigger-text-medium', 'snn-bigger-text-large', 'snn-bigger-text-xlarge'];
  domCache.body.classList.remove(...textClasses);

  if (nextIndex === textSizes.length) {
    // Default text size
    localStorage.removeItem('biggerText');
    return WIDGET_CONFIG.lang.default;
  } else {
    const selectedSize = textSizes[nextIndex];
    localStorage.setItem('biggerText', selectedSize);
    domCache.body.classList.add(`snn-bigger-text-${selectedSize}`);
    return selectedSize === 'xlarge' ? 'X-Large' : selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1);
  }
}

// High contrast handler with 3 states
function handleHighContrast() {
  const contrastLevels = ['medium', 'high', 'ultra'];
  const currentContrast = localStorage.getItem('highContrast') || 'none';
  const currentIndex = contrastLevels.indexOf(currentContrast);
  const nextIndex = (currentIndex + 1) % (contrastLevels.length + 1); // +1 for none

  // Remove all contrast classes
  const contrastClasses = ['snn-high-contrast-medium', 'snn-high-contrast-high', 'snn-high-contrast-ultra'];
  domCache.body.classList.remove(...contrastClasses);

  if (nextIndex === contrastLevels.length) {
    // Default contrast
    localStorage.removeItem('highContrast');
    return WIDGET_CONFIG.lang.default;
  } else {
    const selectedContrast = contrastLevels[nextIndex];
    localStorage.setItem('highContrast', selectedContrast);
    domCache.body.classList.add(`snn-high-contrast-${selectedContrast}`);
    return selectedContrast.charAt(0).toUpperCase() + selectedContrast.slice(1);
  }
}

// ===========================================
// ACCESSIBILITY FEATURES
// ===========================================

// Screen reader functionality
const screenReader = {
  active: localStorage.getItem('screenReader') === 'true',
  isSupported: 'speechSynthesis' in window,
  handleFocus: function (event) {
    if (screenReader.active && screenReader.isSupported) {
      try {
        const content = event.target.innerText || event.target.alt || event.target.title || '';
        if (content.trim() !== '') {
          window.speechSynthesis.cancel();
          const speech = new SpeechSynthesisUtterance(content);
          speech.lang = 'en-US';
          speech.onerror = function (event) {
            console.warn('Speech synthesis error:', event.error);
          };
          window.speechSynthesis.speak(speech);
        }
      } catch (error) {
        console.warn('Screen reader error:', error);
      }
    }
  },
  toggle: function (isActive) {
    if (!screenReader.isSupported) {
      console.warn(`Speech synthesis ${WIDGET_CONFIG.lang.notSupportedBrowser}`);
      return false;
    }

    screenReader.active = isActive;
    localStorage.setItem('screenReader', isActive);

    try {
      if (isActive) {
        document.addEventListener('focusin', screenReader.handleFocus);
        const feedbackSpeech = new SpeechSynthesisUtterance(WIDGET_CONFIG.lang.screenReaderOn);
        feedbackSpeech.lang = 'en-US';
        feedbackSpeech.onerror = function (event) {
          console.warn('Speech synthesis feedback error:', event.error);
        };
        window.speechSynthesis.speak(feedbackSpeech);
      } else {
        document.removeEventListener('focusin', screenReader.handleFocus);
        window.speechSynthesis.cancel();
        const feedbackSpeech = new SpeechSynthesisUtterance(WIDGET_CONFIG.lang.screenReaderOff);
        feedbackSpeech.lang = 'en-US';
        feedbackSpeech.onerror = function (event) {
          console.warn('Speech synthesis feedback error:', event.error);
        };
        window.speechSynthesis.speak(feedbackSpeech);
      }
    } catch (error) {
      console.warn('Screen reader toggle error:', error);
      return false;
    }

    return true;
  },
};

// Voice control functionality
const voiceControl = {
  isActive: localStorage.getItem('voiceControl') === 'true',
  recognition: null,
  isSupported: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  retryCount: 0,
  maxRetries: 3,
  toggle: function (isActive) {
    if (!voiceControl.isSupported) {
      console.warn(`Speech Recognition API ${WIDGET_CONFIG.lang.notSupportedBrowser}`);
      return false;
    }

    voiceControl.isActive = isActive;
    localStorage.setItem('voiceControl', isActive);

    try {
      if (isActive) {
        voiceControl.startListening();
      } else {
        if (voiceControl.recognition) {
          voiceControl.recognition.stop();
          voiceControl.recognition = null;
        }
        voiceControl.retryCount = 0;
      }
    } catch (error) {
      console.warn('Voice control toggle error:', error);
      return false;
    }

    return true;
  },
  startListening: function () {
    if (!voiceControl.isSupported) {
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      voiceControl.recognition = new SpeechRecognition();
      voiceControl.recognition.interimResults = false;
      voiceControl.recognition.lang = 'en-US';
      voiceControl.recognition.continuous = false;

      voiceControl.recognition.onstart = function () {
        console.log(WIDGET_CONFIG.lang.voiceControlActivated);
        voiceControl.retryCount = 0;
      };

      voiceControl.recognition.onresult = function (event) {
        try {
          const command = event.results[0][0].transcript.toLowerCase();
          voiceControl.handleVoiceCommand(command);
        } catch (error) {
          console.warn('Voice command processing error:', error);
        }
      };

      voiceControl.recognition.onerror = function (event) {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech' && voiceControl.retryCount < voiceControl.maxRetries) {
          voiceControl.retryCount++;
          setTimeout(() => {
            if (voiceControl.isActive) {
              voiceControl.startListening();
            }
          }, 1000);
        }
      };

      voiceControl.recognition.onend = function () {
        if (voiceControl.isActive && voiceControl.retryCount < voiceControl.maxRetries) {
          setTimeout(() => {
            if (voiceControl.isActive) {
              voiceControl.startListening();
            }
          }, 100);
        }
      };

      voiceControl.recognition.start();
    } catch (error) {
      console.warn('Voice control initialization error:', error);
    }
  },
  handleVoiceCommand: function (command) {
    console.log(`Received command: ${command}`);

    try {
      // Check for show menu commands
      if (WIDGET_CONFIG.voiceCommands.showMenu.some(cmd => command.includes(cmd))) {
        if (!menuCache.button) menuCache.init();
        if (menuCache.button) {
          menuCache.button.click();
        }
        return;
      }

      // Check for reset all commands
      if (WIDGET_CONFIG.voiceCommands.resetAll.some(cmd => command.includes(cmd))) {
        resetAccessibilitySettings();
        return;
      }

      // Build dynamic command map based on configuration
      let localStorageKey = null;

      // Check each command group
      if (WIDGET_CONFIG.voiceCommands.highContrast.some(cmd => command.includes(cmd))) {
        localStorageKey = 'highContrast';
      } else if (WIDGET_CONFIG.voiceCommands.biggerText.some(cmd => command.includes(cmd))) {
        localStorageKey = 'biggerText';
      } else if (WIDGET_CONFIG.voiceCommands.textSpacing.some(cmd => command.includes(cmd))) {
        localStorageKey = 'textSpacing';
      } else if (WIDGET_CONFIG.voiceCommands.pauseAnimations.some(cmd => command.includes(cmd))) {
        localStorageKey = 'pauseAnimations';
      } else if (WIDGET_CONFIG.voiceCommands.hideImages.some(cmd => command.includes(cmd))) {
        localStorageKey = 'hideImages';
      } else if (WIDGET_CONFIG.voiceCommands.dyslexiaFont.some(cmd => command.includes(cmd))) {
        localStorageKey = 'dyslexiaFont';
      } else if (WIDGET_CONFIG.voiceCommands.biggerCursor.some(cmd => command.includes(cmd))) {
        localStorageKey = 'biggerCursor';
      } else if (WIDGET_CONFIG.voiceCommands.lineHeight.some(cmd => command.includes(cmd))) {
        localStorageKey = 'lineHeight';
      } else if (WIDGET_CONFIG.voiceCommands.textAlign.some(cmd => command.includes(cmd))) {
        localStorageKey = 'textAlign';
      } else if (WIDGET_CONFIG.voiceCommands.screenReader.some(cmd => command.includes(cmd))) {
        localStorageKey = 'screenReader';
      } else if (WIDGET_CONFIG.voiceCommands.voiceControl.some(cmd => command.includes(cmd))) {
        localStorageKey = 'voiceControl';
      }

      if (localStorageKey) {
        // Use cached menu reference if available
        if (!menuCache.menu) menuCache.init();
        const button = menuCache.menu?.querySelector(
          `.snn-accessibility-option[data-key='${localStorageKey}']`
        );
        if (button) {
          button.click();
        } else {
          console.log('Button not found for command:', command);
        }
      } else {
        console.log('Command not recognized:', command);
      }
    } catch (error) {
      console.warn('Voice command handling error:', error);
    }
  },
};

// Create the accessibility menu
function createAccessibilityMenu() {
  const menu = document.createElement('div');
  menu.id = 'snn-accessibility-menu';
  menu.style.display = 'none';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-labelledby', 'snn-accessibility-title');
  menu.setAttribute('aria-hidden', 'true');

  const header = document.createElement('div');
  header.classList.add('snn-header');

  const title = document.createElement('div');
  title.classList.add('snn-title');
  title.id = 'snn-accessibility-title';
  title.textContent = WIDGET_CONFIG.lang.accessibilityTools;

  // Create reset button
  const resetButton = document.createElement('button');
  resetButton.classList.add('snn-reset-button');
  resetButton.innerHTML = `${icons.resetAll}<span class="snn-tooltip">${WIDGET_CONFIG.lang.reset}</span>`;
  resetButton.setAttribute('aria-label', WIDGET_CONFIG.lang.resetAllSettings);
  resetButton.addEventListener('click', resetAccessibilitySettings);

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'snn-close';
  closeButton.innerHTML = `<span class="snn-tooltip">${WIDGET_CONFIG.lang.close}</span>`;
  closeButton.setAttribute('aria-label', WIDGET_CONFIG.lang.closeAccessibilityMenu);

  closeButton.addEventListener('click', function () {
    closeMenu();
  });

  closeButton.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeMenu();
    }
  });

  header.appendChild(title);
  header.appendChild(resetButton);
  header.appendChild(closeButton);
  menu.appendChild(header);

  // Create content wrapper
  const content = document.createElement('div');
  content.classList.add('snn-content');

  // Create grid wrapper for accessibility options
  const optionsGrid = document.createElement('div');
  optionsGrid.classList.add('snn-options-grid');

  // ===================================================================
  // UNIFIED BUTTON CONFIGURATION WITH EXPLICIT ORDERING
  // Add/remove/reorder buttons by changing the 'order' property
  // Lower order numbers appear first, higher numbers appear last
  // ===================================================================
  const allButtonConfigs = [
    // Order 1-4: Primary accessibility features (as requested)
    {
      order: 1,
      type: 'action',
      text: WIDGET_CONFIG.lang.textSize,
      actionFunction: handleBiggerText,
      icon: icons.biggerText,
      enabled: WIDGET_CONFIG.enableBiggerText,
      optionsConfig: { count: 3 }
    },
    {
      order: 2,
      type: 'action',
      text: WIDGET_CONFIG.lang.highContrast,
      actionFunction: handleHighContrast,
      icon: icons.highContrast,
      enabled: WIDGET_CONFIG.enableHighContrast,
      optionsConfig: { count: 3 }
    },
    {
      order: 3,
      type: 'action',
      text: WIDGET_CONFIG.lang.textAlign,
      actionFunction: handleTextAlign,
      icon: icons.textAlign,
      enabled: WIDGET_CONFIG.enableTextAlign,
      optionsConfig: { count: 3 }
    },
    {
      order: 4,
      type: 'action',
      text: WIDGET_CONFIG.lang.colorFilter,
      actionFunction: handleColorFilter,
      icon: icons.colorFilter,
      enabled: WIDGET_CONFIG.enableColorFilter,
      optionsConfig: { count: 4 }
    },
    
    // Order 5-11: Other visual/text features
    {
      order: 5,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.textSpacing,
      key: 'textSpacing',
      className: 'snn-text-spacing',
      icon: icons.textSpacing,
      enabled: WIDGET_CONFIG.enableTextSpacing,
    },
    {
      order: 6,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.lineHeight,
      key: 'lineHeight',
      className: 'snn-line-height',
      icon: icons.lineHeight,
      enabled: WIDGET_CONFIG.enableLineHeight,
    },
    {
      order: 7,
      type: 'action',
      text: WIDGET_CONFIG.lang.fontSelection,
      actionFunction: handleFontSelection,
      icon: icons.fontSelection,
      enabled: WIDGET_CONFIG.enableFontSelection,
      optionsConfig: { count: 3 }
    },
    {
      order: 8,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.dyslexiaFriendly,
      key: 'dyslexiaFont',
      className: 'snn-dyslexia-font',
      icon: icons.dyslexiaFont,
      enabled: WIDGET_CONFIG.enableDyslexiaFont,
    },
    {
      order: 9,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.biggerCursor,
      key: 'biggerCursor',
      className: 'snn-bigger-cursor',
      icon: icons.biggerCursor,
      enabled: WIDGET_CONFIG.enableBiggerCursor,
    },
    {
      order: 10,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.hideImages,
      key: 'hideImages',
      icon: icons.hideImages,
      customToggleFunction: toggleHideImages,
      enabled: WIDGET_CONFIG.enableHideImages,
    },
    
    // Order 11-12: Animation controls
    {
      order: 11,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.pauseAnimations,
      key: 'pauseAnimations',
      className: 'snn-pause-animations',
      icon: icons.pauseAnimations,
      enabled: WIDGET_CONFIG.enablePauseAnimations,
    },
    {
      order: 12,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.reducedMotion,
      key: 'reducedMotion',
      className: 'snn-reduced-motion',
      icon: icons.reducedMotion,
      enabled: WIDGET_CONFIG.enableReducedMotion,
    },
    
    // Order 98-99: Screen Reader and Voice Control (always last)
    {
      order: 98,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.screenReader,
      key: 'screenReader',
      customToggleFunction: screenReader.toggle,
      icon: icons.screenReader,
      requiresFeature: screenReader,
      enabled: WIDGET_CONFIG.enableScreenReader,
    },
    {
      order: 99,
      type: 'toggle',
      text: WIDGET_CONFIG.lang.voiceCommand,
      key: 'voiceControl',
      customToggleFunction: voiceControl.toggle,
      icon: icons.voiceControl,
      requiresFeature: voiceControl,
      enabled: WIDGET_CONFIG.enableVoiceControl,
    },
  ];

  // Sort buttons by order and add only enabled ones to the grid
  allButtonConfigs
    .filter(config => config.enabled)
    .sort((a, b) => a.order - b.order)
    .forEach((config) => {
      let button;
      
      if (config.type === 'action') {
        button = createActionButton(config.text, config.actionFunction, config.icon, config.optionsConfig);
      } else if (config.type === 'toggle') {
        button = createToggleButton(
          config.text,
          config.key,
          config.className,
          config.target || document.body,
          config.customToggleFunction,
          config.icon,
          config.requiresFeature
        );
      }
      
      if (button) {
        optionsGrid.appendChild(button);
      }
    });

  // Add grid to content
  content.appendChild(optionsGrid);

  // Add content to menu
  menu.appendChild(content);

  shadowRoot.appendChild(menu);
}

// ===========================================
// MENU MANAGEMENT
// ===========================================

// Cache for menu elements
const menuCache = {
  menu: null,
  button: null,
  closeButton: null,
  init: function () {
    this.menu = shadowRoot.getElementById('snn-accessibility-menu');
    this.button = shadowRoot.getElementById('snn-accessibility-button');
    this.closeButton = this.menu?.querySelector('.snn-close');
  }
};

// Menu control functions (optimized)
function toggleMenu() {
  if (!menuCache.menu) menuCache.init();
  const isOpen = menuCache.menu.style.display === 'block';

  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

function openMenu() {
  if (!menuCache.menu) menuCache.init();
  menuCache.menu.style.display = 'block';
  menuCache.menu.setAttribute('aria-hidden', 'false');

  if (menuCache.closeButton) {
    menuCache.closeButton.focus();
  }

  // Add keyboard navigation
  document.addEventListener('keydown', handleMenuKeyboard);
}

function closeMenu() {
  if (!menuCache.menu) menuCache.init();
  menuCache.menu.style.display = 'none';
  menuCache.menu.setAttribute('aria-hidden', 'true');

  if (menuCache.button) {
    menuCache.button.focus();
  }

  // Remove keyboard navigation
  document.removeEventListener('keydown', handleMenuKeyboard);
}

// Cache for keyboard navigation elements
let keyboardCache = {
  focusableElements: null,
  lastUpdate: 0,
  getFocusableElements: function () {
    const now = Date.now();
    if (!this.focusableElements || now - this.lastUpdate > 1000) {
      if (menuCache.menu) {
        this.focusableElements = {
          all: menuCache.menu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
          options: Array.from(menuCache.menu.querySelectorAll('.snn-accessibility-option, .snn-close, .snn-reset-button'))
        };
        this.lastUpdate = now;
      }
    }
    return this.focusableElements;
  }
};

function handleMenuKeyboard(e) {
  if (!menuCache.menu || menuCache.menu.style.display !== 'block') return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeMenu();
    return;
  }

  const elements = keyboardCache.getFocusableElements();
  if (!elements) return;

  if (e.key === 'Tab') {
    const firstElement = elements.all[0];
    const lastElement = elements.all[elements.all.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const currentIndex = elements.options.indexOf(shadowRoot.activeElement);
    let nextIndex;

    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex === elements.options.length - 1 ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex === 0 ? elements.options.length - 1 : currentIndex - 1;
    }

    elements.options[nextIndex].focus();
  }
}

// ===========================================
// INITIALIZATION
// ===========================================

// Initialize the widget
function initAccessibilityWidget() {
  // Create shadow DOM first
  createShadowContainer();
  
  // Inject page styles (for accessibility features)
  injectPageStyles();
  
  // Apply saved settings
  applySettings();
  
  // Create widget UI inside shadow DOM
  createAccessibilityButton();
  createAccessibilityMenu();
}

// ===========================================
// WIDGET BOOTSTRAP
// ===========================================

// Load the widget when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccessibilityWidget);
} else {
  initAccessibilityWidget();
}