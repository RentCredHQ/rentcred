<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const jobs: Record<string, any> = {
  'senior-backend-engineer': {
    title: 'Senior Backend Engineer',
    dept: 'Engineering',
    location: 'Remote (Nigeria)',
    type: 'Full-time',
    salary: '₦500K – ₦800K/mo',
    posted: 'March 2026',
    about: 'We are looking for a Senior Backend Engineer to help build and scale our verification infrastructure. You will work on the core APIs that power tenant screening across Nigeria, processing thousands of verification requests daily.',
    responsibilities: [
      'Design and implement RESTful APIs using NestJS and TypeScript',
      'Build and optimize PostgreSQL database schemas with Prisma ORM',
      'Integrate with Nigerian identity verification services (NIN, BVN)',
      'Implement background job processing with BullMQ and Redis',
      'Collaborate with the product team to define technical requirements',
      'Mentor junior engineers and contribute to engineering culture',
    ],
    requirements: [
      '5+ years of professional backend development experience',
      'Strong proficiency in TypeScript and Node.js',
      'Experience with PostgreSQL and ORM tools (Prisma preferred)',
      'Understanding of RESTful API design and microservices architecture',
      'Familiarity with cloud services (AWS/GCP/Cloudflare)',
    ],
    niceToHave: [
      'Experience with NestJS framework',
      'Knowledge of Nigerian financial/identity APIs (Paystack, VerifyMe)',
      'Prior experience in fintech or proptech',
    ],
  },
  'product-designer': {
    title: 'Product Designer',
    dept: 'Product',
    location: 'Lagos / Remote',
    type: 'Full-time',
    salary: '₦400K – ₦650K/mo',
    posted: 'March 2026',
    about: 'We need a Product Designer to craft intuitive experiences for real estate agents, landlords, and tenants across Nigeria. You will own the design process end-to-end.',
    responsibilities: [
      'Design user interfaces for web and mobile platforms',
      'Conduct user research with Nigerian real estate professionals',
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Maintain and evolve the RentCred design system',
      'Collaborate closely with engineering on implementation',
      'Analyze user behavior data to inform design decisions',
    ],
    requirements: [
      '3+ years of product design experience',
      'Strong portfolio showcasing web/mobile app design',
      'Proficiency in Figma or similar design tools',
      'Understanding of design systems and component libraries',
      'Experience with user research methodologies',
    ],
    niceToHave: [
      'Experience designing for African markets',
      'Basic understanding of HTML/CSS/Vue',
      'Experience in proptech or fintech',
    ],
  },
  'verification-ops-lead': {
    title: 'Verification Operations Lead',
    dept: 'Operations',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '₦350K – ₦550K/mo',
    posted: 'April 2026',
    about: 'Lead the ops team managing tenant verification cases. You will ensure every verification request is processed accurately and on time, building the operational backbone of RentCred.',
    responsibilities: [
      'Manage the daily verification queue and assign cases to team members',
      'Train and mentor field agents on verification protocols',
      'Ensure SLA compliance across all verification tiers',
      'Build and maintain standard operating procedures (SOPs)',
    ],
    requirements: [
      '3+ years of operations or project management experience',
      'Experience with verification or KYC processes',
      'Strong written and verbal communication skills',
    ],
    niceToHave: [
      'Nigerian real estate industry knowledge',
      'Experience with case management tools',
    ],
  },
  'frontend-engineer': {
    title: 'Frontend Engineer',
    dept: 'Engineering',
    location: 'Remote, Nigeria',
    type: 'Full-time',
    salary: '₦400K – ₦700K/mo',
    posted: 'April 2026',
    about: 'Build and maintain the Nuxt 3 frontend that powers the RentCred platform. You will create polished, performant interfaces used by thousands of agents and landlords daily.',
    responsibilities: [
      'Implement new dashboard features and user-facing flows',
      'Optimize frontend performance and loading times',
      'Work with the design team on new product flows',
      'Write component tests to ensure reliability',
    ],
    requirements: [
      '3+ years of experience with Vue.js or Nuxt',
      'Strong proficiency in TypeScript',
      'Experience with Tailwind CSS',
      'REST API integration experience',
    ],
    niceToHave: [
      'Nuxt 3 experience',
      'Fintech or proptech background',
    ],
  },
  'customer-success-manager': {
    title: 'Customer Success Manager',
    dept: 'Growth',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '₦300K – ₦500K/mo',
    posted: 'April 2026',
    about: 'Own the agent onboarding and retention experience at RentCred. You will be the primary point of contact for our growing base of real estate professionals, ensuring they get maximum value from the platform.',
    responsibilities: [
      'Onboard new agents and guide them through the platform',
      'Handle support escalations and resolve issues promptly',
      'Gather product feedback and relay insights to the product team',
      'Drive credit bundle adoption and revenue growth',
    ],
    requirements: [
      '2+ years of customer success or account management experience',
      'Excellent written and verbal communication skills',
      'Experience with CRM tools',
    ],
    niceToHave: [
      'Nigerian real estate knowledge',
      'B2B SaaS experience',
    ],
  },
}

const job = computed(() => {
  return jobs[slug.value] || jobs['senior-backend-engineer']
})

useSeoMeta({ title: () => `${job.value.title} — Careers — RentCred` })

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  coverLetter: '',
  resumeFile: null as File | null,
})

const submitted = ref(false)
const resumeFileName = ref('')

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    form.resumeFile = target.files[0]
    resumeFileName.value = target.files[0].name
  }
}

function handleSubmit() {
  submitted.value = true
}
</script>

<template>
  <div>
    <!-- HERO (dark) -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <NuxtLink to="/careers" class="inline-flex items-center gap-1.5 font-sans text-[13px] text-[#7A7A7A] hover:text-white transition-colors mb-8">
          <span>&larr;</span>
          <span>Back to all positions</span>
        </NuxtLink>
        <span class="block font-mono text-[11px] font-semibold text-[#FF8400] uppercase tracking-wider mb-4">{{ job.dept }}</span>
        <h1 class="font-mono text-2xl sm:text-3xl lg:text-[40px] font-semibold text-white mb-5">{{ job.title }}</h1>
        <div class="flex flex-wrap items-center gap-2 text-[13px] text-[#7A7A7A]">
          <span class="font-sans">{{ job.location }}</span>
          <span>&middot;</span>
          <span class="font-sans">{{ job.type }}</span>
          <span>&middot;</span>
          <span class="font-sans">{{ job.salary }}</span>
        </div>
      </div>
    </section>

    <!-- JOB DETAILS + SIDEBAR (light) -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <!-- Left: Job Description -->
          <div class="flex-1 flex flex-col gap-10">
            <!-- About -->
            <div>
              <h3 class="font-mono text-lg font-semibold text-foreground mb-4">About the Role</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">{{ job.about }}</p>
            </div>

            <!-- Responsibilities -->
            <div>
              <h3 class="font-mono text-lg font-semibold text-foreground mb-4">Responsibilities</h3>
              <ul class="flex flex-col gap-2.5">
                <li v-for="item in job.responsibilities" :key="item" class="font-sans text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span class="text-[#FF8400] mt-0.5">&#8226;</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Requirements -->
            <div>
              <h3 class="font-mono text-lg font-semibold text-foreground mb-4">Requirements</h3>
              <ul class="flex flex-col gap-2.5">
                <li v-for="item in job.requirements" :key="item" class="font-sans text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span class="text-[#FF8400] mt-0.5">&#8226;</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Nice to Have -->
            <div>
              <h3 class="font-mono text-lg font-semibold text-foreground mb-4">Nice to Have</h3>
              <ul class="flex flex-col gap-2.5">
                <li v-for="item in job.niceToHave" :key="item" class="font-sans text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span class="text-[#FF8400] mt-0.5">&#8226;</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right: Sidebar -->
          <div class="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-24 self-start flex flex-col gap-5">
            <!-- Job Summary Card -->
            <div class="bg-card border border-border p-6 flex flex-col gap-4">
              <h3 class="font-mono text-sm font-semibold text-foreground">Job Summary</h3>
              <div class="flex flex-col gap-3">
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Department</span>
                  <span class="font-sans text-[12px] font-medium text-foreground">{{ job.dept }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Location</span>
                  <span class="font-sans text-[12px] font-medium text-foreground">{{ job.location }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Type</span>
                  <span class="font-sans text-[12px] font-medium text-foreground">{{ job.type }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Salary</span>
                  <span class="font-mono text-[12px] font-semibold text-foreground">{{ job.salary }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-sans text-[12px] text-muted-foreground">Posted</span>
                  <span class="font-sans text-[12px] font-medium text-foreground">{{ job.posted }}</span>
                </div>
              </div>
            </div>

            <!-- What We Offer Card -->
            <div class="bg-card border border-border p-6 flex flex-col gap-3">
              <h3 class="font-mono text-sm font-semibold text-foreground mb-1">What We Offer</h3>
              <div class="flex items-start gap-2.5">
                <svg class="w-4 h-4 mt-0.5 text-[#FF8400] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                <span class="font-sans text-sm text-muted-foreground">Competitive salary</span>
              </div>
              <div class="flex items-start gap-2.5">
                <svg class="w-4 h-4 mt-0.5 text-[#FF8400] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="font-sans text-sm text-muted-foreground">Remote-friendly</span>
              </div>
              <div class="flex items-start gap-2.5">
                <svg class="w-4 h-4 mt-0.5 text-[#FF8400] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span class="font-sans text-sm text-muted-foreground">Health coverage</span>
              </div>
              <div class="flex items-start gap-2.5">
                <svg class="w-4 h-4 mt-0.5 text-[#FF8400] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span class="font-sans text-sm text-muted-foreground">Learning budget</span>
              </div>
            </div>

            <!-- Apply Now Button -->
            <a href="#apply" class="block w-full bg-[#FF8400] text-[#0D0D0D] font-semibold py-3.5 text-center text-sm hover:bg-[#E67700] transition-colors">
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- APPLICATION FORM (dark) -->
    <section id="apply" class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="max-w-[720px]">
          <span class="block font-mono text-[11px] font-semibold text-[#FF8400] uppercase tracking-wider mb-4">APPLY NOW</span>
          <h2 class="font-mono text-2xl sm:text-3xl lg:text-[40px] font-semibold text-white mb-3">Apply for {{ job.title }}</h2>
          <p class="font-sans text-sm text-[#7A7A7A] mb-10">Fill out the form below. We'll get back to you within 5 business days.</p>

          <div v-if="submitted" class="border border-[#FF8400]/30 p-8 text-center flex flex-col gap-3">
            <span class="text-[#FF8400] text-3xl">&#10003;</span>
            <h3 class="font-mono text-lg font-semibold text-white">Application Submitted!</h3>
            <p class="font-sans text-sm text-[#7A7A7A]">Thank you for applying. We'll review your application and get back to you within 5 business days.</p>
          </div>

          <form v-else class="flex flex-col gap-5" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-white">Full Name <span class="text-[#FF8400]">*</span></label>
              <input v-model="form.fullName" type="text" required class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-[#FF8400] transition-colors" placeholder="Your full name" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-white">Email Address <span class="text-[#FF8400]">*</span></label>
              <input v-model="form.email" type="email" required class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-[#FF8400] transition-colors" placeholder="you@email.com" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-white">Phone Number <span class="text-[#FF8400]">*</span></label>
              <input v-model="form.phone" type="tel" required class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-[#FF8400] transition-colors" placeholder="+234 800 000 0000" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-white">LinkedIn URL <span class="text-[#7A7A7A] text-[11px]">(optional)</span></label>
              <input v-model="form.linkedin" type="url" class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-[#FF8400] transition-colors" placeholder="linkedin.com/in/yourname" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-white">Cover Letter</label>
              <textarea v-model="form.coverLetter" rows="5" class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-[#FF8400] transition-colors resize-none" placeholder="Tell us why you'd be a great fit..." />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-white">Resume / CV <span class="text-[#FF8400]">*</span></label>
              <label class="border border-dashed border-[#3A3A3A] p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-[#FF8400]/40 transition-colors">
                <svg class="w-7 h-7 text-[#7A7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                <span v-if="resumeFileName" class="font-sans text-sm text-white font-medium">{{ resumeFileName }}</span>
                <template v-else>
                  <span class="font-sans text-sm text-white font-medium">Click to upload or drag and drop</span>
                  <span class="font-sans text-[12px] text-[#7A7A7A]">PDF, DOC up to 5MB</span>
                </template>
                <input type="file" accept=".pdf,.doc,.docx" class="hidden" @change="handleFileChange" />
              </label>
            </div>

            <button type="submit" class="w-full sm:w-auto sm:self-start px-8 py-3.5 bg-[#FF8400] text-[#0D0D0D] font-semibold text-sm hover:bg-[#E67700] transition-colors mt-2">
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
