# Accessibility Widgets

[![npm version](https://badge.fury.io/js/accessibility-widgets.svg)](https://www.npmjs.com/package/accessibility-widgets)
[![License: GPL](https://img.shields.io/badge/License-GPL-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![CDN](https://img.shields.io/badge/CDN-unpkg-orange.svg)](https://unpkg.com/accessibility-widgets)

<a href="https://github.com/sponsors/sinanisler">
<img src="https://img.shields.io/badge/Consider_Supporting_My_Projects_❤-GitHub-d46" width="300" height="auto" />
</a>
<br><br>

A comprehensive, zero-dependency accessibility widget that enhances web accessibility for all users. This lightweight, single-file JavaScript solution provides 14+ accessibility features to make your website instantly more inclusive and compliant with WCAG 2.1 AA, Section 508, and EN 301 549 standards.
<br><br>

<img width="1793" height="1028" alt="image" src="https://github.com/user-attachments/assets/610138f5-e60d-4297-b5e3-ea040f361209" />


## ⚡ Quick Start

```html
<!-- Include the widget - That's it! -->
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

Or install via NPM:

```bash
npm install accessibility-widgets
```

```javascript
// Import in your project
import 'accessibility-widgets';
// or
require('accessibility-widgets');
```

## ✨ Key Features

### 🎨 Visual Enhancements
- **High Contrast Mode** - 3 levels (Medium 1.3x, High 1.5x, Ultra 2.0x) for improved visibility
- **Text Size Control** - 4 size options (Default, Medium 20px, Large 24px, X-Large 28px)
- **Line Height Adjustment** - 3 spacing levels (2em, 3em, 4em) for better readability
- **Text Spacing** - Enhanced letter (0.2em) and word spacing (0.3em)
- **Text Alignment** - Left, Center, or Right alignment options
- **Bigger Cursor** - High-contrast 48x72px cursor with SVG rendering
- **Hide Images** - Text-only mode for focused reading or bandwidth saving

### 🧠 Cognitive Support
- **Dyslexia-Friendly Font** - Comic Sans MS and other dyslexia-optimized fonts
- **Font Selection** - Choose between Arial, Times New Roman, or Verdana
- **Animation Control** - Pause all animations and transitions
- **Reduced Motion** - Motion sensitivity support for vestibular disorders

### ♿ Assistive Technology
- **Screen Reader** - Built-in text-to-speech using Web Speech API
- **Voice Control** - Hands-free navigation with 15+ voice commands
- **Color Blindness Filters** - Protanopia, Deuteranopia, Tritanopia, and Grayscale modes
- **Keyboard Navigation** - Full Tab/Arrow key support with proper focus indicators

## 📊 Compliance & Standards

### WCAG 2.1 AA Coverage

| Feature | WCAG Criteria | EU EN 301 549 | US Section 508 |
|---------|---------------|---------------|----------------|
| High Contrast Mode | ✅ 1.4.3, 1.4.6 | ✅ | ✅ |
| Text Size Adjustment | ✅ 1.4.4 | ✅ | ✅ |
| Text Spacing | ✅ 1.4.12 | ✅ | ✅ |
| Line Height Adjustment | ✅ 1.4.12 | ✅ | ✅ |
| Text Alignment | ✅ 1.4.8 | ✅ | ✅ |
| Cursor Enhancement | ✅ 2.5.5 | ✅ | ✅ |
| Pause Animations | ✅ 2.2.2, 2.3.3 | ✅ | ✅ |
| Reduced Motion | ✅ 2.3.3 | ✅ | ✅ |
| Hide Images | ✅ 1.1.1 | ✅ | ✅ |
| Dyslexia-Friendly Font | ✅ 1.4.8 | ✅ | ✅ |
| Screen Reader | ✅ 4.1.3 | ✅ | ✅ |
| Voice Control | ⚠️ Browser API | ⚠️ | ⚠️ |
| Color Filters | ✅ 1.4.1 | ✅ | ✅ |

> **Note**: This widget helps meet accessibility criteria but does not guarantee full compliance. Complete WCAG/Section 508 compliance requires proper HTML semantics, ARIA attributes, manual testing, and user validation.






## 🎯 Installation Methods

### CDN (Fastest)
```html
<!-- unpkg CDN -->
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>

<!-- jsdelivr CDN -->
<script src="https://cdn.jsdelivr.net/npm/accessibility-widgets@latest/widget.js"></script>
```

### NPM
```bash
npm install accessibility-widgets
```

```javascript
// ES6 Import
import 'accessibility-widgets/widget.js';

// CommonJS
require('accessibility-widgets/widget.js');
```

### Direct Download
1. Download [widget.js](https://github.com/sinanisler/accessibility-widgets/raw/main/widget.js)
2. Include in your HTML:
```html
<script src="path/to/widget.js"></script>
```

## ⚙️ Configuration

### Basic Setup (No Configuration Needed)
The widget works out of the box with zero configuration:

```html
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

### Custom Configuration
Customize the widget by defining `window.ACCESSIBILITY_WIDGET_CONFIG` before loading the script:

```html
<script>
window.ACCESSIBILITY_WIDGET_CONFIG = {
  // Disable specific features
  enableVoiceControl: false,
  enableScreenReader: true,
  
  // Custom styling
  widgetWidth: '400px',
  colors: {
    primary: '#0066cc',
    secondary: '#ffffff'
  },
  
  // Position on left side
  widgetPosition: {
    side: 'left',
    left: '20px',
    bottom: '20px'
  }
};
</script>
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

### Full Configuration Options

```javascript
window.ACCESSIBILITY_WIDGET_CONFIG = {
  // ===== Core Feature Toggles =====
  enableHighContrast: true,        // 3-level high contrast mode
  enableBiggerText: true,          // 4-level text size control
  enableTextSpacing: true,         // 3-level text spacing
  enablePauseAnimations: true,     // Pause animations & reduced motion
  enableHideImages: true,          // Hide images toggle
  enableDyslexiaFont: true,        // Dyslexia-friendly fonts
  enableBiggerCursor: true,        // Large cursor
  enableLineHeight: true,          // 3-level line height (2em, 3em, 4em)
  enableTextAlign: true,           // Text alignment (left, center, right)
  
  // ===== Advanced Features =====
  enableScreenReader: true,        // Built-in text-to-speech
  enableVoiceControl: true,        // Voice command control
  enableFontSelection: true,       // Font family selection
  enableColorFilter: true,         // Color blindness filters

  // ===== Widget Layout =====
  widgetWidth: '440px',
  
  // ===== Grid Configuration =====
  gridLayout: {
    columns: '1fr 1fr',            // Default 2-column grid
    gap: '10px'                    // Gap between grid items
  },
  
  // ===== Position =====
  widgetPosition: {
    side: 'right',                 // 'left' or 'right'
    right: '20px',
    left: '20px',
    bottom: '20px'
  },

  // ===== Colors =====
  colors: {
    primary: '#1663d7',            // Header bg, main button, active borders
    secondary: '#ffffff',          // Main button icon, header text
    optionBg: '#ffffff',           // Option button background
    optionText: '#333333',         // Option button text
    optionIcon: '#000000'          // Option button icons
  },

  // ===== Button Styling =====
  button: {
    size: '55px',
    borderRadius: '100px',
    iconSize: '40px',
    shadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },

  // ===== Menu Styling =====
  menu: {
    headerHeight: '70px',
    padding: '0 10px 10px 10px',
    optionPadding: '20px 10px',
    optionMargin: '10px',
    borderRadius: '8px',
    fontSize: '16px',
    titleFontSize: '16px',
    closeButtonSize: '44px'
  },

  // ===== Typography =====
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '17px',
    titleFontSize: '22px',
    titleFontWeight: '700',
    lineHeight: '1'
  },

  // ===== Animation =====
  animation: {
    transition: '0.2s',
    hoverScale: '1.05'
  },

  // ===== Internationalization (i18n) =====
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
    reset: 'Reset',
    saturation: 'Saturation',
    selectLanguage: 'Select Language'
  },

  // ===== Voice Commands (Multi-language Support) =====
  voiceCommands: {
    en: {
      showMenu: ['show menu', 'open menu', 'accessibility menu', 'access menu'],
      highContrast: ['high contrast', 'contrast', 'dark mode', 'increase contrast'],
      biggerText: ['bigger text', 'large text', 'text size', 'increase text', 'bigger', 'larger text', 'text bigger', 'make text bigger', 'enlarge text'],
      textSpacing: ['text spacing', 'spacing', 'letter spacing', 'text space'],
      pauseAnimations: ['pause animations', 'stop animations', 'disable animations', 'no animations'],
      hideImages: ['hide images', 'remove images', 'no images'],
      dyslexiaFont: ['dyslexia friendly', 'dyslexia font', 'readable font', 'easy font'],
      biggerCursor: ['bigger cursor', 'large cursor', 'cursor size', 'big cursor'],
      lineHeight: ['line height', 'line spacing', 'space between lines', 'line space'],
      textAlign: ['align text', 'text align', 'center text', 'alignment'],
      screenReader: ['screen reader', 'read aloud', 'voice reader'],
      voiceControl: ['voice command', 'voice control', 'voice commands'],
      resetAll: ['reset all', 'reset everything', 'clear all', 'reset settings', 'reset']
    },
    // Additional languages: de, es, it, fr, ru, tr, ar, hi, zh-cn, jp available in widget
  }
};
```

## 🌍 Internationalization (i18n)

Full multilingual support - customize all text and voice commands:

### Spanish Example
```html
<script>
window.ACCESSIBILITY_WIDGET_CONFIG = {
  lang: {
    accessibilityMenu: 'Menú de Accesibilidad',
    accessibilityTools: 'Herramientas de Accesibilidad',
    screenReader: 'Lector de Pantalla',
    highContrast: 'Alto Contraste',
    biggerText: 'Texto Más Grande',
    resetAllSettings: 'Restablecer Todo'
  },
  voiceCommands: {
    showMenu: ['mostrar menú', 'abrir menú'],
    highContrast: ['alto contraste'],
    biggerText: ['texto grande', 'texto más grande'],
    resetAll: ['reiniciar todo']
  }
};
</script>
<script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
```

## 🎤 Voice Commands

When voice control is enabled (Chrome/Edge only), use these commands:

| Command | Action |
|---------|--------|
| "show menu" / "open menu" | Opens accessibility menu |
| "high contrast" | Toggles contrast mode |
| "bigger text" / "large text" | Increases text size |
| "text spacing" | Toggles text spacing |
| "pause animations" | Stops all animations |
| "hide images" | Removes images |
| "dyslexia font" | Activates dyslexia-friendly font |
| "bigger cursor" | Enlarges cursor |
| "line height" | Adjusts line spacing |
| "screen reader" | Activates text-to-speech |
| "reset all" | Resets all settings |

*All commands are fully customizable via `voiceCommands` configuration*## 📚 Feature Details

### High Contrast Mode
Three contrast enhancement levels:
- **Medium**: 1.3x boost for subtle improvement
- **High**: Black background + white text + 1.5x contrast
- **Ultra**: Black background + yellow text + 2.0x contrast

### Text Size Control
Four size options (Default, Medium 20px, Large 24px, X-Large 28px) with smart widget exclusion to maintain UI consistency.

### Text Spacing
Enhanced letter spacing (0.2em) and word spacing (0.3em) for improved readability, especially helpful for dyslexia.

### Line Height Adjustment
Three spacing levels (2em, 3em, 4em) to reduce visual crowding and improve reading flow.

### Animation Control
Completely disables CSS animations and transitions - critical for users with vestibular disorders or ADHD.

### Image Hiding
Text-only mode with smart caching (5-second intervals) to catch dynamically loaded images.

### Dyslexia-Friendly Font
Uses Comic Sans MS and fallback fonts optimized for dyslexia (Chalkboard SE, Bradley Hand, Brush Script MT).

### Cursor Enhancement
Custom 48x72px SVG cursor with high-contrast black fill and white stroke for better visibility.

### Screen Reader (Text-to-Speech)
Built-in TTS using Web Speech API - reads focused element text, alt attributes, and titles.

### Voice Control
Hands-free operation with Web Speech Recognition API. Supports 15+ customizable commands.

### Color Blindness Filters
SVG-based filters for Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind), and Grayscale modes.

### Font Selection
Cycle through Arial (modern sans-serif), Times New Roman (traditional serif), and Verdana (screen-optimized).

## 🚀 Technical Features

- ✅ **Zero Dependencies** - Pure vanilla JavaScript, no frameworks required
- ✅ **Lightweight** - Single file, ~1900 lines minified
- ✅ **Persistent Settings** - localStorage saves user preferences across sessions
- ✅ **Keyboard Accessible** - Full Tab/Arrow key navigation with proper focus management
- ✅ **ARIA Compliant** - Complete ARIA labels and roles for assistive technologies
- ✅ **Performance Optimized** - DOM caching, efficient event delegation, debounced updates
- ✅ **Error Handling** - Graceful degradation for unsupported browser APIs
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Flexible Positioning** - Left or right side placement with custom offsets
- ✅ **Full i18n Support** - Complete text customization for any language
- ✅ **Dynamic Theming** - Customizable colors with SVG icon color synchronization
- ✅ **Auto-initialization** - Automatically loads when DOM is ready

## 🌐 Browser Compatibility

| Browser | Core Features | Screen Reader | Voice Control |
|---------|---------------|---------------|---------------|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |
| Firefox 88+ | ✅ | ✅ | ❌ |
| Safari 14+ | ✅ | ✅ | ❌ |
| Opera 76+ | ✅ | ✅ | ✅ |

**Note**: Voice Control requires Web Speech Recognition API (Chromium-based browsers only). Screen Reader requires Web Speech Synthesis API.
## 💡 Usage Examples

### Minimal Implementation
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Accessible Website</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>This site is fully accessible.</p>
    
    <!-- Add widget - automatically initializes -->
    <script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
</body>
</html>
```

### With Custom Configuration
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Custom Accessible Site</title>
</head>
<body>
    <h1>Custom Configuration</h1>
    
    <script>
    // Configure before loading widget
    window.ACCESSIBILITY_WIDGET_CONFIG = {
      widgetWidth: '380px',
      colors: {
        primary: '#9c27b0', // Purple theme
        secondary: '#ffffff'
      },
      enableVoiceControl: false, // Disable voice control
      widgetPosition: {
        side: 'left',
        left: '15px',
        bottom: '15px'
      }
    };
    </script>
    <script src="https://unpkg.com/accessibility-widgets@latest/widget.js"></script>
</body>
</html>
```


## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

GPL-3.0 License - See [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sinan Isler**
- Website: [sinan.im](https://sinan.im)
- Email: sinan@sinan.im
- GitHub: [@sinanisler](https://github.com/sinanisler)

## 🌟 Support

- ⭐ Star this repository
- 🐛 [Report bugs](https://github.com/sinanisler/accessibility-widgets/issues)
- ❤️ [Sponsor on GitHub](https://github.com/sponsors/sinanisler)

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/sinanisler/accessibility-widgets?style=social)
![npm downloads](https://img.shields.io/npm/dm/accessibility-widgets)
![GitHub issues](https://img.shields.io/github/issues/sinanisler/accessibility-widgets)
![GitHub license](https://img.shields.io/github/license/sinanisler/accessibility-widgets)

---

**Made with ❤️ for a more accessible web**
