import { ref, computed, unref, type Ref, type ComputedRef } from 'vue'

interface FilterConfig<T> {
  items: Ref<T[]> | T[]
  searchFields?: (keyof T)[]
  statusField?: keyof T
  dateField?: keyof T
  customFilter?: (item: T, query: string, status: string) => boolean
}

export function useFilter<T extends Record<string, any>>(config: FilterConfig<T>, defaultFilter = 'all') {
  const searchQuery = ref('')
  const activeFilter = ref(defaultFilter)
  const dateRange = ref('all')

  const matchesSearch = (item: T, query: string, fields: (keyof T)[]): boolean => {
    if (!query) return true
    const q = query.toLowerCase()
    return fields.some((field) => {
      const value = item[field]
      if (value == null) return false
      return String(value).toLowerCase().includes(q)
    })
  }

  const matchesStatus = (item: T, status: string, field: keyof T): boolean => {
    if (status === 'all') return true
    return String(item[field]).toLowerCase() === status.toLowerCase()
  }

  const matchesDateRange = (item: T, range: string, field: keyof T): boolean => {
    if (range === 'all') return true
    const date = new Date(item[field] as string)
    const now = new Date()
    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString()
      case 'week': {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return date >= weekAgo
      }
      case 'month': {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        return date >= monthAgo
      }
      case 'year': {
        const yearAgo = new Date(now)
        yearAgo.setFullYear(now.getFullYear() - 1)
        return date >= yearAgo
      }
      default:
        return true
    }
  }

  const filtered: ComputedRef<T[]> = computed(() => {
    const items = unref(config.items)
    const query = searchQuery.value
    const status = activeFilter.value

    return items.filter((item) => {
      if (config.customFilter) {
        return config.customFilter(item, query, status)
      }

      if (config.searchFields && !matchesSearch(item, query, config.searchFields)) {
        return false
      }

      if (config.statusField && !matchesStatus(item, status, config.statusField)) {
        return false
      }

      if (config.dateField && !matchesDateRange(item, dateRange.value, config.dateField)) {
        return false
      }

      return true
    })
  })

  const resultCount = computed(() => filtered.value.length)

  const resetFilters = () => {
    searchQuery.value = ''
    activeFilter.value = defaultFilter
    dateRange.value = 'all'
  }

  return {
    searchQuery,
    activeFilter,
    dateRange,
    filtered,
    resetFilters,
    resultCount,
  }
}
