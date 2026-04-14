<script setup lang="ts">
definePageMeta({ layout: 'tenant' })
useSeoMeta({ title: 'Disputes — RentCred' })

const { getDisputes, createDispute: createDisputeApi } = useDisputes()
const { getMySubmissions } = useTenantProfile()

const disputes = ref<any[]>([])
const submissions = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const form = reactive({
  submissionId: '',
  reason: '',
  description: '',
})

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'resolved': return 'bg-[#DFE6E1] text-[#004D1A]'
    case 'closed': return 'bg-[#E7E8E5] text-foreground'
    case 'under_review': return 'bg-[#E9E3D8] text-[#804200]'
    default: return 'bg-blue-50 text-blue-600'
  }
}

async function loadData() {
  try {
    const [disputeResult, subResult] = await Promise.all([
      getDisputes(),
      getMySubmissions(),
    ])
    disputes.value = disputeResult.data || []
    submissions.value = subResult.data || []
  } catch {
    // No data
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!form.submissionId || !form.reason || !form.description) return
  isSubmitting.value = true
  submitError.value = null
  try {
    await createDisputeApi({
      submissionId: form.submissionId,
      reason: form.reason,
      description: form.description,
    })
    showForm.value = false
    form.submissionId = ''
    form.reason = ''
    form.description = ''
    await loadData()
  } catch (e: any) {
    submitError.value = e.data?.message || 'Failed to file dispute'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="font-mono text-xl lg:text-2xl font-bold text-foreground">Disputes</h1>
        <p class="font-sans text-sm text-muted-foreground">Challenge verification findings</p>
      </div>
      <button
        v-if="!showForm"
        class="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground rounded font-mono text-[13px] font-medium hover:opacity-90 transition-opacity"
        @click="showForm = true"
      >
        <span class="material-symbols-rounded text-[18px]">add</span>
        File Dispute
      </button>
    </div>

    <!-- New Dispute Form -->
    <div v-if="showForm" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-4 shadow-sm">
      <h2 class="font-mono text-base font-semibold text-foreground">File a New Dispute</h2>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Submission</label>
          <select v-model="form.submissionId" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
            <option value="" disabled>Select a verification</option>
            <option v-for="sub in submissions" :key="sub.id" :value="sub.id">{{ sub.propertyAddress }} ({{ sub.status }})</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Reason</label>
          <input v-model="form.reason" type="text" placeholder="Brief reason for dispute" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-sans text-[13px] font-medium text-foreground">Description</label>
          <textarea v-model="form.description" rows="4" placeholder="Describe the issue in detail..." class="w-full px-3.5 py-3 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
        </div>

        <div v-if="submitError" class="font-sans text-[13px] text-error">{{ submitError }}</div>

        <div class="flex items-center gap-3">
          <button class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors" @click="showForm = false">Cancel</button>
          <button
            class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            :disabled="isSubmitting || !form.submissionId || !form.reason || !form.description"
            @click="handleSubmit"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Dispute' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Disputes List -->
    <div v-for="dispute in disputes" :key="dispute.id" class="bg-white border border-border rounded-xl p-5 lg:p-6 flex flex-col gap-3 shadow-sm">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-0.5">
          <span class="font-sans text-[15px] font-medium text-foreground">{{ dispute.reason }}</span>
          <span class="font-sans text-[13px] text-muted-foreground">Filed {{ new Date(dispute.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize" :class="statusBadgeClasses(dispute.status)">
          {{ dispute.status.replace('_', ' ') }}
        </span>
      </div>
      <p class="font-sans text-sm text-muted-foreground">{{ dispute.description }}</p>
      <div v-if="dispute.resolution" class="bg-[#DFE6E1] rounded-lg p-3">
        <span class="font-mono text-[11px] font-semibold text-[#004D1A] uppercase tracking-wider">Resolution</span>
        <p class="font-sans text-sm text-[#004D1A] mt-1">{{ dispute.resolution }}</p>
      </div>
    </div>

    <div v-if="!loading && disputes.length === 0 && !showForm" class="bg-white border border-border rounded-xl p-8 flex flex-col items-center gap-4 text-center">
      <span class="material-symbols-rounded text-[48px] text-muted-foreground">gavel</span>
      <h3 class="font-mono text-lg font-semibold text-foreground">No Disputes</h3>
      <p class="font-sans text-sm text-muted-foreground max-w-[400px]">You haven't filed any disputes. If you disagree with verification findings, you can file one here.</p>
    </div>
  </div>
</template>
