/**
 * Query keys for React Query
 * Centralized query key factory for consistent cache management
 */

export const queryKeys = {
  // Feed queries
  feed: {
    all: ['feed'] as const,
    lists: () => [...queryKeys.feed.all, 'list'] as const,
    list: (feedType: string, sortBy: string, timeRange: string, tagId?: string, authorId?: string, dateRangeType?: string, tagIdsStr?: string) =>
      [...queryKeys.feed.lists(), feedType, sortBy, timeRange, tagId || 'all', authorId || 'all', dateRangeType || 'all', tagIdsStr || 'all'] as const,
    details: () => [...queryKeys.feed.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.feed.details(), id] as const,
    pages: () => [...queryKeys.feed.all, 'page'] as const,
    page: (feedType: string, sortBy: string, timeRange: string, page: number, tagId?: string) =>
      [...queryKeys.feed.pages(), feedType, sortBy, timeRange, page, tagId || 'all'] as const,
  },
} as const

