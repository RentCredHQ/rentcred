<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'KYB Verification — RentCred' })

const { getKybApplications } = useKyb()
const { uploadFile } = useUpload()
const authStore = useAuthStore()

const currentStep = ref(2)
const steps = ref([
  { label: 'Company Info', status: 'completed' },
  { label: 'Documents', status: 'active' },
  { label: 'Review', status: 'pending' },
])

const documents = ref<any[]>([])

const verificationStatus = ref({
  overall: authStore.user?.kybStatus ?? 'Pending',
  statusBg: 'bg-[#DFDFE6]',
  statusText: 'text-[#000066]',
  submitted: '',
  eta: '',
})

const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getKybApplications() as any
    if (res) {
      const app = Array.isArray(res) ? res[0] : res
      if (app) {
        verificationStatus.value = {
          overall: app.status ?? authStore.user?.kybStatus ?? 'Pending',
          statusBg: app.status === 'Approved' ? 'bg-[#DFE6E1]' : 'bg-[#DFDFE6]',
          statusText: app.status === 'Approved' ? 'text-[#004D1A]' : 'text-[#000066]',
          submitted: app.submittedAt ?? '',
          eta: app.eta ?? '',
        }
        if (app.documents) documents.value = app.documents
        if (app.steps) steps.value = app.steps
        if (app.currentStep) currentStep.value = app.currentStep
      }
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

async function handleUpload(doc: any) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.jpg,.jpeg,.png'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
      const result = await uploadFile(file, 'kyb') as any
      doc.file = result?.fileName ?? file.name
      doc.status = 'Uploaded'
      doc.statusBg = 'bg-[#DFE6E1]'
      doc.statusText = 'text-[#004D1A]'
    } catch { /* empty */ }
  }
  input.click()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/settings" class="lg:hidden">
        <span class="material-symbols-rounded text-[20px] text-foreground">arrow_back</span>
      </NuxtLink>
      <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">KYB Business Verification</h1>
    </div>

    <!-- Stepper -->
    <div class="flex items-center gap-0">
      <template v-for="(step, i) in steps" :key="step.label">
        <div class="flex items-center gap-2.5">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold"
            :class="step.status === 'completed' ? 'bg-[#DFE6E1] text-[#004D1A]' : step.status === 'active' ? 'bg-primary text-white' : 'bg-[#E7E8E5] text-muted-foreground'"
          >
            <span v-if="step.status === 'completed'" class="material-symbols-rounded text-[16px]">check</span>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="font-sans text-[13px]" :class="step.status === 'pending' ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground'">{{ step.label }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-3" :class="step.status === 'completed' ? 'bg-[#DFE6E1]' : 'bg-border'" />
      </template>
    </div>

    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Document Upload -->
      <div class="flex-1">
        <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-5">
          <h2 class="font-mono text-base font-semibold text-foreground">Required Documents</h2>
          <p class="font-sans text-[13px] text-muted-foreground">Upload the following documents to verify your business identity.</p>

          <div class="flex flex-col gap-4">
            <div v-for="doc in documents" :key="doc.name" class="flex items-center justify-between py-3.5 border-b border-border last:border-0">
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <span class="font-sans text-sm font-medium text-foreground">{{ doc.name }}</span>
                <span class="font-sans text-[12px] text-muted-foreground">{{ doc.desc }}</span>
                <span v-if="doc.file" class="font-mono text-[11px] text-muted-foreground mt-1">{{ doc.file }}</span>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium" :class="[doc.statusBg, doc.statusText]">{{ doc.status }}</span>
                <button v-if="!doc.file" @click="handleUpload(doc)" class="px-3 py-1.5 bg-foreground text-white font-mono text-[11px] font-medium hover:opacity-90 transition-opacity">Upload</button>
                <span v-else class="material-symbols-rounded text-[18px] text-muted-foreground hover:text-foreground cursor-pointer">download</span>
              </div>
            </div>
          </div>

          <button class="w-fit px-5 py-2.5 bg-primary text-foreground font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">Continue to Review</button>
        </div>
      </div>

      <!-- Right: Status + Info -->
      <div class="w-full lg:w-[320px] flex flex-col gap-6">
        <!-- Status Card -->
        <div class="bg-white border border-border rounded-lg p-6 flex flex-col gap-5">
          <h2 class="font-mono text-base font-semibold text-foreground">Verification Status</h2>
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="font-sans text-[13px] text-muted-foreground">Status</span>
              <span class="inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium" :class="[verificationStatus.statusBg, verificationStatus.statusText]">{{ verificationStatus.overall }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-sans text-[13px] text-muted-foreground">Submitted</span>
              <span class="font-sans text-[13px] font-medium text-foreground">{{ verificationStatus.submitted }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-sans text-[13px] text-muted-foreground">Est. Completion</span>
              <span class="font-sans text-[13px] font-medium text-foreground">{{ verificationStatus.eta }}</span>
            </div>
          </div>
        </div>

        <!-- Company Info Card -->
        <div class="bg-white border border-border rounded-lg p-6 flex flex-col gap-4">
          <h2 class="font-mono text-base font-semibold text-foreground">Company Info</h2>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY</span>
            <span class="font-sans text-sm text-foreground">Ogundimu Properties Ltd</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RC NUMBER</span>
            <span class="font-sans text-sm text-foreground">RC-2847561</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">ADDRESS</span>
            <span class="font-sans text-sm text-foreground">14 Admiralty Way, Lekki Phase 1</span>
          </div>
        </div>

        <!-- Help Card -->
        <div class="bg-[#DFDFE6] rounded-lg p-5 flex flex-col gap-3">
          <span class="font-mono text-sm font-semibold text-foreground">Need help?</span>
          <span class="font-sans text-[13px] text-muted-foreground leading-[1.4]">Contact our KYB team for assistance with document requirements or verification status.</span>
          <button class="w-fit px-4 py-2 bg-foreground text-white font-mono text-[12px] font-medium hover:opacity-90 transition-opacity">Contact Support</button>
        </div>
      </div>
    </div>
  </div>
</template>
