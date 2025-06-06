
export * from './IdeaCard';
export * from './TagBadge';
export * from './FavoriteButton';
export * from './CompareIdeasModal';
export * from './TagsSelector';
export * from './IdeasTabs';

// Export IdeasGrid but explicitly re-export Idea type to avoid ambiguity
export { IdeasGrid } from './IdeasGrid';
export type { Idea as IdeaGridType } from './IdeasGrid';

// Export useIdeasData with a different alias for the Idea type
export { useIdeasData } from './useIdeasData';
export type { Idea as IdeaDataType } from './useIdeasData';

// Export TagsFilter but explicitly re-export TagType to avoid ambiguity
export { TagsFilter } from './TagsFilter';
export type { TagType } from './TagsFilter';
