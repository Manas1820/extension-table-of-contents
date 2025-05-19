import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { v4 as uuid } from "uuid";
import {
  DATA_TOC_ID_ATTR,
  DEFAULT_ANCHOR_TYPES,
  DEFAULT_HEADLINE_TYPE,
  DEFAULT_INDEX,
  DEFAULT_LEVEL,
  PLUGIN_KEY,
  TOC_META_KEY,
} from "../constants";
import { ContentHeading } from "../types/content";
import {
  didTransactionModifyHeading,
  getHeadlineLevel,
  getLinearIndexes,
} from "../utils";

export interface TableOfContentsOptions {
  anchorTypes?: string[];
  getId?: (content: string) => string;
  scrollParent?: () => HTMLElement | Window;
  onUpdate?: (items: ContentHeading[], isInitial?: boolean) => void;
  getIndexFn?: typeof getLinearIndexes;
  getLevelFn?: typeof getHeadlineLevel;
}

export interface TableOfContentsStorage {
  content: ContentHeading[];
  anchors: HTMLElement[];
  scrollHandler: () => void;
  scrollPosition: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableOfContents: {
      updateTableOfContents: () => ReturnType;
    };
  }
}

const TableOfContentsPlugin = ({
  getId,
  anchorTypes = DEFAULT_ANCHOR_TYPES,
}) => {
  return new Plugin({
    key: new PluginKey(PLUGIN_KEY),
    appendTransaction(transactions, oldState, newState) {
      const tr = newState.tr;
      let modified = false;

      if (transactions.some((t) => t.docChanged)) {
        const ids: string[] = [];
        newState.doc.descendants((node, pos) => {
          const id = node.attrs[DATA_TOC_ID_ATTR];
          if (
            anchorTypes.includes(node.type.name) &&
            node.textContent.length !== 0
          ) {
            if (id == null || ids.includes(id)) {
              let newId = "";
              newId = getId ? getId(node.textContent) : uuid();
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                [DATA_TOC_ID_ATTR]: newId,
                id: newId,
              });
              modified = true;
            }
            ids.push(id);
          }
        });
      }

      return modified ? tr : null;
    },
  });
};

const updateContentWithScroll = (
  content: ContentHeading[],
  options: {
    editor: any;
    anchorTypes?: string[];
    storage: TableOfContentsStorage;
    onUpdate?: (items: ContentHeading[], isInitial?: boolean) => void;
  }
) => {
  const { editor } = options;
  const headings: ContentHeading[] = [];
  const scrolledIds: string[] = [];
  let activeId: string | null = null;

  if (editor.isDestroyed) return content;

  editor.state.doc.descendants((node: any, pos: number) => {
    if (options.anchorTypes?.includes(node.type.name)) {
      headings.push({
        id: node.attrs[DATA_TOC_ID_ATTR] || uuid(),
        level: node.attrs.level || DEFAULT_LEVEL,
        text: node.textContent,
        pos,
        node,
      });
    }
  });

  headings.forEach((heading) => {
    const domNode = editor.view.domAtPos(heading.pos + 1).node;
    if (options.storage.scrollPosition >= domNode.offsetTop) {
      activeId = heading.id;
      scrolledIds.push(heading.id);
    }
  });

  content = content.map((item) => ({
    ...item,
    isActive: item.id === activeId,
    isScrolledOver: scrolledIds.includes(item.id),
  }));

  if (options.onUpdate) {
    const isInitial = options.storage.content.length === 0;
    options.onUpdate(content, isInitial);
  }

  return content;
};

const updateTableOfContents = (options: {
  editor: any;
  storage: TableOfContentsStorage;
  onUpdate?: (items: ContentHeading[], isInitial?: boolean) => void;
  getIndexFn?: typeof getLinearIndexes;
  getLevelFn?: typeof getHeadlineLevel;
  anchorTypes?: string[];
}) => {
  const { editor, onUpdate } = options;
  if (editor.isDestroyed) return;

  const headings: ContentHeading[] = [];
  let content: ContentHeading[] = [];
  const anchors: HTMLElement[] = [];

  editor.state.doc.descendants((node: any, pos: number) => {
    if (options.anchorTypes?.includes(node.type.name)) {
      headings.push({
        id: node.attrs[DATA_TOC_ID_ATTR] || uuid(),
        level: node.attrs.level || DEFAULT_LEVEL,
        text: node.textContent,
        pos,
        node,
      });
    }
  });

  headings.forEach((heading, index) => {
    if (heading.text.length === 0) return;

    const domNode = editor.view.domAtPos(heading.pos + 1).node;
    const isScrolledOver = options.storage.scrollPosition >= domNode.offsetTop;
    anchors.push(domNode);

    const originalLevel = heading.level;
    const previousHeading = headings[index - 1];
    const level = options.getLevelFn?.(heading, content) ?? originalLevel;
    const itemIndex = options.getIndexFn?.(heading, content) ?? DEFAULT_INDEX;

    content = previousHeading
      ? [
          ...content,
          {
            itemIndex,
            id: heading.id,
            originalLevel,
            level,
            text: heading.text,
            textContent: heading.text,
            pos: heading.pos,
            editor,
            isActive: false,
            isScrolledOver: false,
            node: heading.node,
            dom: domNode,
          },
        ]
      : [
          ...content,
          {
            itemIndex,
            id: heading.id,
            originalLevel,
            level,
            text: heading.text,
            textContent: heading.text,
            pos: heading.pos,
            editor,
            isActive: false,
            isScrolledOver,
            node: heading.node,
            dom: domNode,
          },
        ];
  });

  content = updateContentWithScroll(content, options);

  if (onUpdate) {
    const isInitial = options.storage.content.length === 0;
    onUpdate(content, isInitial);
  }

  options.storage.anchors = anchors;
  options.storage.content = content;
  editor.state.tr.setMeta(TOC_META_KEY, content);
  editor.view.dispatch(editor.state.tr);
};

export const TableOfContents = Extension.create<
  TableOfContentsOptions,
  TableOfContentsStorage
>({
  name: "tableOfContents",

  addStorage() {
    return {
      content: [],
      anchors: [],
      scrollHandler: () => null,
      scrollPosition: 0,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.anchorTypes || DEFAULT_HEADLINE_TYPE,
        attributes: {
          id: {
            default: null,
            renderHTML: (attributes) => ({ id: attributes.id }),
            parseHTML: (element) => element.id || null,
          },
          [DATA_TOC_ID_ATTR]: {
            default: null,
            renderHTML: (attributes) => ({
              [DATA_TOC_ID_ATTR]: attributes[DATA_TOC_ID_ATTR],
            }),
            parseHTML: (element) => element.dataset.tocId || null,
          },
        },
      },
    ];
  },

  addOptions() {
    return {
      onUpdate: () => {},
      getId: (content: string) => uuid(),
      scrollParent: typeof window !== "undefined" ? () => window : undefined,
      anchorTypes: DEFAULT_ANCHOR_TYPES,
    };
  },

  addCommands() {
    return {
      updateTableOfContents:
        () =>
        ({ dispatch }) => {
          if (dispatch) {
            updateTableOfContents({
              editor: this.editor,
              storage: this.storage,
              onUpdate: this.options.onUpdate?.bind(this),
              getIndexFn: this.options.getIndexFn || getLinearIndexes,
              getLevelFn: this.options.getLevelFn || getHeadlineLevel,
              anchorTypes: this.options.anchorTypes,
            });
          }
          return true;
        },
    };
  },

  onTransaction({ transaction }) {
    // Check if the transaction modified the document and is not a TOC update itself
    if (!transaction.docChanged || transaction.getMeta(TOC_META_KEY)) {
      return;
    }

    const headingModified = didTransactionModifyHeading(transaction);

    if (!headingModified) {
      return;
    }

    // If a heading was modified, update the table of contents
    updateTableOfContents({
      editor: this.editor,
      storage: this.storage,
      onUpdate: this.options.onUpdate?.bind(this),
      getIndexFn: this.options.getIndexFn || getLinearIndexes,
      getLevelFn: this.options.getLevelFn || getHeadlineLevel,
      anchorTypes: this.options.anchorTypes,
    });
  },

  onCreate() {
    const { tr } = this.editor.state;
    const ids: string[] = [];

    if (
      this.options.scrollParent &&
      typeof this.options.scrollParent !== "function"
    ) {
      console.warn(
        "[Tiptap Table of Contents Deprecation Notice]: The 'scrollParent' option must now be provided as a callback function that returns the 'scrollParent' element. The ability to pass this option directly will be deprecated in future releases."
      );
    }

    this.editor.state.doc.descendants((node, pos) => {
      const id = node.attrs[DATA_TOC_ID_ATTR];
      if (
        this.options.anchorTypes?.includes(node.type.name) &&
        node.textContent.length !== 0
      ) {
        if (id == null || ids.includes(id)) {
          let newId = "";
          newId = this.options.getId
            ? this.options.getId(node.textContent)
            : uuid();
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            [DATA_TOC_ID_ATTR]: newId,
            id: newId,
          });
        }
        ids.push(id);
      }
    });

    this.editor.view.dispatch(tr);

    updateTableOfContents({
      editor: this.editor,
      storage: this.storage,
      onUpdate: this.options.onUpdate?.bind(this),
      getIndexFn: this.options.getIndexFn || getLinearIndexes,
      getLevelFn: this.options.getLevelFn || getHeadlineLevel,
      anchorTypes: this.options.anchorTypes,
    });

    this.storage.scrollHandler = () => {
      if (!this.options.scrollParent) return;

      const scrollParent =
        typeof this.options.scrollParent === "function"
          ? this.options.scrollParent()
          : this.options.scrollParent;

      this.storage.scrollPosition =
        scrollParent instanceof HTMLElement
          ? scrollParent.scrollTop
          : scrollParent.scrollY || 0;

      const content = updateContentWithScroll(this.storage.content, {
        editor: this.editor,
        anchorTypes: this.options.anchorTypes,
        storage: this.storage,
        onUpdate: this.options.onUpdate?.bind(this),
      });

      this.storage.content = content;
    };

    if (!this.options.scrollParent) return;

    const scrollParent =
      typeof this.options.scrollParent === "function"
        ? this.options.scrollParent()
        : this.options.scrollParent;

    if (scrollParent) {
      scrollParent.addEventListener("scroll", this.storage.scrollHandler);
    }
  },

  onDestroy() {
    if (!this.options.scrollParent) return;

    const scrollParent =
      typeof this.options.scrollParent === "function"
        ? this.options.scrollParent()
        : this.options.scrollParent;

    if (scrollParent) {
      scrollParent.removeEventListener("scroll", this.storage.scrollHandler);
    }
  },

  addProseMirrorPlugins() {
    return [
      TableOfContentsPlugin({
        getId: this.options.getId,
        anchorTypes: this.options.anchorTypes,
      }),
    ];
  },
});
