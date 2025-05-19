export interface ContentHeading {
  level: number;
  text: string;
  pos: number;
  id: string;
  itemIndex?: number;
  originalLevel?: number;
  textContent?: string;
  editor?: any;
  isActive?: boolean;
  isScrolledOver?: boolean;
  node?: any;
  dom?: HTMLElement;
}
