import { DEFAULT_INDEX, DEFAULT_LEVEL } from "../constants";
import { ContentHeading } from "../types/content";

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function findLastHeadingByLevel(
  headings: ContentHeading[],
  level: number
): ContentHeading | undefined {
  let heading = headings.filter((h) => h.level === level).pop();
  if (level !== 0) {
    return heading || findLastHeadingByLevel(headings, level - 1);
  }
  return heading;
}

export function getHeadlineLevel(
  heading: ContentHeading,
  previousHeadings: ContentHeading[]
): number {
  let level = DEFAULT_LEVEL;
  const lastHeading = previousHeadings[previousHeadings.length - 1];
  const previousHeading = [...previousHeadings]
    .reverse()
    .find((h) => h.originalLevel <= heading.node.attrs.level);
  const previousLevel = previousHeading?.level || DEFAULT_LEVEL;

  level =
    heading.node.attrs.level > (lastHeading?.originalLevel || DEFAULT_LEVEL)
      ? (lastHeading?.level || DEFAULT_LEVEL) + 1
      : heading.node.attrs.level < (lastHeading?.originalLevel || DEFAULT_LEVEL)
      ? previousLevel
      : lastHeading?.level || DEFAULT_LEVEL;

  return level;
}

export function getLinearIndexes(
  heading: ContentHeading,
  previousHeadings: ContentHeading[]
): number {
  const lastHeading = previousHeadings[previousHeadings.length - 1];
  return lastHeading
    ? (lastHeading.itemIndex || DEFAULT_INDEX) + 1
    : DEFAULT_INDEX;
}

export function getHierarchicalIndexes(
  heading: ContentHeading,
  previousHeadings: ContentHeading[],
  level?: number
): number {
  const targetLevel = level || heading.node.attrs.level || DEFAULT_LEVEL;
  let index = DEFAULT_INDEX;
  const sameLevelHeadings = previousHeadings.filter(
    (h) => h.level <= targetLevel
  );

  const lastSameLevelHeading = sameLevelHeadings[sameLevelHeadings.length - 1];
  index =
    lastSameLevelHeading?.level === targetLevel
      ? (lastSameLevelHeading?.itemIndex || DEFAULT_INDEX) + 1
      : DEFAULT_INDEX;

  return index;
}
