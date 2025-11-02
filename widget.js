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
  
  // Colors - Modern vibrant color scheme
  colors: {
    primary: '#6366f1', // Vibrant indigo
    primaryHover: '#818cf8',
    secondary: '#f8fafc',
    text: '#1e293b',
    textLight: '#fff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    shadow: 'rgba(99, 102, 241, 0.15)',
    focus: '#6366f1',
    focusGlow: 'rgba(99, 102, 241, 0.25)',
    gradient1: '#6366f1',
    gradient2: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981'
  },
  
  // Button styling
  button: {
    size: '60px',
    borderRadius: '50%',
    iconSize: '32px',
    shadow: '0 8px 16px rgba(99, 102, 241, 0.2), 0 4px 8px rgba(99, 102, 241, 0.1)'
  },
  
  // Menu styling
  menu: {
    headerHeight: '70px',
    padding: '0 16px 16px 16px',
    optionPadding: '16px 14px',
    optionMargin: '8px',
    borderRadius: '12px',
    fontSize: '15px',
    titleFontSize: '24px',
    closeButtonSize: '40px'
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
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    hoverScale: '1.02',
    buttonHoverScale: '1.1'
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
    close: 'Close'
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

// Generate styles using configuration variables
const styles = `
  #snn-accessibility-fixed-button {
    position: fixed !important;
    ${WIDGET_CONFIG.widgetPosition.side}: ${WIDGET_CONFIG.widgetPosition[WIDGET_CONFIG.widgetPosition.side]} !important;
    bottom: ${WIDGET_CONFIG.widgetPosition.bottom} !important;
    z-index: 9999;
  }
  #snn-accessibility-button {
    background: linear-gradient(135deg, ${WIDGET_CONFIG.colors.gradient1} 0%, ${WIDGET_CONFIG.colors.gradient2} 100%);
    border: none;
    border-radius: ${WIDGET_CONFIG.button.borderRadius};
    cursor: pointer;
    width: ${WIDGET_CONFIG.button.size};
    height: ${WIDGET_CONFIG.button.size};
    box-shadow: ${WIDGET_CONFIG.button.shadow};
    transition: all ${WIDGET_CONFIG.animation.transition} !important;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  #snn-accessibility-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${WIDGET_CONFIG.colors.gradient2} 0%, ${WIDGET_CONFIG.colors.gradient1} 100%);
    opacity: 0;
    transition: opacity ${WIDGET_CONFIG.animation.transition};
  }
  #snn-accessibility-button:hover::before {
    opacity: 1;
  }
  #snn-accessibility-button:hover {
    transform: scale(${WIDGET_CONFIG.animation.buttonHoverScale});
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3), 0 8px 16px rgba(99, 102, 241, 0.15);
  }
  #snn-accessibility-button:active {
    transform: scale(1.05);
  }
  #snn-accessibility-button:focus {
    outline: 3px solid ${WIDGET_CONFIG.colors.focus};
    outline-offset: 3px;
  }
  #snn-accessibility-button svg {
    width: ${WIDGET_CONFIG.button.iconSize};
    height: ${WIDGET_CONFIG.button.iconSize};
    fill: ${WIDGET_CONFIG.colors.textLight};
    pointer-events: none;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  #snn-accessibility-menu {
    position: fixed;
    top: 0;
    ${WIDGET_CONFIG.widgetPosition.side}: 0;
    width: ${WIDGET_CONFIG.widgetWidth};
    height: 100vh;
    overflow-y: auto;
    background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
    padding: 0;
    display: none;
    font-family: ${WIDGET_CONFIG.typography.fontFamily};
    z-index: 999999;
    scrollbar-width: thin;
    scrollbar-color: ${WIDGET_CONFIG.colors.primary} #e2e8f0;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  }
  #snn-accessibility-menu::-webkit-scrollbar {
    width: 8px;
  }
  #snn-accessibility-menu::-webkit-scrollbar-track {
    background: #e2e8f0;
  }
  #snn-accessibility-menu::-webkit-scrollbar-thumb {
    background: ${WIDGET_CONFIG.colors.primary};
    border-radius: 4px;
  }
  .snn-accessibility-option {
    font-size: ${WIDGET_CONFIG.menu.fontSize};
    display: flex;
    align-items: center;
    padding: ${WIDGET_CONFIG.menu.optionPadding};
    width: 100%;
    background: #ffffff;
    color: ${WIDGET_CONFIG.colors.text};
    border: 2px solid #e2e8f0;
    cursor: pointer;
    border-radius: ${WIDGET_CONFIG.menu.borderRadius};
    transition: all ${WIDGET_CONFIG.animation.transition};
    line-height: ${WIDGET_CONFIG.typography.lineHeight} !important;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
  }
  .snn-accessibility-option::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
    transition: left 0.5s;
  }
  .snn-accessibility-option:hover::before {
    left: 100%;
  }
  .snn-accessibility-option:hover {
    border-color: ${WIDGET_CONFIG.colors.primary};
    transform: translateY(-2px) scale(${WIDGET_CONFIG.animation.hoverScale});
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15), 0 2px 6px rgba(99, 102, 241, 0.1);
  }
  .snn-accessibility-option:active {
    transform: translateY(0) scale(1);
  }
  .snn-accessibility-option.active {
    border-color: ${WIDGET_CONFIG.colors.primary};
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  }
  .snn-accessibility-option.active::after {
    content: '✓';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${WIDGET_CONFIG.colors.primary};
    font-weight: bold;
    font-size: 18px;
  }
  .snn-icon {
    margin-right: 12px;
    width: 28px;
    height: 28px;
    fill: ${WIDGET_CONFIG.colors.primary};
    flex-shrink: 0;
  }
  .snn-icon svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
  .snn-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: ${WIDGET_CONFIG.menu.closeButtonSize};
    color: ${WIDGET_CONFIG.colors.textLight};
    cursor: pointer;
    margin-left: auto;
    line-height: ${WIDGET_CONFIG.typography.lineHeight};
    border-radius: 50%;
    width: ${WIDGET_CONFIG.menu.closeButtonSize};
    height: ${WIDGET_CONFIG.menu.closeButtonSize};
    position: relative;
    transition: all ${WIDGET_CONFIG.animation.transition};
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
    font-size: 32px;
    line-height: 1;
    font-weight: 300;
  }
  .snn-close:focus {
    outline: 2px solid ${WIDGET_CONFIG.colors.textLight};
    outline-offset: 2px;
  }
  .snn-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg) scale(1.1);
  }
  .snn-close:active {
    transform: rotate(90deg) scale(0.95);
  }
  .snn-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, ${WIDGET_CONFIG.colors.gradient1} 0%, ${WIDGET_CONFIG.colors.gradient2} 100%);
    height: ${WIDGET_CONFIG.menu.headerHeight};
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
  }
  
  .snn-content {
    padding: 0 16px 16px 16px;
  }
  
  .snn-reset-button {
    font-size: ${WIDGET_CONFIG.menu.fontSize};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    padding: ${WIDGET_CONFIG.menu.optionPadding};
    width: 100%;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: ${WIDGET_CONFIG.colors.textLight};
    border: none;
    cursor: pointer;
    border-radius: ${WIDGET_CONFIG.menu.borderRadius};
    transition: all ${WIDGET_CONFIG.animation.transition};
    line-height: ${WIDGET_CONFIG.typography.lineHeight} !important;
    font-weight: 600;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
    position: relative;
    overflow: hidden;
  }
  .snn-reset-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  .snn-reset-button:hover::before {
    left: 100%;
  }
  .snn-reset-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  }
  .snn-reset-button:active {
    transform: translateY(0);
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
    color: ${WIDGET_CONFIG.colors.textLight};
    line-height: ${WIDGET_CONFIG.typography.lineHeight} !important;
    margin-left: 8px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  /* Accessibility feature styles */
  .snn-high-contrast-medium {
    filter: contrast(1.3) !important;
  }
  .snn-high-contrast-medium *{
    filter: contrast(1.3) !important;
  }
  .snn-high-contrast-medium #snn-accessibility-menu{
    filter: contrast(0.8) !important;
  }
  
  .snn-high-contrast-high {
    background-color: #000 !important;
    color: #fff !important;
    filter: contrast(1.5) !important;
  }
  .snn-high-contrast-high *{
    background-color: #000 !important;
    color: #fff !important;
    filter: contrast(1.5) !important;
  }
  .snn-high-contrast-high #snn-accessibility-menu{
    filter: contrast(0.7) !important;
  }
  
  .snn-high-contrast-ultra {
    background-color: #000 !important;
    color: #ffff00 !important;
    filter: contrast(2.0) !important;
  }
  .snn-high-contrast-ultra *{
    background-color: #000 !important;
    color: #ffff00 !important;
    filter: contrast(2.0) !important;
  }
  .snn-high-contrast-ultra #snn-accessibility-menu{
    filter: contrast(0.6) !important;
  }
  .snn-bigger-text-medium * {
    font-size: 20px !important;
  }
  .snn-bigger-text-large * {
    font-size: 24px !important;
  }
  .snn-bigger-text-xlarge * {
    font-size: 28px !important;
  }
  .snn-text-spacing *:not(#snn-accessibility-menu *, #snn-accessibility-fixed-button *, #snn-accessibility-button *, .snn-accessibility-option *) {
    letter-spacing: 0.2em !important;
    word-spacing: 0.3em !important;
  }
  .snn-pause-animations * {
    animation: none !important;
    transition: none !important;
  }
  .snn-dyslexia-font {
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Bradley Hand', Brush Script MT, fantasy !important;
  }
  .snn-dyslexia-font * {
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Bradley Hand', Brush Script MT, fantasy !important;
  }
  .snn-line-height *:not(#snn-accessibility-menu *, #snn-accessibility-fixed-button *, #snn-accessibility-button *, .snn-accessibility-option *) {
    line-height: 2.5 !important;
  }
  .snn-text-align-left *:not(#snn-accessibility-menu *, #snn-accessibility-fixed-button *, #snn-accessibility-button *, .snn-accessibility-option *) {
    text-align: left !important;
  }
  .snn-text-align-center *:not(#snn-accessibility-menu *, #snn-accessibility-fixed-button *, #snn-accessibility-button *, .snn-accessibility-option *) {
    text-align: center !important;
  }
  .snn-text-align-right *:not(#snn-accessibility-menu *, #snn-accessibility-fixed-button *, #snn-accessibility-button *, .snn-accessibility-option *) {
    text-align: right !important;
  }
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
    filter: url('#protanopia-filter') !important;
  }
  .snn-filter-deuteranopia {
    filter: url('#deuteranopia-filter') !important;
  }
  .snn-filter-tritanopia {
    filter: url('#tritanopia-filter') !important;
  }
  .snn-filter-grayscale {
    filter: grayscale(100%) !important;
  }
  
  /* Reduced Motion */
  .snn-reduced-motion * {
    animation: none !important;
    transition: none !important;
  }
  .snn-reduced-motion *::before,
  .snn-reduced-motion *::after {
    animation: none !important;
    transition: none !important;
  }
`;

// ===========================================
// SVG ICONS
// ===========================================

// SVG icons
const icons = {
  buttonsvg: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="" height="" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" viewBox="0 0 2713 2713" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><style type="text/css"><![CDATA[.fil1 {fill:${WIDGET_CONFIG.colors.textLight}} .fil0 {fill:${WIDGET_CONFIG.colors.textLight}}]]></style></defs><g id="Layer_x0020_1"><metadata id="CorelCorpID_0Corel-Layer"/><g id="_275060008"><circle class="fil0" cx="1356" cy="1356" r="1356"/><path class="fil1" d="M1305 315c-143,32 -237,147 -205,319 25,141 143,240 312,213 131,-21 237,-160 206,-324 -23,-125 -156,-243 -313,-208zm-150 1699l0 -340c1,-75 5,-367 1,-417 -9,-113 -93,-177 -174,-250 -19,-17 -33,-31 -53,-50 -19,-18 -35,-30 -54,-49 -19,-18 -34,-29 -53,-50 -38,-40 -162,-118 -98,-188 60,-65 124,34 188,86l111 99c11,10 17,13 27,25 9,12 16,18 28,28 35,30 72,64 125,85 122,50 214,44 334,-14 71,-34 103,-68 150,-113 9,-9 17,-15 27,-24 20,-18 39,-34 56,-51l108 -103c19,-18 29,-36 65,-39 33,-3 58,10 67,36 11,30 3,63 -13,83l-273 254c-40,31 -76,64 -109,98 -38,41 -54,80 -55,153 -3,243 -1,489 0,733 0,3 0,5 0,8 0,0 0,0 0,0 0,184 149,333 333,333 61,0 118,-17 167,-45 24,-18 48,-36 67,-51 39,-32 140,-145 171,-186 11,-16 19,-26 30,-42 104,-151 178,-317 209,-505 39,-242 -12,-506 -119,-712 -36,-69 -69,-123 -108,-178 -12,-15 -20,-24 -32,-39 -28,-36 -67,-84 -99,-115 -69,-66 -76,-68 -158,-129 -53,-39 -113,-70 -182,-103 -140,-67 -297,-100 -472,-102 -180,-2 -322,37 -472,97 -55,22 -93,42 -143,72 -55,33 -73,43 -127,87 -47,38 -70,60 -111,104 -6,6 -12,10 -18,17 -7,7 -9,13 -16,20 -8,9 -10,8 -17,18 -80,101 -91,116 -158,235 -64,113 -121,286 -136,435 -18,190 1,329 58,498 46,134 132,283 204,367 13,15 21,26 32,40 34,43 103,105 146,139 7,6 14,11 22,17 54,38 120,61 192,61 183,0 332,-149 332,-333l0 0z"/></g></g></svg>`,
  highContrast: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#000"/><path d="M32 2a30 30 0 000 60V2z" fill="#fff"/></svg>`,
  biggerText: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 8L8 56h12l6-12h24l6 12h12L32 8zm-6 36L32 20l6 24H26z"/></svg>`,
  textSpacing: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 16h44v4H10zm0 12h44v4H10zm0 12h44v4H10zm0 12h44v4H10z"/></svg>`,
  pauseAnimations: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="12" width="10" height="40"/><rect x="38" y="12" width="10" height="40"/></svg>`,
  hideImages: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 12C16 12 4 32 4 32s12 20 28 20 28-20 28-20S48 12 32 12zm0 32a12 12 0 1112-12 12 12 0 01-12 12z"/><circle cx="32" cy="32" r="8"/></svg>`,
  dyslexiaFont: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M12 8v48h12a16 16 0 000-32h-8v-8h16V8H12zm12 24a8 8 0 010 16h-4V32h4zM40 8v48h12V8H40z"/></svg>`,
  biggerCursor: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M12 4v56l16-16h24L12 4z"/></svg>`,
  lineHeight: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 16h32v4H16zm0 12h32v4H16zm0 12h32v4H16zm0 12h32v4H16zM8 8l8 8-8 8V8zm0 32l8 8-8 8V40z"/></svg>`,
  textAlign: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 16h44v4H10zm0 12h44v4H10zm0 12h44v4H10zm0 12h44v4H10z"/></svg>`,
  screenReader: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 24 L24 24 L32 16 L32 48 L24 40 L16 40 Z" fill="#333" stroke="#555" stroke-width="2"/><path d="M36 20 C42 24, 42 40, 36 44" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M36 12 C48 24, 48 40, 36 52" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"/><rect x="28" y="48" width="8" height="8" fill="#ccc"/></svg>`,
  resetAll: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M8 12l4-4 4 4-1.41 1.41L12 10.83l-2.59 2.58z" transform="rotate(45 12 12)"/></svg>`,
  voiceControl: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 44a12 12 0 0012-12V20a12 12 0 10-24 0v12a12 12 0 0012 12z" fill="#333"/><path d="M20 32h24v4H20z" fill="#555"/><path d="M32 48v8" stroke="#555" stroke-width="4" stroke-linecap="round"/></svg>`,
  fontSelection: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="40" font-family="serif" font-size="24" text-anchor="middle" fill="#333">Aa</text><path d="M8 48h48v2H8z"/></svg>`,
  colorFilter: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#333" stroke-width="2"/><path d="M32 8a24 24 0 000 48V8z" fill="#f00" opacity="0.3"/><path d="M32 8a24 24 0 000 48" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="4,2"/></svg>`,
  reducedMotion: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="24" width="8" height="16" fill="#333"/><rect x="28" y="24" width="8" height="16" fill="#333"/><rect x="40" y="24" width="8" height="16" fill="#333"/></svg>`,
};

// ===========================================
// CORE UTILITY FUNCTIONS
// ===========================================

// Inject styles and SVG filters into the document
function injectStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  
  // Add SVG color blindness filters
  const svgFilters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgFilters.style.position = 'absolute';
  svgFilters.style.width = '0';
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

// ===========================================
// PERFORMANCE OPTIMIZATION
// ===========================================

// Cache for DOM elements to improve performance
const domCache = {
  body: document.body,
  documentElement: document.documentElement,
  images: null,
  lastImageUpdate: 0,
  getImages: function() {
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
    { key: 'highContrast', className: 'snn-high-contrast', target: domCache.documentElement },
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
  domCache.documentElement.classList.remove(...contrastClasses);
  const selectedContrast = localStorage.getItem('highContrast');
  if (selectedContrast) {
    domCache.documentElement.classList.add(`snn-high-contrast-${selectedContrast}`);
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
  document.body.appendChild(buttonContainer);
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

  const documentClasses = [
    'snn-high-contrast',
    'snn-filter-protanopia',
    'snn-filter-deuteranopia',
    'snn-filter-tritanopia',
    'snn-filter-grayscale'
  ];
  documentClasses.forEach(cls => document.documentElement.classList.remove(cls));

  domCache.getImages().forEach((img) => (img.style.display = ''));

  if (screenReader.active) {
    screenReader.toggle(false);
  }

  if (voiceControl.isActive) {
    voiceControl.toggle(false);
  }

  applySettings();

  const buttons = document.querySelectorAll('#snn-accessibility-menu .snn-accessibility-option');
  buttons.forEach((button) => {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
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
  button.innerHTML = `<span class="snn-icon">${iconSVG}</span><span class="snn-button-text">${buttonText}</span>`;
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
function createActionButton(buttonText, actionFunction, iconSVG) {
  const button = document.createElement('button');
  button.innerHTML = `<span class="snn-icon">${iconSVG}</span><span class="snn-button-text">${buttonText}: <span class="snn-status">${WIDGET_CONFIG.lang.default}</span></span>`;
  button.setAttribute('aria-label', buttonText);
  button.classList.add('snn-accessibility-option');
  
  // Update initial status
  updateActionButtonStatus(button, buttonText, actionFunction);
  
  button.addEventListener('click', function () {
    const result = actionFunction();
    if (result) {
      const statusSpan = button.querySelector('.snn-status');
      statusSpan.textContent = result;
    }
  });
  
  button.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const result = actionFunction();
      if (result) {
        const statusSpan = button.querySelector('.snn-status');
        statusSpan.textContent = result;
      }
    }
  });
  
  return button;
}

// Update action button status on page load
function updateActionButtonStatus(button, buttonText, actionFunction) {
  const statusSpan = button.querySelector('.snn-status');
  
  if (buttonText.includes('Font')) {
    const currentFont = localStorage.getItem('fontSelection');
    statusSpan.textContent = currentFont ? currentFont.charAt(0).toUpperCase() + currentFont.slice(1) : WIDGET_CONFIG.lang.default;
  } else if (buttonText.includes('Color')) {
    const currentFilter = localStorage.getItem('colorFilter');
    statusSpan.textContent = currentFilter ? currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1) : WIDGET_CONFIG.lang.noFilter;
  } else if (buttonText.includes('Text Align')) {
    const currentAlign = localStorage.getItem('textAlign');
    statusSpan.textContent = currentAlign ? currentAlign.charAt(0).toUpperCase() + currentAlign.slice(1) : WIDGET_CONFIG.lang.default;
  } else if (buttonText.includes('Text Size')) {
    const currentSize = localStorage.getItem('biggerText');
    statusSpan.textContent = currentSize ? (currentSize === 'xlarge' ? 'X-Large' : currentSize.charAt(0).toUpperCase() + currentSize.slice(1)) : WIDGET_CONFIG.lang.default;
  } else if (buttonText.includes('High Contrast')) {
    const currentContrast = localStorage.getItem('highContrast');
    statusSpan.textContent = currentContrast ? currentContrast.charAt(0).toUpperCase() + currentContrast.slice(1) : WIDGET_CONFIG.lang.default;
  }
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
  domCache.documentElement.classList.remove(...contrastClasses);
  
  if (nextIndex === contrastLevels.length) {
    // Default contrast
    localStorage.removeItem('highContrast');
    return WIDGET_CONFIG.lang.default;
  } else {
    const selectedContrast = contrastLevels[nextIndex];
    localStorage.setItem('highContrast', selectedContrast);
    domCache.documentElement.classList.add(`snn-high-contrast-${selectedContrast}`);
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
          speech.onerror = function(event) {
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
        feedbackSpeech.onerror = function(event) {
          console.warn('Speech synthesis feedback error:', event.error);
        };
        window.speechSynthesis.speak(feedbackSpeech);
      } else {
        document.removeEventListener('focusin', screenReader.handleFocus);
        window.speechSynthesis.cancel();
        const feedbackSpeech = new SpeechSynthesisUtterance(WIDGET_CONFIG.lang.screenReaderOff);
        feedbackSpeech.lang = 'en-US';
        feedbackSpeech.onerror = function(event) {
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
      if (WIDGET_CONFIG.voiceCommands.showMenu.includes(command)) {
        if (!menuCache.button) menuCache.init();
        if (menuCache.button) {
          menuCache.button.click();
        }
        return;
      }

      // Check for reset all commands
      if (WIDGET_CONFIG.voiceCommands.resetAll.includes(command)) {
        resetAccessibilitySettings();
        return;
      }

      // Build dynamic command map based on configuration
      let localStorageKey = null;
      
      // Check each command group
      if (WIDGET_CONFIG.voiceCommands.highContrast.includes(command)) {
        localStorageKey = 'highContrast';
      } else if (WIDGET_CONFIG.voiceCommands.biggerText.includes(command)) {
        localStorageKey = 'biggerText';
      } else if (WIDGET_CONFIG.voiceCommands.textSpacing.includes(command)) {
        localStorageKey = 'textSpacing';
      } else if (WIDGET_CONFIG.voiceCommands.pauseAnimations.includes(command)) {
        localStorageKey = 'pauseAnimations';
      } else if (WIDGET_CONFIG.voiceCommands.hideImages.includes(command)) {
        localStorageKey = 'hideImages';
      } else if (WIDGET_CONFIG.voiceCommands.dyslexiaFont.includes(command)) {
        localStorageKey = 'dyslexiaFont';
      } else if (WIDGET_CONFIG.voiceCommands.biggerCursor.includes(command)) {
        localStorageKey = 'biggerCursor';
      } else if (WIDGET_CONFIG.voiceCommands.lineHeight.includes(command)) {
        localStorageKey = 'lineHeight';
      } else if (WIDGET_CONFIG.voiceCommands.textAlign.includes(command)) {
        localStorageKey = 'textAlign';
      } else if (WIDGET_CONFIG.voiceCommands.screenReader.includes(command)) {
        localStorageKey = 'screenReader';
      } else if (WIDGET_CONFIG.voiceCommands.voiceControl.includes(command)) {
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

  const title = document.createElement('h2');
  title.classList.add('snn-title');
  title.id = 'snn-accessibility-title';
  title.textContent = WIDGET_CONFIG.lang.accessibilityTools;

  const closeButton = document.createElement('button');
  closeButton.className = 'snn-close';
  closeButton.innerHTML = '';
  closeButton.setAttribute('title', WIDGET_CONFIG.lang.closeAccessibilityMenu);

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
  header.appendChild(closeButton);
  menu.appendChild(header);

  // Create content wrapper
  const content = document.createElement('div');
  content.classList.add('snn-content');

  // Create reset button (outside grid, full width)
  const resetButton = document.createElement('button');
  resetButton.innerHTML = `<span class="snn-icon">${icons.resetAll}</span><span class="snn-button-text">${WIDGET_CONFIG.lang.resetAllSettings}</span>`;
  resetButton.setAttribute('aria-label', WIDGET_CONFIG.lang.resetAllSettings);
  resetButton.classList.add('snn-reset-button');
  resetButton.addEventListener('click', resetAccessibilitySettings);
  content.appendChild(resetButton);

  // Create grid wrapper for accessibility options
  const optionsGrid = document.createElement('div');
  optionsGrid.classList.add('snn-options-grid');

  // Add accessibility options based on configuration
  const options = [
    {
      text: WIDGET_CONFIG.lang.screenReader,
      key: 'screenReader',
      customToggleFunction: screenReader.toggle,
      icon: icons.screenReader,
      requiresFeature: screenReader,
      enabled: WIDGET_CONFIG.enableScreenReader,
    },
    {
      text: WIDGET_CONFIG.lang.voiceCommand,
      key: 'voiceControl',
      customToggleFunction: voiceControl.toggle,
      icon: icons.voiceControl,
      requiresFeature: voiceControl,
      enabled: WIDGET_CONFIG.enableVoiceControl,
    },
    {
      text: WIDGET_CONFIG.lang.textSpacing,
      key: 'textSpacing',
      className: 'snn-text-spacing',
      icon: icons.textSpacing,
      enabled: WIDGET_CONFIG.enableTextSpacing,
    },
    {
      text: WIDGET_CONFIG.lang.pauseAnimations,
      key: 'pauseAnimations',
      className: 'snn-pause-animations',
      icon: icons.pauseAnimations,
      enabled: WIDGET_CONFIG.enablePauseAnimations,
    },
    {
      text: WIDGET_CONFIG.lang.hideImages,
      key: 'hideImages',
      icon: icons.hideImages,
      customToggleFunction: toggleHideImages,
      enabled: WIDGET_CONFIG.enableHideImages,
    },
    {
      text: WIDGET_CONFIG.lang.dyslexiaFriendly,
      key: 'dyslexiaFont',
      className: 'snn-dyslexia-font',
      icon: icons.dyslexiaFont,
      enabled: WIDGET_CONFIG.enableDyslexiaFont,
    },
    {
      text: WIDGET_CONFIG.lang.biggerCursor,
      key: 'biggerCursor',
      className: 'snn-bigger-cursor',
      icon: icons.biggerCursor,
      enabled: WIDGET_CONFIG.enableBiggerCursor,
    },
    {
      text: WIDGET_CONFIG.lang.lineHeight,
      key: 'lineHeight',
      className: 'snn-line-height',
      icon: icons.lineHeight,
      enabled: WIDGET_CONFIG.enableLineHeight,
    },
    {
      text: WIDGET_CONFIG.lang.reducedMotion,
      key: 'reducedMotion',
      className: 'snn-reduced-motion',
      icon: icons.reducedMotion,
      enabled: WIDGET_CONFIG.enableReducedMotion,
    },
  ];
  
  // Add enabled toggle options to grid
  options.forEach((option) => {
    if (option.enabled) {
      const button = createToggleButton(
        option.text,
        option.key,
        option.className,
        option.target,
        option.customToggleFunction,
        option.icon,
        option.requiresFeature
      );
      optionsGrid.appendChild(button);
    }
  });
  
  // Add action buttons (font selection and color filters) to grid if enabled
  if (WIDGET_CONFIG.enableFontSelection) {
    const fontButton = createActionButton(WIDGET_CONFIG.lang.fontSelection, handleFontSelection, icons.fontSelection);
    optionsGrid.appendChild(fontButton);
  }
  
  if (WIDGET_CONFIG.enableColorFilter) {
    const colorButton = createActionButton(WIDGET_CONFIG.lang.colorFilter, handleColorFilter, icons.colorFilter);
    optionsGrid.appendChild(colorButton);
  }
  
  if (WIDGET_CONFIG.enableTextAlign) {
    const textAlignButton = createActionButton(WIDGET_CONFIG.lang.textAlign, handleTextAlign, icons.textAlign);
    optionsGrid.appendChild(textAlignButton);
  }
  
  if (WIDGET_CONFIG.enableBiggerText) {
    const biggerTextButton = createActionButton(WIDGET_CONFIG.lang.textSize, handleBiggerText, icons.biggerText);
    optionsGrid.appendChild(biggerTextButton);
  }
  
  if (WIDGET_CONFIG.enableHighContrast) {
    const highContrastButton = createActionButton(WIDGET_CONFIG.lang.highContrast, handleHighContrast, icons.highContrast);
    optionsGrid.appendChild(highContrastButton);
  }

  // Add grid to content
  content.appendChild(optionsGrid);
  
  // Add content to menu
  menu.appendChild(content);

  document.body.appendChild(menu);
}

// ===========================================
// MENU MANAGEMENT
// ===========================================

// Cache for menu elements
const menuCache = {
  menu: null,
  button: null,
  closeButton: null,
  init: function() {
    this.menu = document.getElementById('snn-accessibility-menu');
    this.button = document.getElementById('snn-accessibility-button');
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
  getFocusableElements: function() {
    const now = Date.now();
    if (!this.focusableElements || now - this.lastUpdate > 1000) {
      if (menuCache.menu) {
        this.focusableElements = {
          all: menuCache.menu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
          options: Array.from(menuCache.menu.querySelectorAll('.snn-accessibility-option, .snn-close'))
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
    const currentIndex = elements.options.indexOf(document.activeElement);
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
  injectStyles();
  applySettings();
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

