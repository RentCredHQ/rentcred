/**
 * Shared state for the header notification dropdowns.
 *
 * Both the agent and ops dropdowns previously rendered a hardcoded list and
 * their "mark all read" only mutated that local array, so every signed-in user
 * saw the same five invented notifications on every page.
 */

export interface FeedNotification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  dot: string
  link: string | null
}

/** Colour of the leading dot, by notification type. */
const TYPE_DOT: Record<string, string> = {
  report_ready: 'bg-st-green-text',
  payment_confirmed: 'bg-st-green-text',
  review_received: 'bg-st-green-text',
  submission_update: 'bg-primary',
  field_visit_completed: 'bg-st-blue-text',
  kyb_update: 'bg-st-amber-text',
  dispute_update: 'bg-st-red-text',
  credit_low: 'bg-st-amber-text',
  system: 'bg-muted-foreground',
}

function relativeTime(value: string): string {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''

  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

/** Where clicking a notification should take the user, when we can tell. */
function linkFor(n: any, basePath: string): string | null {
  const submissionId = n?.data?.submissionId
  if (submissionId) {
    return basePath === '/ops' ? `/ops/cases/${submissionId}` : `/dashboard/submissions/${submissionId}`
  }
  return null
}

export function useNotificationFeed(basePath: '/dashboard' | '/ops' = '/dashboard') {
  const { getNotifications, markAsRead, markAllAsRead } = useNotifications()

  // Shared across the layout (which shows the unread badge) and the dropdown
  // (which renders the list), so opening the dropdown does not refetch what the
  // badge already loaded, and marking read updates both at once.
  const notifications = useState<FeedNotification[]>('notification-feed', () => [])
  const loading = useState<boolean>('notification-feed-loading', () => false)
  const loaded = useState<boolean>('notification-feed-loaded', () => false)
  const errored = useState<boolean>('notification-feed-errored', () => false)

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  async function load() {
    loading.value = true
    errored.value = false
    try {
      const res = await getNotifications({ page: 1, limit: 10 })
      notifications.value = (res.data ?? []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: relativeTime(n.createdAt),
        read: !!n.readAt,
        dot: TYPE_DOT[n.type] ?? 'bg-muted-foreground',
        link: linkFor(n, basePath),
      }))
      loaded.value = true
    } catch {
      errored.value = true
    } finally {
      loading.value = false
    }
  }

  async function handleRead(id: string) {
    const item = notifications.value.find((n) => n.id === id)
    if (!item || item.read) return
    item.read = true // optimistic; the badge should update immediately
    try {
      await markAsRead(id)
    } catch {
      item.read = false
    }
  }

  async function handleMarkAllRead() {
    if (!unreadCount.value) return
    const previous = notifications.value.map((n) => n.read)
    notifications.value.forEach((n) => { n.read = true })
    try {
      await markAllAsRead()
    } catch {
      notifications.value.forEach((n, i) => { n.read = previous[i] })
      errored.value = true
    }
  }

  return { notifications, loading, loaded, errored, unreadCount, load, handleRead, handleMarkAllRead }
}
