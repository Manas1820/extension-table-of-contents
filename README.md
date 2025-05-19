# Table of Contents Extension for TipTap

A TipTap extension that automatically generates and manages a table of contents from document headings.

## Features

- Automatically generates a hierarchical table of contents from document headings
- Supports custom heading types and levels
- Provides scroll position tracking
- Customizable heading ID generation
- Real-time updates as the document changes

## Installation

```bash
npm i tiptap-extension-table-of-content
```

## Usage

```typescript
import { TableOfContents } from "tiptap-extension-table-of-content";

const editor = new Editor({
  extensions: [
    // ... other extensions
    TableOfContents.configure({
      // Optional configuration
      anchorTypes: ["heading"],
      onUpdate: (items) => {
        // Handle table of contents updates
        console.log("Table of contents updated:", items);
      },
    }),
  ],
});
```

## Configuration Options

The extension can be configured with the following options:

- `anchorTypes`: Array of node types to be considered as headings (default: `["heading"]`)
- `getIndex`: Function to generate hierarchical structure from headings
- `getLevel`: Function to determine heading level
- `getId`: Function to generate unique IDs for headings
- `scrollParent`: Function to get the scrollable parent element
- `onUpdate`: Callback function when table of contents is updated

## API

### Commands

- `updateToC()`: Updates the table of contents based on the current document state
- `setupScrollHandler()`: Sets up scroll event handling for the table of contents
- `getHeadings()`: Retrieves the current headings from the document

### Storage

The extension maintains the following storage:

- `content`: Array of content headings
- `anchors`: Array of anchor elements
- `scrollHandler`: Scroll event handler function
- `scrollPosition`: Current scroll position

## Development

### Project Structure

```
src/
├── core/
│   └── TableOfContentsExtension.ts  # Main extension implementation
├── utils/
│   └── index.ts                     # Utility functions
├── types/
│   └── content.ts                   # Type definitions
├── constants/                       # Constants and configuration
└── index.ts                         # Main entry point
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## License

MIT
