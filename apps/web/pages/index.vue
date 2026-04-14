<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'RentCred — Tenant Verification Made Simple',
  description: 'RentCred simplifies tenant verification for landlords and agents across Nigeria. Get verified tenant reports in 48 hours.',
})
</script>

<template>
  <div>
    <!-- ============================================ -->
    <!-- HERO SECTION                                 -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D] px-20 py-16 min-h-[700px] flex flex-col gap-12">
      <!-- Hero Content -->
      <div class="flex-1 flex flex-col items-center justify-center gap-8">
        <!-- Badge -->
        <div class="border border-[#FF840033] bg-[#FF840012] rounded-full px-4 py-1.5">
          <span class="font-mono text-[#FF8400] text-xs font-medium">Built for real estate agents</span>
        </div>

        <!-- Headline -->
        <h1
          class="font-mono text-5xl font-medium text-white text-center leading-[1.15] tracking-tight max-w-[800px]"
        >
          Screen tenants faster.<br />
          Close deals with confidence.
        </h1>

        <!-- Subheadline -->
        <p class="font-sans text-lg text-[#7A7A7A] text-center leading-relaxed max-w-[700px]">
          Submit a tenant, we verify identity, employment, references and addresses.
          Share a credibility report with your landlord client — all within 48 hours.
        </p>

        <!-- CTA Buttons -->
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/auth/register"
            class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Start Screening Tenants
          </NuxtLink>
          <a
            href="#pricing"
            class="text-white text-base px-8 py-4 border border-white hover:bg-white/10 transition-colors"
          >
            See Pricing
          </a>
        </div>
      </div>

      <!-- Trust Bar / Stats -->
      <div class="flex justify-center gap-16">
        <div class="flex flex-col items-center gap-1">
          <span class="font-mono text-2xl font-bold text-[#FF8400]">200+</span>
          <span class="font-sans text-[13px] text-[#7A7A7A]">Agents Registered</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="font-mono text-2xl font-bold text-[#FF8400]">50+</span>
          <span class="font-sans text-[13px] text-[#7A7A7A]">Reports This Month</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="font-mono text-2xl font-bold text-[#FF8400]">48hr</span>
          <span class="font-sans text-[13px] text-[#7A7A7A]">Average Turnaround</span>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- HOW IT WORKS                                 -->
    <!-- ============================================ -->
    <section id="how-it-works" class="bg-background px-20 py-16 flex flex-col items-center gap-12">
      <!-- Header -->
      <div class="flex flex-col items-center gap-3">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">
          HOW IT WORKS
        </span>
        <h2 class="font-mono text-[32px] font-medium text-foreground tracking-tight text-center">
          Three steps to a verified tenant
        </h2>
      </div>

      <!-- Cards Row -->
      <div class="grid grid-cols-3 gap-6 w-full">
        <!-- Card 1 -->
        <div class="border border-border p-7 flex flex-col gap-5">
          <div class="w-12 h-12 rounded-3xl bg-[#FF840018] flex items-center justify-center">
            <span class="material-symbols-rounded text-[#FF8400] text-xl">person_add</span>
          </div>
          <h3 class="font-mono text-lg font-semibold text-foreground">Submit Your Tenant</h3>
          <p class="font-sans text-sm text-muted-foreground leading-relaxed">
            Enter tenant details or send an invite. Pick Basic, Standard, or Premium package.
          </p>
        </div>

        <!-- Card 2 -->
        <div class="border border-border p-7 flex flex-col gap-5">
          <div class="w-12 h-12 rounded-3xl bg-[#FF840018] flex items-center justify-center">
            <span class="material-symbols-rounded text-[#FF8400] text-xl">verified</span>
          </div>
          <h3 class="font-mono text-lg font-semibold text-foreground">We Run the Checks</h3>
          <p class="font-sans text-sm text-muted-foreground leading-relaxed">
            Our team verifies identity, calls employers and landlords, and dispatches field agents when needed.
          </p>
        </div>

        <!-- Card 3 -->
        <div class="border border-border p-7 flex flex-col gap-5">
          <div class="w-12 h-12 rounded-3xl bg-[#FF840018] flex items-center justify-center">
            <span class="material-symbols-rounded text-[#FF8400] text-xl">share</span>
          </div>
          <h3 class="font-mono text-lg font-semibold text-foreground">Share the Report</h3>
          <p class="font-sans text-sm text-muted-foreground leading-relaxed">
            Receive a structured credibility report. Share it directly with your landlord client via link or PDF.
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- PRICING SECTION                              -->
    <!-- ============================================ -->
    <section id="pricing" class="bg-card px-[120px] py-20 flex flex-col items-center gap-12">
      <!-- Pricing Header -->
      <div class="flex flex-col items-center gap-3">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">
          AGENT PRICING
        </span>
        <h2 class="font-mono text-[32px] font-medium text-foreground tracking-tight text-center">
          Buy in bundles. Save more.
        </h2>
        <p class="font-sans text-base text-muted-foreground text-center">
          Volume pricing for agents who screen regularly
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-3 gap-6 w-full">
        <!-- 5-Check Bundle -->
        <div class="bg-card border border-border p-7 flex flex-col gap-5">
          <h3 class="font-mono text-lg font-semibold text-foreground">5-Check Bundle</h3>
          <span class="font-mono text-[32px] font-bold text-foreground">NGN 55,000</span>
          <span class="font-sans text-sm text-muted-foreground">NGN 11,000 per check</span>
          <div class="bg-[#FF840018] rounded-full px-3 py-1 w-fit">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Save 8%</span>
          </div>
          <div class="flex flex-col gap-2.5">
            <span class="font-sans text-[13px] text-foreground">✓  All Standard Check features</span>
            <span class="font-sans text-[13px] text-foreground">✓  60-hour SLA</span>
            <span class="font-sans text-[13px] text-foreground">✓  Email + SMS notifications</span>
          </div>
          <NuxtLink
            to="/auth/register"
            class="text-center py-3.5 border border-border font-sans text-sm text-foreground hover:bg-surface transition-colors"
          >
            Get Started
          </NuxtLink>
        </div>

        <!-- 10-Check Bundle (Featured) -->
        <div class="bg-card border-2 border-[#FF8400] p-7 flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <h3 class="font-mono text-lg font-semibold text-foreground">10-Check Bundle</h3>
            <div class="bg-[#FF840018] rounded-full px-2.5 py-0.5">
              <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Popular</span>
            </div>
          </div>
          <span class="font-mono text-[32px] font-bold text-foreground">NGN 100,000</span>
          <span class="font-sans text-sm text-muted-foreground">NGN 10,000 per check</span>
          <div class="bg-[#FF840018] rounded-full px-3 py-1 w-fit">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Save 17%</span>
          </div>
          <div class="flex flex-col gap-2.5">
            <span class="font-sans text-[13px] text-foreground">✓  All Standard Check features</span>
            <span class="font-sans text-[13px] text-foreground">✓  Priority 48-hour SLA</span>
            <span class="font-sans text-[13px] text-foreground">✓  Dedicated support line</span>
            <span class="font-sans text-[13px] text-foreground">✓  Bundle credit dashboard</span>
          </div>
          <NuxtLink
            to="/auth/register"
            class="text-center py-3.5 bg-[#FF8400] font-sans text-sm font-semibold text-[#0D0D0D] hover:opacity-90 transition-opacity"
          >
            Get Started
          </NuxtLink>
        </div>

        <!-- 25-Check Bundle -->
        <div class="bg-card border border-border p-7 flex flex-col gap-5">
          <h3 class="font-mono text-lg font-semibold text-foreground">25-Check Bundle</h3>
          <span class="font-mono text-[32px] font-bold text-foreground">NGN 225,000</span>
          <span class="font-sans text-sm text-muted-foreground">NGN 9,000 per check</span>
          <div class="bg-[#FF840018] rounded-full px-3 py-1 w-fit">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Save 25%</span>
          </div>
          <div class="flex flex-col gap-2.5">
            <span class="font-sans text-[13px] text-foreground">✓  All Standard + Premium features</span>
            <span class="font-sans text-[13px] text-foreground">✓  Field verification included</span>
            <span class="font-sans text-[13px] text-foreground">✓  48-hour priority SLA</span>
            <span class="font-sans text-[13px] text-foreground">✓  Account manager</span>
          </div>
          <NuxtLink
            to="/auth/register"
            class="text-center py-3.5 border border-border font-sans text-sm text-foreground hover:bg-surface transition-colors"
          >
            Get Started
          </NuxtLink>
        </div>
      </div>

      <!-- Per-check note -->
      <p class="font-sans text-[13px] text-muted-foreground text-center">
        Need just one? &nbsp;Basic NGN 5,000–8,000 &nbsp;| &nbsp;Standard NGN 12,000–18,000 &nbsp;| &nbsp;Premium NGN 25,000–40,000
      </p>
    </section>

    <!-- ============================================ -->
    <!-- FINAL CTA                                    -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D] px-[120px] py-20 flex flex-col items-center justify-center gap-6">
      <h2 class="font-mono text-4xl font-bold text-white text-center max-w-[800px]">
        Join 200+ agents already screening with RentCred
      </h2>
      <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[700px]">
        Stop relying on verbal references. Start closing deals with verified tenants.
      </p>
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/auth/register"
          class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-4 hover:opacity-90 transition-opacity"
        >
          Create Your Agent Account
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="text-white text-base px-8 py-4 border border-[#7A7A7A] hover:border-white transition-colors"
        >
          Talk to Sales
        </NuxtLink>
      </div>
      <p class="font-sans text-[13px] text-[#7A7A7A]">
        No monthly fees. Pay per check or buy bundles.
      </p>
    </section>
  </div>
</template>
