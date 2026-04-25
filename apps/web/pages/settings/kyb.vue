<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'KYB Verification — RentCred' })

const { getKybApplications, applyKyb } = useKyb()
const { uploadFile } = useUpload()
const authStore = useAuthStore()
const router = useRouter()

const currentStep = ref(1)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const existingApp = ref<any>(null)

const form = reactive({
  companyName: '',
  rcNumber: '',
  companyAddress: '',
  cacDocumentUrl: '',
  directorIdUrl: '',
  utilityBillUrl: '',
})

const uploads = reactive({
  cac: { name: 'CAC Certificate', desc: 'Certificate of incorporation from CAC', key: 'cacDocumentUrl' as const, uploading: false },
  directorId: { name: 'Director ID', desc: 'Valid government-issued ID of a director', key: 'directorIdUrl' as const, uploading: false },
  utility: { name: 'Utility Bill', desc: 'Recent utility bill showing company address', key: 'utilityBillUrl' as const, uploading: false },
})

const steps = computed(() => [
  { label: 'Company Info', status: currentStep.value > 1 ? 'completed' : currentStep.value === 1 ? 'active' : 'pending' },
  { label: 'Documents', status: currentStep.value > 2 ? 'completed' : currentStep.value === 2 ? 'active' : 'pending' },
  { label: 'Review & Submit', status: currentStep.value === 3 ? 'active' : 'pending' },
])

const canProceedStep1 = computed(() => form.companyName && form.rcNumber && form.companyAddress)
const canProceedStep2 = computed(() => form.cacDocumentUrl && form.directorIdUrl && form.utilityBillUrl)

onMounted(async () => {
  try {
    const res = await getKybApplications() as any
    const apps = res?.data || (Array.isArray(res) ? res : [])
    if (apps.length > 0) {
      existingApp.value = apps[0]
    }
  } catch { /* no existing application */ }
  finally { loading.value = false }
})

async function handleUpload(upload: { name: string; key: 'cacDocumentUrl' | 'directorIdUrl' | 'utilityBillUrl'; uploading: boolean }) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.jpg,.jpeg,.png'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    upload.uploading = true
    try {
      const result = await uploadFile(file, 'kyb-documents') as any
      form[upload.key] = result?.key || result?.publicUrl || file.name
    } catch {
      error.value = `Failed to upload ${upload.name}`
    } finally {
      upload.uploading = false
    }
  }
  input.click()
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await applyKyb({
      companyName: form.companyName,
      rcNumber: form.rcNumber,
      companyAddress: form.companyAddress,
      cacDocumentUrl: form.cacDocumentUrl,
      directorIdUrl: form.directorIdUrl,
      utilityBillUrl: form.utilityBillUrl,
    })
    // Refresh user profile to get updated kybStatus
    await authStore.fetchUser()
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to submit KYB application. Please try again.'
  } finally {
    submitting.value = false
  }
}

function getStatusInfo(status: string) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-[#E9E3D8]', text: 'text-[#804200]' },
    submitted: { label: 'Under Review', bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    under_review: { label: 'Under Review', bg: 'bg-[#DFDFE6]', text: 'text-[#000066]' },
    approved: { label: 'Approved', bg: 'bg-[#DFE6E1]', text: 'text-[#004D1A]' },
    rejected: { label: 'Rejected', bg: 'bg-[#E5DCDA]', text: 'text-[#8C1C00]' },
  }
  return map[status] || map.pending
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/settings" class="lg:hidden">
        <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
      </NuxtLink>
      <h1 class="font-mono text-xl sm:text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">KYB Business Verification</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-rounded text-[28px] text-muted-foreground animate-spin">progress_activity</span>
    </div>

    <!-- Existing Application Status -->
    <template v-else-if="existingApp">
      <div class="bg-white border border-border p-6 flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="font-mono text-base font-semibold text-foreground">Application Status</h2>
          <span class="inline-flex px-3 py-1 text-[12px] font-medium" :class="[getStatusInfo(existingApp.status).bg, getStatusInfo(existingApp.status).text]">
            {{ getStatusInfo(existingApp.status).label }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY</span>
            <span class="font-sans text-sm text-foreground">{{ existingApp.companyName }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RC NUMBER</span>
            <span class="font-sans text-sm text-foreground">{{ existingApp.rcNumber }}</span>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">SUBMITTED</span>
            <span class="font-sans text-sm text-foreground">{{ new Date(existingApp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
          </div>
        </div>

        <div v-if="existingApp.reviewNotes" class="bg-[#E7E8E5] p-4">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">REVIEW NOTES</span>
          <p class="font-sans text-sm text-foreground mt-1">{{ existingApp.reviewNotes }}</p>
        </div>

        <div v-if="existingApp.status === 'rejected'" class="flex flex-col gap-3">
          <p class="font-sans text-sm text-muted-foreground">Your application was rejected. You can submit a new application with updated information.</p>
          <button @click="existingApp = null" class="w-fit px-5 py-2.5 bg-[#FF8400] text-[#0D0D0D] font-sans text-sm font-semibold hover:opacity-90 transition-opacity">
            Submit New Application
          </button>
        </div>
      </div>
    </template>

    <!-- KYB Form -->
    <template v-else>
      <!-- Stepper -->
      <div class="flex items-center gap-0 overflow-x-auto">
        <template v-for="(step, i) in steps" :key="step.label">
          <div class="flex items-center gap-2.5">
            <div
              class="w-7 h-7 flex items-center justify-center text-[12px] font-semibold"
              :class="step.status === 'completed' ? 'bg-[#DFE6E1] text-[#004D1A]' : step.status === 'active' ? 'bg-[#0D0D0D] text-white' : 'bg-[#E7E8E5] text-muted-foreground'"
            >
              <span v-if="step.status === 'completed'" class="material-symbols-rounded text-[16px]">check</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="font-sans text-[13px] whitespace-nowrap" :class="step.status === 'pending' ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground'">{{ step.label }}</span>
          </div>
          <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-3 min-w-[20px]" :class="step.status === 'completed' ? 'bg-[#DFE6E1]' : 'bg-border'" />
        </template>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm font-sans px-4 py-3">
        {{ error }}
      </div>

      <!-- Step 1: Company Info -->
      <div v-if="currentStep === 1" class="bg-white border border-border p-6 sm:p-7 flex flex-col gap-5">
        <div>
          <h2 class="font-mono text-base font-semibold text-foreground">Company Information</h2>
          <p class="font-sans text-[13px] text-muted-foreground mt-1">Enter your registered business details as they appear on your CAC certificate.</p>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-sans font-medium text-foreground mb-2">Company Name</label>
            <input
              v-model="form.companyName"
              type="text"
              placeholder="e.g. Premier Realty Ltd"
              class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-sans font-medium text-foreground mb-2">RC Number</label>
            <input
              v-model="form.rcNumber"
              type="text"
              placeholder="e.g. RC-284819"
              class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-sans font-medium text-foreground mb-2">Company Address</label>
            <input
              v-model="form.companyAddress"
              type="text"
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
              class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button
            @click="currentStep = 2"
            :disabled="!canProceedStep1"
            class="px-6 py-2.5 bg-[#FF8400] text-[#0D0D0D] font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Step 2: Documents -->
      <div v-if="currentStep === 2" class="bg-white border border-border p-6 sm:p-7 flex flex-col gap-5">
        <div>
          <h2 class="font-mono text-base font-semibold text-foreground">Upload Documents</h2>
          <p class="font-sans text-[13px] text-muted-foreground mt-1">Upload the following documents to verify your business identity. Accepted formats: PDF, JPG, PNG.</p>
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="upload in uploads" :key="upload.key" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border last:border-0">
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <span class="font-sans text-sm font-medium text-foreground">{{ upload.name }}</span>
              <span class="font-sans text-[12px] text-muted-foreground">{{ upload.desc }}</span>
              <span v-if="form[upload.key]" class="font-mono text-[11px] text-[#004D1A] mt-1 flex items-center gap-1">
                <span class="material-symbols-rounded text-[14px]">check_circle</span>
                Uploaded
              </span>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <button
                @click="handleUpload(upload)"
                :disabled="upload.uploading"
                class="px-4 py-2 font-sans text-[12px] font-semibold transition-opacity"
                :class="form[upload.key] ? 'border border-border text-foreground hover:bg-surface' : 'bg-[#0D0D0D] text-white hover:opacity-90'"
              >
                <span v-if="upload.uploading" class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-[14px] animate-spin">progress_activity</span>
                  Uploading...
                </span>
                <span v-else>{{ form[upload.key] ? 'Replace' : 'Upload' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between">
          <button
            @click="currentStep = 1"
            class="px-5 py-2.5 border border-border text-foreground font-sans text-sm font-medium hover:bg-surface transition-colors"
          >
            Back
          </button>
          <button
            @click="currentStep = 3"
            :disabled="!canProceedStep2"
            class="px-6 py-2.5 bg-[#FF8400] text-[#0D0D0D] font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Step 3: Review & Submit -->
      <div v-if="currentStep === 3" class="flex flex-col gap-5">
        <div class="bg-white border border-border p-6 sm:p-7 flex flex-col gap-5">
          <div>
            <h2 class="font-mono text-base font-semibold text-foreground">Review Your Application</h2>
            <p class="font-sans text-[13px] text-muted-foreground mt-1">Please review your information before submitting. You won't be able to edit after submission.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY NAME</span>
              <span class="font-sans text-sm text-foreground">{{ form.companyName }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RC NUMBER</span>
              <span class="font-sans text-sm text-foreground">{{ form.rcNumber }}</span>
            </div>
            <div class="flex flex-col gap-1 sm:col-span-2">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY ADDRESS</span>
              <span class="font-sans text-sm text-foreground">{{ form.companyAddress }}</span>
            </div>
          </div>

          <div class="border-t border-border pt-4">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">DOCUMENTS</span>
            <div class="flex flex-col gap-2 mt-2">
              <div v-for="upload in uploads" :key="upload.key" class="flex items-center gap-2">
                <span class="material-symbols-rounded text-[16px] text-[#004D1A]">check_circle</span>
                <span class="font-sans text-sm text-foreground">{{ upload.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between">
          <button
            @click="currentStep = 2"
            class="px-5 py-2.5 border border-border text-foreground font-sans text-sm font-medium hover:bg-surface transition-colors"
          >
            Back
          </button>
          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-[#FF8400] text-[#0D0D0D] font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Help Card -->
    <div class="bg-[#E7E8E5] p-5 flex flex-col gap-3">
      <span class="font-mono text-sm font-semibold text-foreground">Need help?</span>
      <span class="font-sans text-[13px] text-muted-foreground leading-[1.4]">Contact our KYB team for assistance with document requirements or verification status.</span>
      <NuxtLink to="/contact" class="w-fit px-4 py-2 bg-[#0D0D0D] text-white font-sans text-[12px] font-semibold hover:opacity-90 transition-opacity">
        Contact Support
      </NuxtLink>
    </div>
  </div>
</template>
