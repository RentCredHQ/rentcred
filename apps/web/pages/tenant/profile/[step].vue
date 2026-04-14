<script setup lang="ts">
import { NIGERIAN_STATES } from '@rentcred/shared'

definePageMeta({ layout: 'tenant' })
useSeoMeta({ title: 'Complete Profile — RentCred' })

const route = useRoute()
const router = useRouter()
const currentStep = computed(() => Number(route.params.step) || 1)
const isLoading = ref(false)
const error = ref<string | null>(null)
const showCompletion = ref(false)

const { getProfile, updatePersonalInfo, updateEmployment, updateReferences, updateDocuments, recordConsent } = useTenantProfile()
const { uploading, progress, error: uploadError, uploadFile } = useUpload()

// Step 1: Personal Info
const step1 = reactive({
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  stateOfOrigin: '',
  currentAddress: '',
  ninNumber: '',
})

// Step 2: Employment
const step2 = reactive({
  employerName: '',
  employerAddress: '',
  jobTitle: '',
  monthlyIncome: null as number | null,
  employmentType: '',
})

// Step 3: References
const step3 = reactive({
  ref1Name: '',
  ref1Phone: '',
  ref1Relationship: '',
  ref2Name: '',
  ref2Phone: '',
  ref2Relationship: '',
})

// Step 4: Documents
const step4 = reactive({
  idDocumentUrl: '',
  proofOfIncomeUrl: '',
  utilityBillUrl: '',
})

// Step 5: Consent
const consentAgreed = ref(false)

// Pre-populate from existing profile
onMounted(async () => {
  try {
    const profile = await getProfile()
    if (profile) {
      // Step 1
      if (profile.dateOfBirth) step1.dateOfBirth = new Date(profile.dateOfBirth).toISOString().split('T')[0]
      step1.gender = profile.gender || ''
      step1.maritalStatus = profile.maritalStatus || ''
      step1.stateOfOrigin = profile.stateOfOrigin || ''
      step1.currentAddress = profile.currentAddress || ''
      step1.ninNumber = profile.ninNumber || ''
      // Step 2
      step2.employerName = profile.employerName || ''
      step2.employerAddress = profile.employerAddress || ''
      step2.jobTitle = profile.jobTitle || ''
      step2.monthlyIncome = profile.monthlyIncome || null
      step2.employmentType = profile.employmentType || ''
      // Step 3
      step3.ref1Name = profile.ref1Name || ''
      step3.ref1Phone = profile.ref1Phone || ''
      step3.ref1Relationship = profile.ref1Relationship || ''
      step3.ref2Name = profile.ref2Name || ''
      step3.ref2Phone = profile.ref2Phone || ''
      step3.ref2Relationship = profile.ref2Relationship || ''
      // Step 4
      step4.idDocumentUrl = profile.idDocumentUrl || ''
      step4.proofOfIncomeUrl = profile.proofOfIncomeUrl || ''
      step4.utilityBillUrl = profile.utilityBillUrl || ''
    }
  } catch {
    // Profile may not exist yet
  }
})

function nextStep() {
  if (currentStep.value < 5) router.push(`/tenant/profile/${currentStep.value + 1}`)
}

function prevStep() {
  if (currentStep.value > 1) router.push(`/tenant/profile/${currentStep.value - 1}`)
}

async function handleDocUpload(event: Event, field: 'idDocumentUrl' | 'proofOfIncomeUrl' | 'utilityBillUrl') {
  const input = event.target as HTMLInputElement
  if (!input.files?.[0]) return
  try {
    const result = await uploadFile(input.files[0], 'tenant-documents')
    step4[field] = result.publicUrl
  } catch {
    // Error set by useUpload
  }
  input.value = ''
}

async function saveStep() {
  isLoading.value = true
  error.value = null
  try {
    if (currentStep.value === 1) {
      await updatePersonalInfo(step1)
    } else if (currentStep.value === 2) {
      await updateEmployment({ ...step2, monthlyIncome: step2.monthlyIncome || undefined })
    } else if (currentStep.value === 3) {
      await updateReferences(step3)
    } else if (currentStep.value === 4) {
      await updateDocuments(step4)
    } else if (currentStep.value === 5) {
      await recordConsent()
      showCompletion.value = true
      return
    }
    nextStep()
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Failed to save. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Completion Screen -->
    <div v-if="showCompletion" class="flex items-center justify-center min-h-[60vh]">
      <div class="bg-white border border-border rounded-xl p-8 lg:p-10 w-full max-w-[560px] flex flex-col items-center gap-5 text-center">
        <div class="w-20 h-20 rounded-full bg-[#DFE6E1] flex items-center justify-center">
          <span class="material-symbols-rounded text-[40px] text-[#004D1A]">check</span>
        </div>
        <h1 class="font-mono text-2xl font-bold text-foreground">Profile Complete</h1>
        <p class="font-sans text-sm text-muted-foreground max-w-[440px]" style="line-height: 1.5">Your profile is ready for verification. You'll be notified when an agent submits you for tenant screening.</p>
        <div class="w-full flex flex-col gap-2">
          <NuxtLink to="/tenant" class="w-full py-2.5 bg-primary text-foreground font-sans text-sm font-semibold text-center hover:opacity-90 transition-opacity">Go to Dashboard</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Form Steps -->
    <div v-else class="w-full max-w-[600px] flex flex-col gap-6">
      <!-- Step Indicator -->
      <div class="flex items-center justify-between mb-2">
        <span class="font-sans text-[13px] font-medium text-foreground">Complete Your Profile</span>
        <div class="flex items-center gap-2">
          <div class="flex gap-1">
            <div v-for="i in 5" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentStep ? 'bg-primary' : 'bg-border'" />
          </div>
          <span class="font-sans text-[13px] text-muted-foreground">Step {{ currentStep }} of 5</span>
        </div>
      </div>

      <!-- Step 1: Personal Info -->
      <div v-if="currentStep === 1" class="bg-white border border-border rounded-lg p-6 lg:p-8 flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Personal Information</h2>
          <p class="font-sans text-sm text-muted-foreground">Tell us about yourself</p>
        </div>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Date of Birth</label>
              <input v-model="step1.dateOfBirth" type="date" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Gender</label>
              <select v-model="step1.gender" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Marital Status</label>
              <select v-model="step1.maritalStatus" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="" disabled>Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">State of Origin</label>
              <select v-model="step1.stateOfOrigin" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="" disabled>Select state</option>
                <option v-for="s in NIGERIAN_STATES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Current Address</label>
            <input v-model="step1.currentAddress" type="text" placeholder="Enter your current address" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">NIN Number</label>
            <input v-model="step1.ninNumber" type="text" placeholder="11-digit NIN" maxlength="11" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>
      </div>

      <!-- Step 2: Employment -->
      <div v-if="currentStep === 2" class="bg-white border border-border rounded-lg p-6 lg:p-8 flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Employment Details</h2>
          <p class="font-sans text-sm text-muted-foreground">Your current employment information</p>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Employer Name</label>
            <input v-model="step2.employerName" type="text" placeholder="Company or business name" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Employer Address</label>
            <input v-model="step2.employerAddress" type="text" placeholder="Office address" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Job Title</label>
              <input v-model="step2.jobTitle" type="text" placeholder="Your role" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Employment Type</label>
              <select v-model="step2.employmentType" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="" disabled>Select</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="self_employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Monthly Income (₦)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-sm text-muted-foreground">₦</span>
              <input v-model.number="step2.monthlyIncome" type="number" placeholder="e.g. 500000" class="w-full h-[42px] pl-8 pr-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: References -->
      <div v-if="currentStep === 3" class="bg-white border border-border rounded-lg p-6 lg:p-8 flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">References</h2>
          <p class="font-sans text-sm text-muted-foreground">Provide two personal or professional references</p>
        </div>

        <!-- Reference 1 -->
        <div class="flex flex-col gap-4">
          <span class="font-mono text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Reference 1</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Full Name</label>
              <input v-model="step3.ref1Name" type="text" placeholder="Reference name" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Relationship</label>
              <input v-model="step3.ref1Relationship" type="text" placeholder="e.g. Colleague, Friend" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Phone Number</label>
            <input v-model="step3.ref1Phone" type="tel" placeholder="+234 800 000 0000" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        <hr class="border-border" />

        <!-- Reference 2 -->
        <div class="flex flex-col gap-4">
          <span class="font-mono text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Reference 2</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Full Name</label>
              <input v-model="step3.ref2Name" type="text" placeholder="Reference name" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Relationship</label>
              <input v-model="step3.ref2Relationship" type="text" placeholder="e.g. Colleague, Friend" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Phone Number</label>
            <input v-model="step3.ref2Phone" type="tel" placeholder="+234 800 000 0000" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>
      </div>

      <!-- Step 4: Documents -->
      <div v-if="currentStep === 4" class="bg-white border border-border rounded-lg p-6 lg:p-8 flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Upload Documents</h2>
          <p class="font-sans text-sm text-muted-foreground">Upload your verification documents</p>
        </div>

        <div class="flex flex-col gap-5">
          <!-- ID Document -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">ID Document <span class="text-error">*</span></label>
            <div v-if="step4.idDocumentUrl" class="flex items-center gap-3 p-3 bg-[#DFE6E1] rounded-lg">
              <span class="material-symbols-rounded text-[20px] text-[#004D1A]">check_circle</span>
              <span class="font-sans text-sm text-[#004D1A] flex-1">Document uploaded</span>
              <button @click="step4.idDocumentUrl = ''" class="font-sans text-[13px] text-muted-foreground hover:text-foreground">Replace</button>
            </div>
            <label v-else class="w-full py-6 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-[#FFF8F0] transition-colors" :class="{ 'opacity-50 pointer-events-none': uploading }">
              <span class="material-symbols-rounded text-[28px] text-muted-foreground">upload_file</span>
              <span class="font-sans text-sm text-muted-foreground">{{ uploading ? `Uploading... ${progress}%` : 'Click to upload (JPG, PNG, PDF)' }}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden" @change="handleDocUpload($event, 'idDocumentUrl')" />
            </label>
          </div>

          <!-- Proof of Income -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Proof of Income <span class="text-muted-foreground font-normal">(optional)</span></label>
            <div v-if="step4.proofOfIncomeUrl" class="flex items-center gap-3 p-3 bg-[#DFE6E1] rounded-lg">
              <span class="material-symbols-rounded text-[20px] text-[#004D1A]">check_circle</span>
              <span class="font-sans text-sm text-[#004D1A] flex-1">Document uploaded</span>
              <button @click="step4.proofOfIncomeUrl = ''" class="font-sans text-[13px] text-muted-foreground hover:text-foreground">Replace</button>
            </div>
            <label v-else class="w-full py-6 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-[#FFF8F0] transition-colors" :class="{ 'opacity-50 pointer-events-none': uploading }">
              <span class="material-symbols-rounded text-[28px] text-muted-foreground">upload_file</span>
              <span class="font-sans text-sm text-muted-foreground">{{ uploading ? `Uploading... ${progress}%` : 'Click to upload' }}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden" @change="handleDocUpload($event, 'proofOfIncomeUrl')" />
            </label>
          </div>

          <!-- Utility Bill -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Utility Bill <span class="text-muted-foreground font-normal">(optional)</span></label>
            <div v-if="step4.utilityBillUrl" class="flex items-center gap-3 p-3 bg-[#DFE6E1] rounded-lg">
              <span class="material-symbols-rounded text-[20px] text-[#004D1A]">check_circle</span>
              <span class="font-sans text-sm text-[#004D1A] flex-1">Document uploaded</span>
              <button @click="step4.utilityBillUrl = ''" class="font-sans text-[13px] text-muted-foreground hover:text-foreground">Replace</button>
            </div>
            <label v-else class="w-full py-6 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-[#FFF8F0] transition-colors" :class="{ 'opacity-50 pointer-events-none': uploading }">
              <span class="material-symbols-rounded text-[28px] text-muted-foreground">upload_file</span>
              <span class="font-sans text-sm text-muted-foreground">{{ uploading ? `Uploading... ${progress}%` : 'Click to upload' }}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="hidden" @change="handleDocUpload($event, 'utilityBillUrl')" />
            </label>
          </div>

          <p v-if="uploadError" class="font-sans text-[13px] text-error">{{ uploadError }}</p>
        </div>
      </div>

      <!-- Step 5: Consent -->
      <div v-if="currentStep === 5" class="bg-white border border-border rounded-lg p-6 lg:p-8 flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">NDPR Consent</h2>
          <p class="font-sans text-sm text-muted-foreground">Review and accept data processing terms</p>
        </div>

        <div class="bg-background border border-border rounded-lg p-4 max-h-[300px] overflow-y-auto">
          <p class="font-sans text-sm text-foreground leading-relaxed">
            In accordance with the Nigeria Data Protection Regulation (NDPR), I hereby consent to RentCred collecting, processing, and storing my personal data for the purpose of tenant verification. This includes my identity documents, employment information, references, and any other data provided during the verification process.
          </p>
          <p class="font-sans text-sm text-foreground leading-relaxed mt-3">
            I understand that my data will be shared with authorized agents and landlords as part of the verification report, and that I may request deletion of my data at any time by contacting support.
          </p>
          <p class="font-sans text-sm text-foreground leading-relaxed mt-3">
            For full details, please review our <NuxtLink to="/ndpr" target="_blank" class="text-primary hover:underline">NDPR Privacy Policy</NuxtLink>.
          </p>
        </div>

        <label class="flex items-start gap-3 cursor-pointer">
          <input v-model="consentAgreed" type="checkbox" class="mt-1 w-4 h-4 accent-primary" />
          <span class="font-sans text-sm text-foreground">I have read and agree to the data processing terms above</span>
        </label>
      </div>

      <!-- Error -->
      <div v-if="error" class="flex items-start gap-2.5 bg-red-50 border border-red-200 p-3.5 rounded">
        <span class="material-symbols-rounded text-[18px] text-error mt-0.5">error</span>
        <span class="font-sans text-[13px] text-error">{{ error }}</span>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <button v-if="currentStep > 1" class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors" @click="prevStep">Back</button>
        <div v-else />
        <button
          class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          :disabled="isLoading || (currentStep === 5 && !consentAgreed)"
          @click="saveStep"
        >
          {{ isLoading ? 'Saving...' : currentStep === 5 ? 'Submit Consent' : 'Save & Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>
