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
    experience: '5+ years',
    salary: '₦500K – ₦800K/mo',
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
    offer: [
      'Competitive salary with equity options',
      'Remote-first work culture',
      'Health insurance coverage',
      'Learning & development stipend',
      'Flexible working hours',
    ],
  },
  'product-designer': {
    title: 'Product Designer',
    dept: 'Product',
    location: 'Lagos / Remote',
    type: 'Full-time',
    experience: '3+ years',
    salary: '₦400K – ₦650K/mo',
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
    offer: [
      'Competitive salary with equity options',
      'Hybrid work arrangement (Lagos office optional)',
      'Health insurance coverage',
      'Design conference & tools budget',
      'Flexible working hours',
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
  portfolio: '',
  coverLetter: '',
})

const submitted = ref(false)

function handleSubmit() {
  submitted.value = true
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-[#0D0D0D] px-5 lg:px-20 py-12 lg:py-16">
      <div class="max-w-[1440px] mx-auto flex flex-col items-center gap-3">
        <span class="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider">{{ job.dept }}</span>
        <h1 class="font-mono text-2xl lg:text-[36px] font-bold text-white text-center">{{ job.title }}</h1>
        <p class="font-sans text-base text-[#7A7A7A] text-center">{{ job.location }} · {{ job.type }}</p>
        <NuxtLink to="/careers" class="mt-2 font-sans text-[13px] font-medium text-primary hover:underline">
          ← Back to all positions
        </NuxtLink>
      </div>
    </section>

    <!-- Content -->
    <section class="bg-background px-5 lg:px-20 py-10 lg:py-16">
      <div class="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-10">
        <!-- Left Column -->
        <div class="flex-1 flex flex-col gap-10">
          <div class="flex flex-col gap-3">
            <h2 class="font-mono text-lg font-bold text-foreground">About the Role</h2>
            <p class="font-sans text-[15px] text-muted-foreground leading-relaxed">{{ job.about }}</p>
          </div>

          <div class="flex flex-col gap-3">
            <h2 class="font-mono text-lg font-bold text-foreground">Key Responsibilities</h2>
            <ul class="flex flex-col gap-2">
              <li v-for="r in job.responsibilities" :key="r" class="flex items-start gap-3">
                <span class="material-symbols-rounded text-[16px] text-primary mt-0.5">arrow_right</span>
                <span class="font-sans text-[15px] text-foreground">{{ r }}</span>
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-3">
            <h2 class="font-mono text-lg font-bold text-foreground">Requirements</h2>
            <ul class="flex flex-col gap-2">
              <li v-for="r in job.requirements" :key="r" class="flex items-start gap-3">
                <span class="material-symbols-rounded text-[16px] text-primary mt-0.5">check</span>
                <span class="font-sans text-[15px] text-foreground">{{ r }}</span>
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-3">
            <h2 class="font-mono text-lg font-bold text-foreground">Nice to Have</h2>
            <ul class="flex flex-col gap-2">
              <li v-for="r in job.niceToHave" :key="r" class="flex items-start gap-3">
                <span class="material-symbols-rounded text-[16px] text-muted-foreground mt-0.5">add</span>
                <span class="font-sans text-[15px] text-muted-foreground">{{ r }}</span>
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-3">
            <h2 class="font-mono text-lg font-bold text-foreground">What We Offer</h2>
            <ul class="flex flex-col gap-2">
              <li v-for="r in job.offer" :key="r" class="flex items-start gap-3">
                <span class="material-symbols-rounded text-[16px] text-[#004D1A] mt-0.5">check_circle</span>
                <span class="font-sans text-[15px] text-foreground">{{ r }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="w-full lg:w-[340px] flex flex-col gap-5">
          <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
            <h3 class="font-mono text-sm font-bold text-foreground">Job Summary</h3>
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
                <span class="font-sans text-[12px] text-muted-foreground">Experience</span>
                <span class="font-sans text-[12px] font-medium text-foreground">{{ job.experience }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[12px] text-muted-foreground">Salary Range</span>
                <span class="font-mono text-[12px] font-semibold text-foreground">{{ job.salary }}</span>
              </div>
            </div>
          </div>

          <a href="#apply" class="w-full py-3 bg-primary text-[#0D0D0D] font-mono text-sm font-semibold rounded-lg text-center hover:opacity-90 transition-opacity">
            Apply Now
          </a>

          <div class="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
            <h3 class="font-mono text-sm font-bold text-foreground">Share this job</h3>
            <div class="flex gap-2">
              <button class="flex-1 py-2 border border-border rounded-lg font-sans text-[12px] text-foreground hover:bg-background transition-colors">Copy Link</button>
              <button class="flex-1 py-2 border border-border rounded-lg font-sans text-[12px] text-foreground hover:bg-background transition-colors">Email</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Application Form -->
    <section id="apply" class="bg-white px-5 lg:px-20 py-12 lg:py-16 border-t border-border">
      <div class="max-w-[720px] mx-auto flex flex-col gap-8">
        <div class="flex flex-col gap-2">
          <h2 class="font-mono text-xl lg:text-2xl font-bold text-foreground">Apply for this Role</h2>
          <p class="font-sans text-base text-muted-foreground">Fill out the form below. We'll get back to you within 5 business days.</p>
        </div>

        <div v-if="submitted" class="bg-[#DFE6E1] border border-[#004D1A]/20 rounded-xl p-8 text-center flex flex-col gap-3">
          <span class="material-symbols-rounded text-[40px] text-[#004D1A]">check_circle</span>
          <h3 class="font-mono text-lg font-bold text-[#004D1A]">Application Submitted!</h3>
          <p class="font-sans text-sm text-[#004D1A]/80">Thank you for applying. We'll review your application and get back to you within 5 business days.</p>
        </div>

        <form v-else class="flex flex-col gap-5" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Full Name *</label>
              <input v-model="form.fullName" type="text" required class="h-11 px-3 border border-border rounded-lg bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Your full name" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Email Address *</label>
              <input v-model="form.email" type="email" required class="h-11 px-3 border border-border rounded-lg bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="you@email.com" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">Phone Number *</label>
              <input v-model="form.phone" type="tel" required class="h-11 px-3 border border-border rounded-lg bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+234 800 000 0000" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-sans text-[13px] font-medium text-foreground">LinkedIn URL</label>
              <input v-model="form.linkedin" type="url" class="h-11 px-3 border border-border rounded-lg bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="linkedin.com/in/yourname" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Portfolio URL <span class="text-muted-foreground">(optional)</span></label>
            <input v-model="form.portfolio" type="url" class="h-11 px-3 border border-border rounded-lg bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="yourportfolio.com" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Resume / CV *</label>
            <div class="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer">
              <span class="material-symbols-rounded text-[28px] text-muted-foreground">upload_file</span>
              <span class="font-sans text-sm text-foreground font-medium">Click to upload or drag and drop</span>
              <span class="font-sans text-[12px] text-muted-foreground">PDF, DOC up to 5MB</span>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-sans text-[13px] font-medium text-foreground">Cover Letter</label>
            <textarea v-model="form.coverLetter" rows="4" class="px-3 py-2.5 border border-border rounded-lg bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Tell us why you'd be a great fit..." />
          </div>

          <button type="submit" class="w-full sm:w-auto sm:self-start px-8 py-3.5 bg-primary text-[#0D0D0D] font-mono text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Submit Application
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
