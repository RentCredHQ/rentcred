<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Careers — RentCred',
  description: 'Join the team building trust in Nigerian real estate. See open positions at RentCred.',
})

const jobs = [
  { slug: 'senior-backend-engineer', title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote (Nigeria)' },
  { slug: 'product-designer', title: 'Product Designer', dept: 'Product', location: 'Lagos / Remote' },
  { slug: 'verification-operations-lead', title: 'Verification Operations Lead', dept: 'Operations', location: 'Lagos' },
  { slug: 'frontend-engineer', title: 'Frontend Engineer (Nuxt/Vue)', dept: 'Engineering', location: 'Remote (Nigeria)' },
  { slug: 'customer-success-manager', title: 'Customer Success Manager', dept: 'Growth', location: 'Lagos' },
]
</script>

<template>
  <div>
    <!-- HERO (dark) -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-6">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">CAREERS</span>
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-semibold text-white text-center leading-tight max-w-[800px]">
          Help us fix how Nigeria rents
        </h1>
        <p class="font-sans text-base lg:text-lg text-[#7A7A7A] text-center max-w-[600px]">
          We're building the verification layer for Africa's largest rental market. Join us.
        </p>
      </div>
    </section>

    <!-- WHY RENTCRED (light) -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-10">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">WHY JOIN US</span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">
            Build something that matters
          </h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          <div class="border border-border p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[28px] text-[#FF8400]">rocket_launch</span>
            <span class="font-mono text-base font-semibold text-foreground">Mission-Driven</span>
            <p class="font-sans text-sm text-muted-foreground leading-relaxed">
              You're not optimizing ad clicks. You're building infrastructure that protects people's homes and livelihoods.
            </p>
          </div>
          <div class="border border-border p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[28px] text-[#FF8400]">trending_up</span>
            <span class="font-mono text-base font-semibold text-foreground">Early Stage, Big Impact</span>
            <p class="font-sans text-sm text-muted-foreground leading-relaxed">
              Small team, real users, live product. Your work ships to production and shapes the product direction.
            </p>
          </div>
          <div class="border border-border p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[28px] text-[#FF8400]">payments</span>
            <span class="font-mono text-base font-semibold text-foreground">Competitive Pay</span>
            <p class="font-sans text-sm text-muted-foreground leading-relaxed">
              Above-market compensation with equity options. We believe in paying for talent, not potential.
            </p>
          </div>
          <div class="border border-border p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[28px] text-[#FF8400]">laptop_mac</span>
            <span class="font-mono text-base font-semibold text-foreground">Remote-Friendly</span>
            <p class="font-sans text-sm text-muted-foreground leading-relaxed">
              Work from anywhere in Nigeria. We care about output, not office hours.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- OPEN POSITIONS (dark) -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-10">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">OPEN ROLES</span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-white">
            Current openings
          </h2>
        </div>
        <div class="flex flex-col gap-3 w-full">
          <div
            v-for="job in jobs"
            :key="job.slug"
            class="bg-[#161616] border border-[#2A2A2A] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div class="flex flex-col gap-1">
              <span class="font-mono text-base font-semibold text-white">{{ job.title }}</span>
              <span class="font-sans text-sm text-[#7A7A7A]">{{ job.dept }} · {{ job.location }}</span>
            </div>
            <NuxtLink
              :to="`/careers/${job.slug}`"
              class="font-mono text-sm font-semibold text-[#FF8400] hover:underline transition-colors self-start sm:self-center"
            >
              View Role →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA (light) -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-6">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">DON'T SEE YOUR ROLE?</span>
        <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">
          We're always looking for great people
        </h2>
        <p class="font-sans text-base text-muted-foreground text-center max-w-[600px]">
          Send us your CV and tell us what you'd build at RentCred. We review every application.
        </p>
        <a
          href="mailto:careers@rentcred.ng"
          class="mt-2 bg-[#FF8400] text-[#0D0D0D] font-semibold px-8 py-3.5 hover:bg-[#E67700] transition-colors font-mono text-sm"
        >
          Send Your CV
        </a>
      </div>
    </section>
  </div>
</template>
