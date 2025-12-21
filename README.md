# Accessibility Widgets


A comprehensive, lightweight accessibility tool that enhances web accessibility for all users. This single-file JavaScript widget provides multiple accessibility features to make websites more usable for people with disabilities.

![image](https://github.com/user-attachments/assets/2d0e761e-dac5-4319-8a64-970d1b5fe28f)




### Feature coverage against WCAG 2.1 AA criteria
> These checks show how each feature aligns with WCAG 2.1 AA success criteria.  
> They do **not** by themselves make a site fully compliant with WCAG, EN 301 549 or Section 508.
> To become fully compliant you still need to run a manual checks, fix any underlying HTML/CSS/ARIA issues, test with real users, and re-test every time the site changes.




| Feature | WCAG AA criterion(s) | EU (EN 301 549 / EAA / WAD) | US (ADA / Section 508) |
|---------|---------------------|-----------------------------|------------------------|
| High Contrast Mode | ✔️ | ✔️ | ✔️ |
| Text Size Adjustment | ✔️ | ✔️ | ✔️ |
| Text Spacing | ✔️ | ✔️ | ✔️ |
| Line Height Adjustment | ✔️ | ✔️ | ✔️ |
| Text Alignment (Left Align) | ✔️ (1.4.8) | ✔️ | ✔️ |
| Cursor Enhancement | ✔️ | ✔️ | ✔️ |
| Pause Animations | ✔️ | ✔️ | ✔️ |
| Reduced Motion | ✔️ | ✔️ | ✔️ |
| Hide Images | ✔️ (1.1.1) | ✔️ | ✔️ |
| Dyslexia-Friendly / Font Select | ✔️ | ✔️ | ✔️ |
| Screen Reader Assist | ✔️ | ✔️ | ✔️ |
| Voice Control | ✔️ (Chrome-only API) | ◑ | ◑ |
| Color-Blindness Filters | ✔️ | ✔️ | ✔️ |






## Features

### Core Accessibility Features

#### **High Contrast Mode**
Provides three levels of contrast enhancement:
- **Medium**: 1.3x contrast boost for subtle improvement
- **High**: Black background with white text and 1.5x contrast
- **Ultra**: Black background with yellow text and 2.0x contrast for maximum visibility

How it works: Applies CSS filters and background/text color overrides while preserving the widget's own styling.

#### **Text Size Adjustment**
Offers four text size options:
- **Default**: Original website text size
- **Medium**: 20px font size for all text elements
- **Large**: 24px font size for improved readability
- **X-Large**: 28px font size for maximum accessibility

How it works: Uses CSS to override font-size properties across all page elements while excluding the widget interface.

#### **Text Spacing**
Enhances text readability by adding:
- **Letter spacing**: 0.2em between characters
- **Word spacing**: 0.3em between words

How it works: Applies CSS letter-spacing and word-spacing properties to all text elements except the widget interface.

#### **Animation Control**
Completely stops all animations and transitions on the page.

How it works: Uses CSS to disable all `animation` and `transition` properties, helping users with vestibular disorders or attention difficulties.

#### **Image Hiding**
Removes all images from the page for users who prefer text-only content or have slow connections.

How it works: Sets `display: none` on all `<img>` elements. The system caches image queries for performance and updates every 5 seconds to catch dynamically loaded images.

#### **Dyslexia-Friendly Font**
Replaces all fonts with dyslexia-friendly alternatives:
- Primary: Comic Sans MS (widely available dyslexia-friendly font)
- Fallbacks: Chalkboard SE, Bradley Hand, Brush Script MT, fantasy

How it works: Overrides the font-family CSS property for all elements on the page.

#### **Cursor Enhancement**
Provides a larger, high-contrast cursor for better visibility.

How it works: Uses a custom SVG cursor (48x72px) with black fill and white stroke, applied via CSS cursor property.

#### **Line Height Adjustment**
Increases line spacing to 2.5x normal for improved readability.

How it works: Applies CSS `line-height: 2.5` to all text elements except the widget interface.

#### **Text Alignment**
Provides three alignment options:
- **Left**: Forces left alignment for consistent reading flow
- **Center**: Centers all text for specific user preferences
- **Right**: Right-aligns all text

How it works: Uses CSS `text-align` property override for all text elements.

### Advanced Features

#### **Screen Reader Support**
Built-in text-to-speech functionality that reads focused elements aloud.

How it works: Uses the Web Speech API's SpeechSynthesis interface. When enabled, it listens for `focusin` events and speaks the text content, alt text, or title of focused elements. Includes error handling for unsupported browsers.

#### **Voice Control**
Voice commands to control accessibility features hands-free.

How it works: Uses the Web Speech API's SpeechRecognition interface. Continuously listens for voice commands and maps them to widget functions. Includes retry logic for reliability and graceful degradation for unsupported browsers.

Supported commands:
- "show menu" / "open menu" - Opens accessibility menu
- "high contrast" - Cycles through contrast levels
- "bigger text" - Cycles through text sizes
- "text spacing" - Toggles text spacing
- "pause animations" - Toggles animation control
- "hide images" - Toggles image visibility
- "dyslexia font" - Toggles dyslexia-friendly font
- "bigger cursor" - Toggles cursor enhancement
- "screen reader" - Toggles screen reader
- "reset all" - Resets all settings

#### **Reduced Motion**
Disables all animations and transitions for users with motion sensitivity.

How it works: Similar to Animation Control but specifically targets motion-related CSS properties including pseudo-elements (::before, ::after).

#### **Font Selection**
Cycle through three professional font options:
- **Arial**: Sans-serif, high readability
- **Times New Roman**: Serif, traditional
- **Verdana**: Sans-serif, designed for screen reading

How it works: Applies font-family overrides via CSS classes, cycling through options when activated.

#### **Color Blindness Filters**
Provides specialized filters for different types of color blindness:
- **Protanopia**: Red-blind color correction
- **Deuteranopia**: Green-blind color correction  
- **Tritanopia**: Blue-blind color correction
- **Grayscale**: Complete color removal

How it works: Uses SVG filters with color matrix transformations applied via CSS filter property to the entire document.

## Installation

### Method 1: Direct Download
1. Download the `widget.js` file
2. Include it in your HTML page:

```html
<script src="widget.js"></script>
```

### Method 2: NPM
```bash
npm install accessibility-widgets
```

### Method 3: CDN
```html
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

That's it! The widget will automatically initialize when the page loads.

## Configuration

The widget is highly customizable. You can override the default settings by defining `window.ACCESSIBILITY_WIDGET_CONFIG` before loading the widget script.

### Basic Configuration
```html
<script>
// Define your custom configuration
window.ACCESSIBILITY_WIDGET_CONFIG = {
  // Enable/disable features
  enableVoiceControl: false,
  enableScreenReader: true,
  
  // Customize appearance
  widgetWidth: '350px',
  colors: {
    primary: '#0066cc',
    secondary: '#ffffff'
  }
};
</script>
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

### Complete Configuration Options
```html
<script>
window.ACCESSIBILITY_WIDGET_CONFIG = {
  // Feature toggles - set to false to disable
  enableHighContrast: true,
  enableBiggerText: true,
  enableTextSpacing: true,
  enablePauseAnimations: true,
  enableHideImages: true,
  enableDyslexiaFont: true,
  enableBiggerCursor: true,
  enableLineHeight: true,
  enableTextAlign: true,
  enableScreenReader: true,
  enableVoiceControl: true,
  enableReducedMotion: true,
  enableFontSelection: true,
  enableColorFilter: true,
  
  // Widget button layout
  widgetColumns: 2, // Number of columns in the options grid (1-4, default: 2)
  
  // Widget dimensions and position
  widgetWidth: '440px',
  widgetPosition: {
    side: 'right',     // 'left' or 'right' - which side to position widget
    right: '20px',     // distance from right edge when side is 'right'
    left: '20px',      // distance from left edge when side is 'left'
    bottom: '20px'     // distance from bottom
  },
  
  // Color scheme
  colors: {
    primary: '#1e90ff',
    primaryHover: '#00bfff',
    secondary: '#f9f9f9',
    text: '#333',
    textLight: '#fff',
    border: '#e6e6e6',
    borderHover: '#d4d4d4',
    shadow: 'rgba(0, 0, 0, 0.2)',
    focus: '#ff6b35',
    focusGlow: 'rgba(255, 107, 53, 0.3)'
  },
  
  // Button styling
  button: {
    size: '55px',
    borderRadius: '1000px',
    iconSize: '28px',
    shadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  
  // Menu styling
  menu: {
    headerHeight: '55px',
    padding: '0 10px 10px 10px',
    optionPadding: '14px 10px',
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
  
  // Language/Text Configuration - Customize all text strings
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
    close: 'Close',
    screenReaderOn: 'Screen reader on',
    screenReaderOff: 'Screen reader off',
    voiceControlActivated: 'Voice control activated',
    notSupportedBrowser: 'is not supported in this browser'
  },

  // Voice Command Configuration - Customize voice commands for different languages
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

  // Grid Layout Configuration - Customize button grid layout
  gridLayout: {
    columns: '1fr 1fr', // Default 2-column layout (change to '1fr 1fr 1fr' for 3 columns, etc.)
    gap: '10px' // Gap between grid items
  }
};
</script>
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

### Partial Configuration
You only need to specify the settings you want to change. The widget will merge your settings with the defaults:

```html
<script>
// Only override what you need
window.ACCESSIBILITY_WIDGET_CONFIG = {
  enableVoiceControl: false,  // Disable voice control
  widgetWidth: '300px',       // Smaller width
  colors: {
    primary: '#purple'        // Custom color (other colors remain default)
  }
};
</script>
<script src="widget.js"></script>
```

### Widget Positioning
The widget can be positioned on either side of the screen:

```html
<script>
window.ACCESSIBILITY_WIDGET_CONFIG = {
  widgetPosition: {
    side: 'left',          // Position on left side of screen
    left: '20px',          // 20px from left edge
    bottom: '20px'         // 20px from bottom
  }
};
</script>
```

### Internationalization (i18n)
The widget supports full internationalization. You can customize all text strings and voice commands:

```html
<script>
// Spanish language example
window.ACCESSIBILITY_WIDGET_CONFIG = {
  lang: {
    accessibilityMenu: 'Menú de Accesibilidad',
    accessibilityTools: 'Herramientas de Accesibilidad',
    screenReader: 'Lector de Pantalla',
    biggerText: 'Texto Más Grande',
    highContrast: 'Alto Contraste',
    resetAllSettings: 'Restablecer Todas las Configuraciones',
    close: 'Cerrar'
    // ... add more translations as needed
  },
  
  // Customize voice commands for Spanish
  voiceCommands: {
    showMenu: ['mostrar menú', 'abrir menú', 'menú de accesibilidad'],
    highContrast: ['alto contraste'],
    biggerText: ['texto más grande', 'texto grande'],
    textSpacing: ['espaciado de texto'],
    pauseAnimations: ['pausar animaciones', 'detener animaciones'],
    hideImages: ['ocultar imágenes'],
    dyslexiaFont: ['fuente para dislexia', 'fuente dislexia'],
    biggerCursor: ['cursor más grande', 'cursor grande'],
    lineHeight: ['altura de línea'],
    textAlign: ['alinear texto', 'alineación de texto'],
    screenReader: ['lector de pantalla'],
    voiceControl: ['comando de voz', 'control de voz'],
    resetAll: ['reiniciar todo', 'resetear todo']
  }
};
</script>
```

## Voice Commands

When voice control is enabled, users can activate features using these commands (default English commands shown - fully customizable via `voiceCommands` configuration):

- "show menu" / "open menu" / "accessibility menu" - Opens the accessibility menu
- "high contrast" - Toggles high contrast mode
- "bigger text" / "large text" - Toggles larger text size
- "text spacing" - Toggles text spacing
- "pause animations" / "stop animations" - Toggles animation pausing
- "hide images" - Toggles image hiding
- "dyslexia friendly" / "dyslexia font" - Toggles dyslexia-friendly font
- "bigger cursor" / "large cursor" - Toggles larger cursor
- "line height" - Toggles line height adjustment
- "align text" / "text align" - Cycles through text alignment options
- "screen reader" - Toggles screen reader
- "voice command" / "voice control" - Toggles voice control
- "reset all" / "reset everything" - Resets all accessibility settings

**Note:** All voice commands can be customized for different languages using the `voiceCommands` configuration option.

## Browser Compatibility

- **Modern Browsers**: Full functionality in Chrome, Firefox, Safari, Edge
- **Screen Reader**: Requires Speech Synthesis API support
- **Voice Control**: Requires Speech Recognition API support
- **Graceful Degradation**: Features that aren't supported are automatically disabled

## Technical Features

- **Single File Deployment** - No dependencies, just include one JavaScript file
- **Persistent Settings** - User preferences saved in localStorage
- **Keyboard Navigation** - Full keyboard accessibility with Tab, Arrow keys, and Escape
- **ARIA Compliance** - Proper ARIA labels and roles for screen readers
- **Performance Optimized** - DOM caching and efficient event handling
- **Error Handling** - Robust error handling for browser compatibility
- **Responsive Design** - Works on desktop and mobile devices
- **Flexible Positioning** - Support for left/right side positioning
- **Full Internationalization** - Complete text customization for any language
- **Configurable Colors** - Dynamic color theming including SVG icon colors
- **Screen Reader Optimized** - Proper text labels for all interactive elements

## Usage Examples

### Basic Implementation
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Accessible Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This site includes accessibility features.</p>
    
    <!-- Include the widget -->
    <script src="widget.js"></script>
</body>
</html>
```

### Custom Configuration
```html
<script>
// Define custom settings before loading the widget
window.ACCESSIBILITY_WIDGET_CONFIG = {
  enableVoiceControl: false,  // Disable voice control
  widgetWidth: '300px',       // Smaller menu width
  colors: {
    primary: '#0066cc',       // Custom blue color
    secondary: '#ffffff'      // White background
  }
};
</script>
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```
