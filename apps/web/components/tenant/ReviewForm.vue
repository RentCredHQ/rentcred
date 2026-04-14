<script setup lang="ts">
const props = defineProps<{
  submissionId: string
  propertyAddress?: string
  agentName?: string
  landlordName?: string
}>()

const emit = defineEmits<{
  submitted: []
  cancel: []
}>()

const { createReview } = useReviews()
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  agentRating: 0,
  agentComment: '',
  landlordRating: 0,
  landlordComment: '',
  propertyRating: 0,
  propertyComment: '',
  isAnonymous: false,
})

function setRating(field: 'agentRating' | 'landlordRating' | 'propertyRating', value: number) {
  form[field] = value
}

async function handleSubmit() {
  if (form.agentRating === 0 || form.landlordRating === 0 || form.propertyRating === 0) {
    error.value = 'Please rate all three categories'
    return
  }

  isSubmitting.value = true
  error.value = null
  try {
    await createReview({
      submissionId: props.submissionId,
      agentRating: form.agentRating,
      agentComment: form.agentComment || undefined,
      landlordRating: form.landlordRating,
      landlordComment: form.landlordComment || undefined,
      propertyRating: form.propertyRating,
      propertyComment: form.propertyComment || undefined,
      isAnonymous: form.isAnonymous,
    })
    emit('submitted')
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Failed to submit review'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1.5">
      <h2 class="font-mono text-xl font-bold text-foreground">Leave a Review</h2>
      <p class="font-sans text-sm text-muted-foreground">How was your verification experience?</p>
    </div>

    <!-- Agent Rating -->
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <span class="font-mono text-[13px] font-semibold text-foreground">Agent</span>
        <span v-if="agentName" class="font-sans text-[12px] text-muted-foreground">{{ agentName }}</span>
      </div>
      <div class="flex gap-1">
        <button
          v-for="i in 5" :key="`agent-${i}`"
          type="button"
          class="p-0.5"
          @click="setRating('agentRating', i)"
        >
          <span class="material-symbols-rounded text-[28px]" :class="i <= form.agentRating ? 'text-primary' : 'text-border'">
            star
          </span>
        </button>
      </div>
      <textarea
        v-model="form.agentComment"
        rows="2"
        placeholder="Comment about the agent (optional)"
        class="w-full px-3.5 py-3 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
      />
    </div>

    <hr class="border-border" />

    <!-- Landlord Rating -->
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <span class="font-mono text-[13px] font-semibold text-foreground">Landlord</span>
        <span v-if="landlordName" class="font-sans text-[12px] text-muted-foreground">{{ landlordName }}</span>
      </div>
      <div class="flex gap-1">
        <button
          v-for="i in 5" :key="`landlord-${i}`"
          type="button"
          class="p-0.5"
          @click="setRating('landlordRating', i)"
        >
          <span class="material-symbols-rounded text-[28px]" :class="i <= form.landlordRating ? 'text-primary' : 'text-border'">
            star
          </span>
        </button>
      </div>
      <textarea
        v-model="form.landlordComment"
        rows="2"
        placeholder="Comment about the landlord (optional)"
        class="w-full px-3.5 py-3 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
      />
    </div>

    <hr class="border-border" />

    <!-- Property Rating -->
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <span class="font-mono text-[13px] font-semibold text-foreground">Property</span>
        <span v-if="propertyAddress" class="font-sans text-[12px] text-muted-foreground">{{ propertyAddress }}</span>
      </div>
      <div class="flex gap-1">
        <button
          v-for="i in 5" :key="`property-${i}`"
          type="button"
          class="p-0.5"
          @click="setRating('propertyRating', i)"
        >
          <span class="material-symbols-rounded text-[28px]" :class="i <= form.propertyRating ? 'text-primary' : 'text-border'">
            star
          </span>
        </button>
      </div>
      <textarea
        v-model="form.propertyComment"
        rows="2"
        placeholder="Comment about the property (optional)"
        class="w-full px-3.5 py-3 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
      />
    </div>

    <hr class="border-border" />

    <!-- Anonymous Toggle -->
    <div class="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3">
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="w-9 h-5 rounded-full p-0.5 transition-colors"
          :class="form.isAnonymous ? 'bg-primary' : 'bg-border'"
          @click="form.isAnonymous = !form.isAnonymous"
        >
          <div class="w-4 h-4 rounded-full bg-white transition-transform" :class="form.isAnonymous ? 'translate-x-4' : ''" />
        </button>
        <span class="font-sans text-sm font-medium text-foreground">Submit anonymously</span>
      </div>
      <span class="font-sans text-[12px] text-muted-foreground">Your name won't be shown</span>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-start gap-2.5 bg-red-50 border border-red-200 p-3.5 rounded">
      <span class="material-symbols-rounded text-[18px] text-error mt-0.5">error</span>
      <span class="font-sans text-[13px] text-error">{{ error }}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors" @click="emit('cancel')">Cancel</button>
      <button
        class="flex-1 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        :disabled="isSubmitting || form.agentRating === 0 || form.landlordRating === 0 || form.propertyRating === 0"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
      </button>
    </div>
  </div>
</template>
