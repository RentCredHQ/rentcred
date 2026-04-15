<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Careers — RentCred',
  description: 'Join the team building trust in Nigerian real estate. See open positions at RentCred.',
})

const benefits = [
  { icon: 'rocket_launch', title: 'Mission-Driven', desc: 'We are solving real problems in Africa\'s housing market.' },
  { icon: 'laptop_mac', title: 'Remote-First', desc: 'Work from anywhere in Nigeria or globally. We trust results over presence.' },
  { icon: 'payments', title: 'Competitive Pay', desc: 'Above-market compensation with equity options for early employees.' },
  { icon: 'trending_up', title: 'Growth Culture', desc: 'Small team, big impact. Ship features used by thousands of agents daily.' },
]

const jobs = [
  { slug: 'senior-backend-engineer', title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote (Nigeria)' },
  { slug: 'product-designer', title: 'Product Designer', dept: 'Product', location: 'Lagos / Remote' },
  { slug: 'verification-operations-lead', title: 'Verification Operations Lead', dept: 'Operations', location: 'Lagos' },
  { slug: 'frontend-engineer', title: 'Frontend Engineer (Nuxt/Vue)', dept: 'Engineering', location: 'Remote (Nigeria)' },
  { slug: 'customer-success-manager', title: 'Customer Success Manager', dept: 'Growth', location: 'Lagos' },
]

const culturePoints = [
  'Transparent communication across all levels',
  'Weekly team syncs and monthly retrospectives',
  'Learning stipend for courses and conferences',
  'Health insurance for all team members',
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-24 flex flex-col items-center gap-6">
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-[40px] font-bold text-white text-center leading-tight max-w-[800px]">
          Join the Team Building Trust in Nigerian Real Estate
        </h1>
        <p class="font-sans text-base lg:text-lg text-[#7A7A7A] text-center max-w-[600px]">
          We are building verification infrastructure for Africa's largest rental market. Join us.
        </p>
        <div class="w-[60px] h-0.5 bg-[#FF8400] opacity-40" />
      </div>
    </section>

    <!-- Why RentCred Section -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-12 lg:py-16 flex flex-col gap-10">
        <div class="flex flex-col gap-2">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">WHY RENTCRED</span>
          <h2 class="font-mono text-xl lg:text-[28px] font-bold text-foreground">Why Work With Us</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="b in benefits" :key="b.title" class="bg-white border border-border rounded-xl p-6 lg:p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[28px] text-primary">{{ b.icon }}</span>
            <span class="font-mono text-base font-semibold text-foreground">{{ b.title }}</span>
            <p class="font-sans text-sm text-muted-foreground leading-relaxed">{{ b.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Open Positions Section -->
    <section class="bg-white">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-20 flex flex-col gap-10">
        <div class="flex flex-col gap-2">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">OPEN POSITIONS</span>
          <h2 class="font-mono text-xl lg:text-[28px] font-bold text-foreground">Current Openings</h2>
          <p class="font-sans text-base text-muted-foreground">We are hiring across engineering, product, and operations.</p>
        </div>
        <div class="flex flex-col gap-3">
          <div
            v-for="job in jobs"
            :key="job.title"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-border rounded-lg p-5 lg:px-6"
          >
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[15px] font-semibold text-foreground">{{ job.title }}</span>
              <span class="font-sans text-[13px] text-muted-foreground">{{ job.dept }} · {{ job.location }}</span>
            </div>
            <NuxtLink :to="`/careers/${job.slug}`" class="self-start sm:self-center px-5 py-2 bg-primary text-[#0D0D0D] font-mono text-[13px] font-semibold rounded-md hover:opacity-90 transition-opacity">
              Apply
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Culture Section -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-12 lg:py-16 flex flex-col lg:flex-row items-center gap-12">
        <!-- Image -->
        <div class="w-full lg:w-1/2">
          <div class="aspect-[3/2] rounded-xl bg-[#E7E8E5] overflow-hidden flex items-center justify-center">
            <span class="font-sans text-sm text-muted-foreground">Culture photo</span>
          </div>
        </div>
        <!-- Text -->
        <div class="w-full lg:w-1/2 flex flex-col gap-4">
          <span class="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">OUR CULTURE</span>
          <h2 class="font-mono text-xl lg:text-[28px] font-bold text-foreground">Building Together</h2>
          <p class="font-sans text-base text-muted-foreground leading-relaxed">
            At RentCred, we believe the best products are built by diverse teams who challenge each other. We are a remote-first company rooted in Lagos, building verification infrastructure that serves millions across Nigeria. Every voice matters, and every contribution shapes the future of African real estate.
          </p>
          <ul class="flex flex-col gap-2.5 mt-2">
            <li v-for="point in culturePoints" :key="point" class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[18px] text-primary">check_circle</span>
              <span class="font-sans text-sm text-foreground">{{ point }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-20 flex flex-col items-center gap-6">
        <h2 class="font-mono text-2xl lg:text-[32px] font-bold text-white text-center">Don't See Your Role?</h2>
        <p class="font-sans text-base text-[#7A7A7A] text-center max-w-[600px]">
          We're always looking for talented people who are passionate about building for Africa. Send us your CV and tell us how you'd contribute.
        </p>
        <a href="mailto:careers@rentcred.ng" class="mt-2 px-8 py-3.5 bg-[#FF8400] text-[#0D0D0D] font-mono text-sm font-semibold rounded-md hover:opacity-90 transition-opacity">
          Send Your CV
        </a>
      </div>
    </section>
  </div>
</template>
