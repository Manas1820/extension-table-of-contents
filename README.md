# Table of Contents Extension for TipTap v2

A TipTap extension that automatically generates and manages a table of contents from document headings.

> **Note**: This extension is fully compatible with the official TipTap Table of Contents extension. For more examples and use cases, refer to the [official documentation](https://tiptap.dev/docs/editor/extensions/functionality/table-of-contents).

## Features

- Automatically generates a hierarchical table of contents from document headings
- Supports custom heading types and levels
- Provides scroll position tracking
- Customizable heading ID generation
- Real-time updates as the document changes
- Flexible configuration options for custom implementations
- Support for custom heading types and levels
- Built-in scroll position tracking
- Customizable heading ID generation

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

### anchorTypes

The types of nodes to be considered as headings. By default, this is `["heading"]` but can be customized for custom heading extensions.

```typescript
TableOfContents.configure({
  anchorTypes: ["heading", "customAnchorType"],
});
```

### getIndex

Customize how item indexes are calculated. The extension provides two built-in functions:

```typescript
import {
  getLinearIndexes,
  getHierarchicalIndexes,
} from "tiptap-extension-table-of-content";

// Generate linear indexes (1 to n)
TableOfContents.configure({
  getIndex: getLinearIndexes,
});

// Generate hierarchical indexes (1.1, 1.2, 2.1, etc.)
TableOfContents.configure({
  getIndex: getHierarchicalIndexes,
});

// Custom implementation
TableOfContents.configure({
  getIndex: (anchor, previousAnchors, level) => {
    // Custom logic
    return 1;
  },
});
```

### getLevel

Customize how heading levels are determined:

```typescript
TableOfContents.configure({
  getLevel: (anchor, previousAnchors) => {
    // Custom level logic
    return 1;
  },
});
```

### getId

Customize heading ID generation:

```typescript
TableOfContents.configure({
  getId: (content) => {
    // Example using a slugify function
    return slugify(content);
  },
});
```

### scrollParent

Specify the scrollable parent element:

```typescript
TableOfContents.configure({
  scrollParent: () => editor.view.dom, // Use editor's DOM element
});
```

### onUpdate

Callback function for table of contents updates:

```typescript
// Vanilla JS example
TableOfContents.configure({
  onUpdate: (anchors, isCreate) => {
    // Handle updates
    anchors.forEach((anchor) => {
      // Process each anchor
    });
  },
});

// React example
const [anchors, setAnchors] = useState([]);

TableOfContents.configure({
  onUpdate: (anchors) => {
    setAnchors(anchors);
  },
});

// Vue example
const anchors = ref([]);

TableOfContents.configure({
  onUpdate: (anchors) => {
    anchors.value = anchors;
  },
});
```

## Storage

The extension maintains the following storage:

- `content`: Array of content headings
- `anchors`: Array of anchor elements
- `scrollHandler`: Scroll event handler function
- `scrollPosition`: Current scroll position

Access storage through:

```typescript
editor.storage.tableOfContents.content;
editor.storage.tableOfContents.anchors;
editor.storage.tableOfContents.scrollHandler;
editor.storage.tableOfContents.scrollPosition;
```

## Anchor Object Structure

Each anchor in the array contains the following properties:

```typescript
{
  dom: HTMLElement; // The HTML element for this anchor
  editor: Editor; // The editor instance
  id: string; // The node id
  isActive: boolean; // Whether this anchor is currently active
  isScrolledOver: boolean; // Whether this anchor was already scrolled over
  itemIndex: number; // The index of the item on its current level
  level: number; // The current level of the item
  node: Node; // The ProseMirror node for this anchor
  originalLevel: number; // The actual level
  pos: number; // The position of the anchor node
  textContent: string; // The text content of the anchor
}
```

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

MIT © [Manas Gupta](https://github.com/Manas1820)

See the [LICENSE](https://raw.githubusercontent.com/Manas1820/extension-table-of-contents/refs/heads/main/LICENSE) file for details.
