<script setup lang="ts">
import { PROPERTY_TYPES, PROPERTY_CONDITIONS, NIGERIAN_STATES, NIGERIAN_LGAS } from '@rentcred/shared'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Submit Tenant — RentCred' })

const route = useRoute()
const router = useRouter()

const currentStep = computed(() => Number(route.params.step) || 1)
const isLoading = ref(false)
const showConfirmation = ref(false)
const submitError = ref<string | null>(null)
const createdCaseId = ref('')

// Step 1: Tenant info
const step1 = reactive({
  fullName: '',
  phone: '',
  email: '',
})

// Step 2: Property details
const step2 = reactive({
  propertyAddress: '',
  propertyType: 'Apartment',
  bedrooms: 1,
  annualRent: null as number | null,
  state: '',
  lga: '',
  neighborhood: '',
  landlordName: '',
  landlordPhone: '',
  propertyCondition: '',
  propertyImages: [] as { key: string; publicUrl: string; preview: string }[],
})

// Step 3: Package selection
const selectedPackage = ref('standard')
const useBundleCredit = ref(true)

const packages = [
  { id: 'basic', name: 'Basic Check', price: '₦5,000', checks: 'Identity + Employment', sla: '24 hours' },
  { id: 'standard', name: 'Standard Check', price: '₦12,000', checks: 'Identity + Employment + References', sla: '60 hours' },
  { id: 'premium', name: 'Premium Check', price: '₦25,000', checks: 'Full verification + Field visit', sla: '5 business days' },
]

// LGA filtering based on selected state
const availableLgas = computed(() => {
  if (!step2.state) return []
  return NIGERIAN_LGAS[step2.state] || []
})

watch(() => step2.state, () => {
  step2.lga = ''
})

const isCommercial = computed(() => step2.propertyType === 'Shop/Office Space')
const roomsLabel = computed(() => isCommercial.value ? 'Rooms' : 'Bedrooms')

// Image upload
const { uploading, progress, error: uploadError, uploadFile, validateFile } = useUpload()
const fileInput = ref<HTMLInputElement | null>(null)

async function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  const files = Array.from(input.files)
  const remaining = 5 - step2.propertyImages.length

  if (files.length > remaining) {
    uploadError.value = `You can only add ${remaining} more photo${remaining === 1 ? '' : 's'}`
    return
  }

  for (const file of files) {
    const validationError = validateFile(file)
    if (validationError) {
      uploadError.value = validationError
      continue
    }

    try {
      const preview = URL.createObjectURL(file)
      const result = await uploadFile(file, 'property-images')
      step2.propertyImages.push({ ...result, preview })
    } catch {
      // Error already set by useUpload
    }
  }

  // Reset file input
  if (fileInput.value) fileInput.value.value = ''
}

function removeImage(index: number) {
  const img = step2.propertyImages[index]
  if (img.preview) URL.revokeObjectURL(img.preview)
  step2.propertyImages.splice(index, 1)
}

// Format currency
function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

// Step 4: Review data
const reviewRows = computed(() => [
  { label: 'Tenant', value: step1.fullName, sub: step1.email },
  { label: 'Property', value: step2.propertyAddress, sub: `${step2.propertyType}${step2.bedrooms > 0 ? ` · ${step2.bedrooms} ${isCommercial.value ? 'room' : 'bed'}${step2.bedrooms !== 1 ? 's' : ''}` : ''}` },
  { label: 'Rent', value: step2.annualRent ? `${formatNaira(step2.annualRent)}/yr` : '—' },
  { label: 'Location', value: `${step2.neighborhood}`, sub: `${step2.lga}, ${step2.state}` },
  { label: 'Landlord', value: step2.landlordName, sub: step2.landlordPhone },
  { label: 'Photos', value: step2.propertyImages.length > 0 ? `${step2.propertyImages.length} photo${step2.propertyImages.length !== 1 ? 's' : ''} uploaded` : 'None' },
  { label: 'Package', value: packages.find(p => p.id === selectedPackage.value)?.name || 'Standard Check' },
  { label: 'SLA', value: packages.find(p => p.id === selectedPackage.value)?.sla || '60 hours' },
  { label: 'Payment', value: useBundleCredit.value ? 'Bundle Credit' : packages.find(p => p.id === selectedPackage.value)?.price || '₦12,000', sub: useBundleCredit.value ? '1 credit will be deducted' : undefined },
])

function nextStep() {
  if (currentStep.value < 4) {
    router.push(`/dashboard/submit/${currentStep.value + 1}`)
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    router.push(`/dashboard/submit/${currentStep.value - 1}`)
  }
}

async function handleSubmit() {
  isLoading.value = true
  submitError.value = null

  try {
    const { createSubmission } = useSubmissions()
    const result = await createSubmission({
      tenantName: step1.fullName,
      tenantEmail: step1.email,
      tenantPhone: step1.phone,
      propertyAddress: step2.propertyAddress,
      annualRent: step2.annualRent,
      propertyType: step2.propertyType,
      bedrooms: step2.bedrooms,
      state: step2.state,
      lga: step2.lga,
      neighborhood: step2.neighborhood,
      landlordName: step2.landlordName,
      landlordPhone: step2.landlordPhone,
      propertyCondition: step2.propertyCondition || undefined,
      propertyImages: step2.propertyImages.map(img => img.key),
      consentObtained: true,
    })
    createdCaseId.value = result.data?.id || ''
    showConfirmation.value = true
  } catch (e: any) {
    submitError.value = e.data?.message || e.message || 'Failed to submit. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Confirmation Screen -->
    <div v-if="showConfirmation" class="flex items-center justify-center min-h-[60vh]">
      <div class="bg-white border border-border rounded-xl p-8 lg:p-10 w-full max-w-[560px] flex flex-col items-center gap-5 text-center">
        <div class="w-20 h-20 rounded-full bg-[#DFE6E1] flex items-center justify-center">
          <span class="material-symbols-rounded text-[40px] text-[#004D1A]">check</span>
        </div>
        <h1 class="font-mono text-2xl font-bold text-foreground">Tenant Invite Sent</h1>
        <p class="font-sans text-sm text-muted-foreground max-w-[440px]" style="line-height: 1.5">We securely sent a consent link to {{ step1.fullName }}. Most tenants complete verification within 5-15 minutes.</p>

        <div class="w-full bg-background border border-border rounded-lg p-3 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-[16px] text-[#004D1A]">lock</span>
            <span class="font-sans text-[13px] text-foreground">Invite sent via encrypted SMS and email</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-[16px] text-[#004D1A]">verified_user</span>
            <span class="font-sans text-[13px] text-foreground">NDPR compliant consent capture</span>
          </div>
        </div>

        <hr class="w-full border-border" />

        <div class="w-full flex flex-col gap-2 text-left px-2">
          <div class="flex justify-between">
            <span class="font-sans text-[13px] text-muted-foreground">Case ID</span>
            <span class="font-mono text-[13px] text-foreground">{{ createdCaseId || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-sans text-[13px] text-muted-foreground">Package</span>
            <span class="font-sans text-[13px] text-foreground">{{ packages.find(p => p.id === selectedPackage)?.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-sans text-[13px] text-muted-foreground">Status</span>
            <span class="font-sans text-[13px] text-primary font-medium">Awaiting Tenant</span>
          </div>
        </div>

        <hr class="w-full border-border" />

        <div class="w-full flex flex-col gap-2">
          <NuxtLink to="/dashboard/submit/1" class="w-full py-2.5 bg-primary text-foreground font-sans text-sm font-semibold text-center hover:opacity-90 transition-opacity">Submit Another Tenant</NuxtLink>
          <NuxtLink to="/dashboard/submissions" class="w-full py-2.5 border border-border text-foreground font-sans text-sm font-medium text-center hover:bg-surface transition-colors">View My Submissions</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Form Steps -->
    <div v-else class="flex flex-col items-center">
      <!-- Step Indicator -->
      <div class="w-full max-w-[600px] mb-6">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="font-sans text-[13px] text-muted-foreground">Dashboard</span>
            <span class="font-sans text-[13px] text-muted-foreground">/</span>
            <span class="font-sans text-[13px] font-medium text-foreground">Submit Tenant</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentStep ? 'bg-primary' : 'bg-border'" />
            </div>
            <span class="font-sans text-[13px] text-muted-foreground">Step {{ currentStep }} of 4</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Tenant Information -->
      <div v-if="currentStep === 1" class="bg-white border border-border rounded-lg p-6 lg:p-8 w-full max-w-[600px] flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Tenant Information</h2>
          <p class="font-sans text-sm text-muted-foreground">Enter the tenant details to begin screening</p>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Full Name</label>
            <input v-model="step1.fullName" type="text" placeholder="Enter tenant's full name" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Phone Number</label>
            <input v-model="step1.phone" type="tel" placeholder="+234 800 000 0000" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Email Address</label>
            <input v-model="step1.email" type="email" placeholder="tenant@email.com" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-2">
          <NuxtLink to="/dashboard" class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors">Cancel</NuxtLink>
          <button class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity" @click="nextStep">Continue to Property</button>
        </div>
      </div>

      <!-- Step 2: Property Details -->
      <div v-if="currentStep === 2" class="bg-white border border-border rounded-lg p-6 lg:p-8 w-full max-w-[600px] flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Property Details</h2>
          <p class="font-sans text-sm text-muted-foreground">Describe the property the tenant intends to rent</p>
        </div>

        <div class="flex flex-col gap-4">
          <!-- Property Address -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Property Address</label>
            <input v-model="step2.propertyAddress" type="text" placeholder="e.g. 14 Admiralty Way, Lekki Phase 1" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>

          <!-- Property Type + Bedrooms -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Property Type</label>
              <select v-model="step2.propertyType" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option v-for="type in PROPERTY_TYPES" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div v-if="!isCommercial" class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Bedrooms</label>
              <select v-model.number="step2.bedrooms" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option :value="0">Studio / Self-Contain</option>
                <option v-for="n in 6" :key="n" :value="n">{{ n }} Bedroom{{ n > 1 ? 's' : '' }}</option>
              </select>
            </div>
          </div>

          <!-- Annual Rent -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Annual Rent (₦)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-sm text-muted-foreground">₦</span>
              <input v-model.number="step2.annualRent" type="number" placeholder="e.g. 3500000" class="w-full h-[42px] pl-8 pr-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <!-- State + LGA -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">State</label>
              <select v-model="step2.state" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="" disabled>Select state</option>
                <option v-for="s in NIGERIAN_STATES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">LGA</label>
              <select v-model="step2.lga" :disabled="!step2.state || availableLgas.length === 0" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="" disabled>{{ !step2.state ? 'Select state first' : availableLgas.length === 0 ? 'Enter in neighborhood' : 'Select LGA' }}</option>
                <option v-for="l in availableLgas" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
          </div>

          <!-- Neighborhood -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Neighborhood / Area</label>
            <input v-model="step2.neighborhood" type="text" placeholder="e.g. Ikeja GRA, Lekki Phase 1, Wuse 2" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>

          <!-- Landlord Name + Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Landlord / Property Manager</label>
              <input v-model="step2.landlordName" type="text" placeholder="Full name" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Landlord Phone</label>
              <input v-model="step2.landlordPhone" type="tel" placeholder="+234 800 000 0000" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <!-- Property Condition -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Property Condition <span class="text-muted-foreground font-normal">(optional)</span></label>
            <select v-model="step2.propertyCondition" class="w-full h-[42px] px-3.5 bg-background border border-border text-sm font-sans text-foreground focus:outline-none focus:border-primary transition-colors appearance-none">
              <option value="">— Select —</option>
              <option v-for="c in PROPERTY_CONDITIONS" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <!-- Property Images -->
          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Property Photos <span class="text-muted-foreground font-normal">(optional, max 5)</span></label>

            <!-- Upload area -->
            <button
              v-if="step2.propertyImages.length < 5"
              type="button"
              class="w-full py-6 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-2 hover:border-primary hover:bg-[#FFF8F0] transition-colors"
              :class="{ 'opacity-50 pointer-events-none': uploading }"
              @click="fileInput?.click()"
            >
              <span class="material-symbols-rounded text-[28px] text-muted-foreground">add_a_photo</span>
              <span class="font-sans text-sm text-muted-foreground">
                {{ uploading ? `Uploading... ${progress}%` : 'Click to upload property photos' }}
              </span>
            </button>

            <!-- Progress bar -->
            <div v-if="uploading" class="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${progress}%` }" />
            </div>

            <!-- Error message -->
            <p v-if="uploadError" class="font-sans text-[13px] text-error">{{ uploadError }}</p>

            <!-- Image previews -->
            <div v-if="step2.propertyImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-1">
              <div v-for="(img, i) in step2.propertyImages" :key="img.key" class="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <img :src="img.preview || img.publicUrl" class="w-full h-full object-cover" />
                <button
                  type="button"
                  class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeImage(i)"
                >
                  <span class="material-symbols-rounded text-[14px] text-white">close</span>
                </button>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="hidden"
              @change="handleImageSelect"
            />
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-2">
          <button class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors" @click="prevStep">Back</button>
          <button class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity" @click="nextStep">Continue to Package</button>
        </div>
      </div>

      <!-- Step 3: Select Package -->
      <div v-if="currentStep === 3" class="bg-white border border-border rounded-lg p-6 lg:p-8 w-full max-w-[600px] flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Select Verification Package</h2>
          <p class="font-sans text-sm text-muted-foreground">Choose the level of verification for this tenant</p>
        </div>

        <div class="flex flex-col gap-3">
          <button
            v-for="pkg in packages"
            :key="pkg.id"
            class="flex items-start gap-3 w-full p-4 text-left rounded-lg border transition-all"
            :class="selectedPackage === pkg.id ? 'border-primary border-l-[3px] bg-[#FFF8F0]' : 'border-border hover:border-muted-foreground'"
            @click="selectedPackage = pkg.id"
          >
            <div class="w-[18px] h-[18px] rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center" :class="selectedPackage === pkg.id ? 'border-primary' : 'border-border'">
              <div v-if="selectedPackage === pkg.id" class="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm font-semibold text-foreground">{{ pkg.name }}</span>
                <span class="font-mono text-sm text-primary font-semibold">{{ pkg.price }}</span>
              </div>
              <span class="font-sans text-[13px] text-muted-foreground">{{ pkg.checks }}</span>
              <span class="font-sans text-[12px] text-muted-foreground">SLA: {{ pkg.sla }}</span>
            </div>
          </button>
        </div>

        <!-- Bundle Credit Toggle -->
        <div class="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3">
          <div class="flex items-center gap-2.5">
            <button
              class="w-9 h-5 rounded-full p-0.5 transition-colors"
              :class="useBundleCredit ? 'bg-primary' : 'bg-border'"
              @click="useBundleCredit = !useBundleCredit"
            >
              <div class="w-4 h-4 rounded-full bg-white transition-transform" :class="useBundleCredit ? 'translate-x-4' : ''" />
            </button>
            <span class="font-sans text-sm font-medium text-foreground">Use bundle credit</span>
          </div>
          <span class="font-sans text-[13px] text-muted-foreground">6 credits remaining</span>
        </div>

        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-2">
          <button class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors" @click="prevStep">Back</button>
          <button class="px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity" @click="nextStep">Continue to Review</button>
        </div>
      </div>

      <!-- Step 4: Review & Pay -->
      <div v-if="currentStep === 4" class="bg-white border border-border rounded-lg p-6 lg:p-8 w-full max-w-[600px] flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <h2 class="font-mono text-xl font-bold text-foreground">Review & Pay</h2>
          <p class="font-sans text-sm text-muted-foreground">Confirm details before submitting</p>
        </div>

        <div class="flex flex-col">
          <div v-for="row in reviewRows" :key="row.label" class="flex items-start justify-between py-3 border-b border-border last:border-0">
            <span class="font-sans text-[13px] font-medium text-muted-foreground">{{ row.label }}</span>
            <div class="flex flex-col items-end gap-0.5">
              <span class="font-sans text-[13px] font-medium text-foreground">{{ row.value }}</span>
              <span v-if="row.sub" class="font-sans text-[12px] text-muted-foreground">{{ row.sub }}</span>
            </div>
          </div>
        </div>

        <!-- Property image thumbnails in review -->
        <div v-if="step2.propertyImages.length > 0" class="flex flex-col gap-1.5">
          <span class="font-sans text-[13px] font-medium text-muted-foreground">Property Photos</span>
          <div class="flex gap-2 overflow-x-auto">
            <div v-for="img in step2.propertyImages" :key="img.key" class="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
              <img :src="img.preview || img.publicUrl" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Info Note -->
        <div class="flex items-start gap-2.5 bg-[#DFDFE6] p-3.5 rounded">
          <span class="material-symbols-rounded text-[18px] text-[#000066] mt-0.5">info</span>
          <span class="font-sans text-[13px] text-[#000066]">An invite link will be sent to the tenant via SMS and email to complete their profile.</span>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="flex items-start gap-2.5 bg-red-50 border border-red-200 p-3.5 rounded">
          <span class="material-symbols-rounded text-[18px] text-error mt-0.5">error</span>
          <span class="font-sans text-[13px] text-error">{{ submitError }}</span>
        </div>

        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-2">
          <button class="px-6 py-2.5 border border-border font-sans text-sm font-medium text-foreground hover:bg-surface transition-colors" @click="prevStep">Back</button>
          <button
            class="flex items-center gap-2 px-6 py-2.5 bg-primary font-sans text-sm font-medium text-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <span class="material-symbols-rounded text-[16px]">send</span>
            {{ isLoading ? 'Submitting...' : 'Submit & Send Invite' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
