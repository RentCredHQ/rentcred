<script setup lang="ts">
definePageMeta({ layout: 'tenant' })
useSeoMeta({ title: 'My Reviews — RentCred' })

const { getMyReviews } = useReviews()
const { getMySubmissions } = useTenantProfile()

const reviews = ref<any[]>([])
const completedSubmissions = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const selectedSubmission = ref<any>(null)

// IDs of submissions that already have reviews (to hide the "Leave Review" button)
const reviewedSubmissionIds = computed(() => new Set(reviews.value.map((r: any) => r.submissionId)))

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}

function openForm(submission: any) {
  selectedSubmission.value = submission
  showForm.value = true
}

async function onReviewSubmitted() {
  showForm.value = false
  selectedSubmission.value = null
  // Refresh reviews
  try {
    const result = await getMyReviews()
    reviews.value = result.data || []
  } catch {}
}

onMounted(async () => {
  try {
    const [reviewsResult, submissionsResult] = await Promise.all([
      getMyReviews(),
      getMySubmissions({ limit: 100 }),
    ])
    reviews.value = reviewsResult.data || []
    completedSubmissions.value = (submissionsResult.data || []).filter(
      (s: any) => s.status === 'completed'
    )
  } catch {
    // Silently fail
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="font-mono text-xl lg:text-2xl font-bold text-foreground">My Reviews</h1>
        <p class="font-sans text-sm text-muted-foreground">Reviews you've submitted after verifications</p>
      </div>
    </div>

    <!-- Review Form -->
    <div v-if="showForm && selectedSubmission" class="bg-white border border-border rounded-xl p-5 lg:p-6">
      <TenantReviewForm
        :submission-id="selectedSubmission.id"
        :property-address="selectedSubmission.propertyAddress"
        :agent-name="selectedSubmission.agent?.name"
        :landlord-name="selectedSubmission.landlordName"
        @submitted="onReviewSubmitted"
        @cancel="showForm = false"
      />
    </div>

    <!-- Completed submissions eligible for review -->
    <div
      v-if="!showForm && completedSubmissions.length > 0"
      class="bg-white border border-border rounded-xl overflow-hidden"
    >
      <div class="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 class="font-mono text-sm font-semibold text-foreground">Pending Reviews</h2>
        <span class="font-sans text-[12px] text-muted-foreground">
          {{ completedSubmissions.filter(s => !reviewedSubmissionIds.has(s.id)).length }} awaiting review
        </span>
      </div>
      <div class="flex flex-col divide-y divide-border">
        <div
          v-for="sub in completedSubmissions"
          :key="sub.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4"
        >
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[14px] font-medium text-foreground">{{ sub.propertyAddress }}</span>
            <span class="font-sans text-[12px] text-muted-foreground">{{ sub.propertyType }} &bull; {{ sub.neighborhood }}, {{ sub.state }}</span>
          </div>
          <button
            v-if="!reviewedSubmissionIds.has(sub.id)"
            class="px-4 py-2 bg-primary font-sans text-[13px] font-medium text-foreground hover:opacity-90 transition-opacity flex-shrink-0"
            @click="openForm(sub)"
          >
            Leave Review
          </button>
          <span v-else class="font-sans text-[12px] text-muted-foreground flex items-center gap-1">
            <span class="material-symbols-rounded text-[14px]">check_circle</span>
            Reviewed
          </span>
        </div>
      </div>
    </div>

    <!-- Submitted reviews list -->
    <div v-if="reviews.length > 0" class="flex flex-col gap-4">
      <h2 class="font-mono text-sm font-semibold text-foreground">Submitted Reviews</h2>
      <div v-for="review in reviews" :key="review.id" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-4 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-0.5">
            <span class="font-sans text-[15px] font-medium text-foreground">{{ review.submission?.propertyAddress }}</span>
            <span class="font-sans text-[13px] text-muted-foreground">
              {{ review.submission?.propertyType }} &bull; {{ review.submission?.neighborhood }}, {{ review.submission?.state }}
            </span>
          </div>
          <span class="font-sans text-[12px] text-muted-foreground">
            {{ new Date(review.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Agent -->
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Agent</span>
            <span class="font-sans text-[13px] text-foreground">{{ review.submission?.agent?.name }}</span>
            <div class="flex gap-0.5">
              <span v-for="(filled, i) in renderStars(review.agentRating)" :key="`a-${i}`" class="material-symbols-rounded text-[16px]" :class="filled ? 'text-primary' : 'text-border'">star</span>
            </div>
            <span v-if="review.agentComment" class="font-sans text-[12px] text-muted-foreground">{{ review.agentComment }}</span>
          </div>

          <!-- Landlord -->
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Landlord</span>
            <span class="font-sans text-[13px] text-foreground">{{ review.submission?.landlordName }}</span>
            <div class="flex gap-0.5">
              <span v-for="(filled, i) in renderStars(review.landlordRating)" :key="`l-${i}`" class="material-symbols-rounded text-[16px]" :class="filled ? 'text-primary' : 'text-border'">star</span>
            </div>
            <span v-if="review.landlordComment" class="font-sans text-[12px] text-muted-foreground">{{ review.landlordComment }}</span>
          </div>

          <!-- Property -->
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Property</span>
            <div class="flex gap-0.5">
              <span v-for="(filled, i) in renderStars(review.propertyRating)" :key="`p-${i}`" class="material-symbols-rounded text-[16px]" :class="filled ? 'text-primary' : 'text-border'">star</span>
            </div>
            <span v-if="review.propertyComment" class="font-sans text-[12px] text-muted-foreground">{{ review.propertyComment }}</span>
          </div>
        </div>

        <div v-if="review.isAnonymous" class="flex items-center gap-1.5">
          <span class="material-symbols-rounded text-[14px] text-muted-foreground">visibility_off</span>
          <span class="font-sans text-[11px] text-muted-foreground">Submitted anonymously</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && reviews.length === 0 && completedSubmissions.length === 0" class="bg-white border border-border rounded-xl p-8 flex flex-col items-center gap-4 text-center">
      <span class="material-symbols-rounded text-[48px] text-muted-foreground">rate_review</span>
      <h3 class="font-mono text-lg font-semibold text-foreground">No Reviews Yet</h3>
      <p class="font-sans text-sm text-muted-foreground max-w-[400px]">After a verification is completed, you'll be able to review the agent, landlord, and property.</p>
    </div>
  </div>
</template>
