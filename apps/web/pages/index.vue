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
    <section class="bg-[#0D0D0D] overflow-hidden">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 pt-16 sm:pt-20 lg:pt-28 pb-32 sm:pb-36 lg:pb-44 flex flex-col items-center">
        <!-- Badge -->
        <div class="border border-[#FF840033] bg-[#FF840012] rounded-full px-4 py-1.5 mb-6 lg:mb-8">
          <span class="font-mono text-[#FF8400] text-xs font-medium tracking-wide">Built for real estate agents</span>
        </div>

        <!-- Headline -->
        <h1
          class="font-mono text-[32px] sm:text-[44px] lg:text-[56px] font-semibold text-white text-center leading-[1.1] tracking-tight max-w-[800px] mb-5 lg:mb-6"
        >
          Screen tenants faster.<br />
          Close deals with confidence.
        </h1>

        <!-- Subheadline — single concise line -->
        <p class="font-sans text-base sm:text-lg text-[#7A7A7A] text-center leading-relaxed max-w-[560px] mb-8 lg:mb-10">
          Verified identity, employment, and address reports — delivered to your inbox within 48 hours.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-16 lg:mb-20">
          <NuxtLink
            to="/auth/register"
            class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-[15px] px-8 py-3.5 rounded-md hover:bg-[#E67700] transition-colors w-full sm:w-auto text-center"
          >
            Start Screening Tenants
          </NuxtLink>
          <a
            href="#pricing"
            class="text-white/90 text-[15px] px-8 py-3.5 rounded-md border border-[#3A3A3A] hover:border-[#555] hover:bg-white/[0.04] transition-all w-full sm:w-auto text-center"
          >
            See Pricing
          </a>
        </div>

        <!-- Floating Stat Cards -->
        <div class="relative w-full flex justify-center">
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 lg:gap-6">
            <!-- Card 1 — tilted left -->
            <div class="hero-card sm:-rotate-3 sm:translate-y-1 bg-[#161616] border border-[#2A2A2A] rounded-xl px-7 py-5 flex flex-col items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span class="font-mono text-[28px] font-bold text-[#FF8400]">200+</span>
              <span class="font-sans text-[12px] text-[#7A7A7A] tracking-wide uppercase">Agents Registered</span>
            </div>

            <!-- Card 2 — center, raised -->
            <div class="hero-card sm:-translate-y-2 bg-[#161616] border border-[#2A2A2A] rounded-xl px-7 py-5 flex flex-col items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span class="font-mono text-[28px] font-bold text-[#FF8400]">50+</span>
              <span class="font-sans text-[12px] text-[#7A7A7A] tracking-wide uppercase">Reports This Month</span>
            </div>

            <!-- Card 3 — tilted right -->
            <div class="hero-card sm:rotate-3 sm:translate-y-1 bg-[#161616] border border-[#2A2A2A] rounded-xl px-7 py-5 flex flex-col items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span class="font-mono text-[28px] font-bold text-[#FF8400]">48hr</span>
              <span class="font-sans text-[12px] text-[#7A7A7A] tracking-wide uppercase">Average Turnaround</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- HOW IT WORKS                                 -->
    <!-- ============================================ -->
    <section id="how-it-works" class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-16 flex flex-col items-center gap-12">
        <!-- Header -->
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">
            HOW IT WORKS
          </span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-foreground tracking-tight text-center">
            Three steps to a verified tenant
          </h2>
        </div>

        <!-- Cards Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
      </div>
    </section>

    <!-- ============================================ -->
    <!-- PRICING SECTION                              -->
    <!-- ============================================ -->
    <section id="pricing" class="bg-card">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-20 flex flex-col items-center gap-12">
        <!-- Pricing Header -->
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">
            AGENT PRICING
          </span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-foreground tracking-tight text-center">
            Buy in bundles. Save more.
          </h2>
          <p class="font-sans text-base text-muted-foreground text-center">
            Volume pricing for agents who screen regularly
          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
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
      </div>
    </section>

    <!-- ============================================ -->
    <!-- FINAL CTA                                    -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-20 flex flex-col items-center justify-center gap-6">
        <h2 class="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center max-w-[800px]">
          Join 200+ agents already screening with RentCred
        </h2>
        <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[700px]">
          Stop relying on verbal references. Start closing deals with verified tenants.
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <NuxtLink
            to="/auth/register"
            class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-4 hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
          >
            Create Your Agent Account
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="text-white text-base px-8 py-4 border border-[#7A7A7A] hover:border-white transition-colors w-full sm:w-auto text-center"
          >
            Talk to Sales
          </NuxtLink>
        </div>
        <p class="font-sans text-[13px] text-[#7A7A7A]">
          No monthly fees. Pay per check or buy bundles.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Floating card entrance animation */
.hero-card {
  animation: floatUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.hero-card:nth-child(1) { animation-delay: 0.15s; }
.hero-card:nth-child(2) { animation-delay: 0.3s; }
.hero-card:nth-child(3) { animation-delay: 0.45s; }

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
