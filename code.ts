// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
}

interface PluginMessage {
  type: string;
  colors?: ColorData[];
}

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  // This shows the HTML page in "ui.html".
  figma.showUI(__html__, { width: 420, height: 560 });

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage = (msg: PluginMessage) => {
    if (msg.type === 'create-palette' && msg.colors) {
      createColorPalette(msg.colors);
    } else if (msg.type === 'export-styles' && msg.colors) {
      exportPaletteAsStyles(msg.colors);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };

  function createColorPalette(colors: ColorData[]) {
    const nodes: SceneNode[] = [];
    const frame = figma.createFrame();
    
    // Set frame properties
    frame.name = "Color Palette";
    frame.layoutMode = "HORIZONTAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.itemSpacing = 16;
    frame.paddingTop = 24;
    frame.paddingBottom = 24;
    frame.paddingLeft = 24;
    frame.paddingRight = 24;
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    frame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    frame.strokeWeight = 1;
    frame.cornerRadius = 8;

    colors.forEach((color, index) => {
      // Create color rectangle
      const colorRect = figma.createRectangle();
      colorRect.name = `${color.name} (${color.hex})`;
      colorRect.resize(80, 80);
      colorRect.fills = [{ 
        type: 'SOLID', 
        color: { r: color.rgb.r, g: color.rgb.g, b: color.rgb.b } 
      }];
      colorRect.cornerRadius = 8;

      // Create text for color name
      const nameText = figma.createText();
      nameText.name = "Color Name";
      nameText.characters = color.name;
      nameText.fontSize = 12;
      nameText.fontName = { family: "Inter", style: "Medium" };
      nameText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];

      // Create text for hex code
      const hexText = figma.createText();
      hexText.name = "Hex Code";
      hexText.characters = color.hex;
      hexText.fontSize = 10;
      hexText.fontName = { family: "SF Mono", style: "Regular" };
      hexText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];

      // Create a vertical frame for each color
      const colorFrame = figma.createFrame();
      colorFrame.name = color.name;
      colorFrame.layoutMode = "VERTICAL";
      colorFrame.primaryAxisSizingMode = "AUTO";
      colorFrame.counterAxisSizingMode = "AUTO";
      colorFrame.itemSpacing = 8;
      colorFrame.fills = [];

      // Add elements to color frame
      colorFrame.appendChild(colorRect);
      colorFrame.appendChild(nameText);
      colorFrame.appendChild(hexText);

      // Add color frame to main frame
      frame.appendChild(colorFrame);
      nodes.push(colorFrame);
    });

    // Add the frame to the current page
    figma.currentPage.appendChild(frame);
    
    // Select the created frame
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
  }

  function exportPaletteAsStyles(colors: ColorData[]) {
    const createdStyles: PaintStyle[] = [];

    colors.forEach((color) => {
      // Create a new paint style
      const paintStyle = figma.createPaintStyle();
      paintStyle.name = color.name;
      paintStyle.paints = [{
        type: 'SOLID',
        color: { r: color.rgb.r, g: color.rgb.g, b: color.rgb.b }
      }];
      
      createdStyles.push(paintStyle);
    });

    // Show success message
    figma.notify(`Created ${createdStyles.length} color styles in your document!`);
  }
}