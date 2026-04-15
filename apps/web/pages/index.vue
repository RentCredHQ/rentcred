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
    <!-- 1. HERO                                      -->
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

        <!-- Subheadline -->
        <p class="font-sans text-base sm:text-lg text-[#7A7A7A] text-center leading-relaxed max-w-[560px] mb-8 lg:mb-10">
          Verified identity, employment, and address reports — delivered to your inbox within 48 hours.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-16 lg:mb-20">
          <NuxtLink
            to="/auth/register"
            class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-[15px] px-8 py-3.5 hover:bg-[#E67700] transition-colors w-full sm:w-auto text-center"
          >
            Start Screening Tenants
          </NuxtLink>
          <a
            href="#pricing"
            class="text-white/90 text-[15px] px-8 py-3.5 border border-[#3A3A3A] hover:border-[#555] hover:bg-white/[0.04] transition-all w-full sm:w-auto text-center"
          >
            See Pricing
          </a>
        </div>

        <!-- Floating Stat Cards -->
        <div class="relative w-full flex justify-center">
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 lg:gap-6">
            <div class="hero-card sm:-rotate-3 sm:translate-y-1 bg-[#161616] border border-[#2A2A2A] px-7 py-5 flex flex-col items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span class="font-mono text-[28px] font-bold text-[#FF8400]">200+</span>
              <span class="font-sans text-[12px] text-[#7A7A7A] tracking-wide uppercase">Agents Registered</span>
            </div>
            <div class="hero-card sm:-translate-y-2 bg-[#161616] border border-[#2A2A2A] px-7 py-5 flex flex-col items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span class="font-mono text-[28px] font-bold text-[#FF8400]">50+</span>
              <span class="font-sans text-[12px] text-[#7A7A7A] tracking-wide uppercase">Reports This Month</span>
            </div>
            <div class="hero-card sm:rotate-3 sm:translate-y-1 bg-[#161616] border border-[#2A2A2A] px-7 py-5 flex flex-col items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 w-full sm:w-auto">
              <span class="font-mono text-[28px] font-bold text-[#FF8400]">48hr</span>
              <span class="font-sans text-[12px] text-[#7A7A7A] tracking-wide uppercase">Average Turnaround</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 2. THE PROBLEM                               -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-4 mb-12 lg:mb-16">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">The Problem</span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-foreground tracking-tight text-center max-w-[700px]">
            Nigerian rentals run on trust. But trust doesn't scale.
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Pain 1 -->
          <div class="border border-border p-7 flex flex-col gap-4">
            <div class="flex items-center gap-3 mb-1">
              <span class="material-symbols-rounded text-[#EF4444] text-xl">close</span>
              <span class="font-mono text-sm font-semibold text-muted-foreground">Without RentCred</span>
            </div>
            <p class="font-sans text-[15px] text-foreground leading-relaxed">
              Agents rely on verbal references and WhatsApp screenshots to vet tenants. No paper trail, no accountability.
            </p>
            <div class="h-px bg-border my-1" />
            <div class="flex items-center gap-3 mb-1">
              <span class="material-symbols-rounded text-[#22C55E] text-xl">check_circle</span>
              <span class="font-mono text-sm font-semibold text-[#FF8400]">With RentCred</span>
            </div>
            <p class="font-sans text-[15px] text-muted-foreground leading-relaxed">
              Every check is documented — identity, employment, references, and address verified with a traceable report.
            </p>
          </div>

          <!-- Pain 2 -->
          <div class="border border-border p-7 flex flex-col gap-4">
            <div class="flex items-center gap-3 mb-1">
              <span class="material-symbols-rounded text-[#EF4444] text-xl">close</span>
              <span class="font-mono text-sm font-semibold text-muted-foreground">Without RentCred</span>
            </div>
            <p class="font-sans text-[15px] text-foreground leading-relaxed">
              Landlords ask "do you know this tenant?" and agents have nothing concrete to show. Deals stall or fall through.
            </p>
            <div class="h-px bg-border my-1" />
            <div class="flex items-center gap-3 mb-1">
              <span class="material-symbols-rounded text-[#22C55E] text-xl">check_circle</span>
              <span class="font-mono text-sm font-semibold text-[#FF8400]">With RentCred</span>
            </div>
            <p class="font-sans text-[15px] text-muted-foreground leading-relaxed">
              Share a professional credibility report via link. Landlords see verified data, not promises. Deals close faster.
            </p>
          </div>

          <!-- Pain 3 -->
          <div class="border border-border p-7 flex flex-col gap-4">
            <div class="flex items-center gap-3 mb-1">
              <span class="material-symbols-rounded text-[#EF4444] text-xl">close</span>
              <span class="font-mono text-sm font-semibold text-muted-foreground">Without RentCred</span>
            </div>
            <p class="font-sans text-[15px] text-foreground leading-relaxed">
              Bad tenants slip through. Rent defaults, property damage, and legal disputes cost landlords millions every year.
            </p>
            <div class="h-px bg-border my-1" />
            <div class="flex items-center gap-3 mb-1">
              <span class="material-symbols-rounded text-[#22C55E] text-xl">check_circle</span>
              <span class="font-mono text-sm font-semibold text-[#FF8400]">With RentCred</span>
            </div>
            <p class="font-sans text-[15px] text-muted-foreground leading-relaxed">
              Screen out high-risk tenants before signing. Field agents physically verify addresses and property conditions.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 3. HOW IT WORKS                              -->
    <!-- ============================================ -->
    <section id="how-it-works" class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-12 lg:gap-16">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">
            HOW IT WORKS
          </span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-white tracking-tight text-center">
            Three steps to a verified tenant
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <!-- Step 1 -->
          <div class="border border-[#2A2A2A] bg-[#161616] p-7 flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-[#FF8400] flex items-center justify-center flex-shrink-0">
                <span class="font-mono text-lg font-bold text-[#0D0D0D]">1</span>
              </div>
              <h3 class="font-mono text-lg font-semibold text-white">Submit Your Tenant</h3>
            </div>
            <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">
              Enter tenant details, upload property photos, and select your verification package. One credit per check.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="border border-[#2A2A2A] bg-[#161616] p-7 flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-[#FF8400] flex items-center justify-center flex-shrink-0">
                <span class="font-mono text-lg font-bold text-[#0D0D0D]">2</span>
              </div>
              <h3 class="font-mono text-lg font-semibold text-white">We Verify Everything</h3>
            </div>
            <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">
              Our ops team runs identity, employment, and reference checks. Field agents conduct physical inspections when needed.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="border border-[#2A2A2A] bg-[#161616] p-7 flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-[#FF8400] flex items-center justify-center flex-shrink-0">
                <span class="font-mono text-lg font-bold text-[#0D0D0D]">3</span>
              </div>
              <h3 class="font-mono text-lg font-semibold text-white">Share the Report</h3>
            </div>
            <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">
              Receive a structured credibility report. Share it with your landlord via a secure link — no login required.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 4. SAMPLE REPORT PREVIEW                     -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <!-- Left — Copy -->
          <div class="flex-1 flex flex-col gap-6">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">What You Deliver</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-foreground tracking-tight">
              A report your landlord actually trusts
            </h2>
            <p class="font-sans text-[15px] text-muted-foreground leading-relaxed">
              Every RentCred report includes color-coded verification results, a risk assessment, and a clear recommendation. Landlords see exactly what was checked and what the findings were — no ambiguity.
            </p>
            <div class="flex flex-col gap-3 mt-2">
              <div class="flex items-center gap-3">
                <span class="material-symbols-rounded text-[#FF8400] text-lg">check</span>
                <span class="font-sans text-sm text-foreground">Identity cross-checked against national databases</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="material-symbols-rounded text-[#FF8400] text-lg">check</span>
                <span class="font-sans text-sm text-foreground">Employer and salary independently confirmed</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="material-symbols-rounded text-[#FF8400] text-lg">check</span>
                <span class="font-sans text-sm text-foreground">Previous landlords and references contacted</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="material-symbols-rounded text-[#FF8400] text-lg">check</span>
                <span class="font-sans text-sm text-foreground">Physical address verified by field agent</span>
              </div>
            </div>
          </div>

          <!-- Right — Report Card -->
          <div class="w-full sm:w-[380px] lg:w-[400px] flex-shrink-0">
            <div class="bg-[#0D0D0D] border border-[#2A2A2A] overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.15)]">
              <!-- Header -->
              <div class="px-6 py-5 flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-[11px] text-[#7A7A7A] tracking-wider uppercase">RentCred Report</span>
                  <span class="font-mono text-[11px] text-[#7A7A7A]">March 2026</span>
                </div>
                <h3 class="font-mono text-lg font-bold text-white mt-1">Adebayo Ogundimu</h3>
                <span class="font-sans text-[12px] text-[#7A7A7A]">Submitted by Premier Realty Lagos</span>
              </div>
              <!-- Color Band -->
              <div class="flex h-1">
                <div class="flex-1 bg-[#22C55E]" />
                <div class="flex-1 bg-[#22C55E]" />
                <div class="flex-1 bg-[#F59E0B]" />
                <div class="w-16 bg-[#EF4444]" />
              </div>
              <!-- Check Items -->
              <div class="px-6 py-5 flex flex-col gap-3">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-rounded text-[#22C55E] text-[18px]">check_circle</span>
                  <span class="font-sans text-[13px] text-white/90">Identity — Verified</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-rounded text-[#22C55E] text-[18px]">check_circle</span>
                  <span class="font-sans text-[13px] text-white/90">Employment — Confirmed</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-rounded text-[#F59E0B] text-[18px]">warning</span>
                  <span class="font-sans text-[13px] text-white/90">References — Partially Verified</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-rounded text-[#22C55E] text-[18px]">check_circle</span>
                  <span class="font-sans text-[13px] text-white/90">Address — Validated</span>
                </div>
              </div>
              <!-- Recommendation -->
              <div class="bg-[#22C55E12] px-6 py-3.5 flex items-center gap-2 border-t border-[#2A2A2A]">
                <span class="material-symbols-rounded text-[#22C55E] text-[18px]">thumb_up</span>
                <span class="font-sans text-[12px] font-medium text-[#22C55E]">Recommendation: Proceed — verify references independently</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 5. TESTIMONIALS                              -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-12 lg:gap-16">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">What Agents Say</span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-white tracking-tight text-center">
            Trusted by agents across Nigeria
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <!-- Testimonial 1 -->
          <div class="border border-[#2A2A2A] bg-[#161616] p-7 flex flex-col gap-5">
            <div class="flex gap-1">
              <span v-for="i in 5" :key="i" class="material-symbols-rounded text-[#FF8400] text-[16px]">star</span>
            </div>
            <p class="font-sans text-sm text-[#B0B0B0] leading-relaxed">
              "RentCred changed how I work with landlords. Instead of verbal assurances, I now send a verified report link. My close rate has gone up significantly."
            </p>
            <div class="flex items-center gap-3 mt-auto pt-2">
              <div class="w-9 h-9 bg-[#FF840020] flex items-center justify-center">
                <span class="font-mono text-sm font-bold text-[#FF8400]">TA</span>
              </div>
              <div class="flex flex-col">
                <span class="font-sans text-sm font-medium text-white">Tobi Adesanya</span>
                <span class="font-sans text-[11px] text-[#7A7A7A]">Premier Realty, Lagos</span>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="border border-[#2A2A2A] bg-[#161616] p-7 flex flex-col gap-5">
            <div class="flex gap-1">
              <span v-for="i in 5" :key="i" class="material-symbols-rounded text-[#FF8400] text-[16px]">star</span>
            </div>
            <p class="font-sans text-sm text-[#B0B0B0] leading-relaxed">
              "The field verification is what sets RentCred apart. Having someone physically inspect the address before we commit gives my clients real confidence."
            </p>
            <div class="flex items-center gap-3 mt-auto pt-2">
              <div class="w-9 h-9 bg-[#FF840020] flex items-center justify-center">
                <span class="font-mono text-sm font-bold text-[#FF8400]">AN</span>
              </div>
              <div class="flex flex-col">
                <span class="font-sans text-sm font-medium text-white">Amina Nwosu</span>
                <span class="font-sans text-[11px] text-[#7A7A7A]">Urban Spaces, Abuja</span>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="border border-[#2A2A2A] bg-[#161616] p-7 flex flex-col gap-5">
            <div class="flex gap-1">
              <span v-for="i in 5" :key="i" class="material-symbols-rounded text-[#FF8400] text-[16px]">star</span>
            </div>
            <p class="font-sans text-sm text-[#B0B0B0] leading-relaxed">
              "I bought the 10-check bundle and it paid for itself on the first deal. The landlord was so impressed with the report that they gave me three more listings."
            </p>
            <div class="flex items-center gap-3 mt-auto pt-2">
              <div class="w-9 h-9 bg-[#FF840020] flex items-center justify-center">
                <span class="font-mono text-sm font-bold text-[#FF8400]">CE</span>
              </div>
              <div class="flex flex-col">
                <span class="font-sans text-sm font-medium text-white">Chidera Eze</span>
                <span class="font-sans text-[11px] text-[#7A7A7A]">Luxe Homes, Port Harcourt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 6. PRICING                                   -->
    <!-- ============================================ -->
    <section id="pricing" class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-12 lg:gap-16">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">
            Pricing
          </span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium text-foreground tracking-tight text-center">
            Pay per check. Save with bundles.
          </h2>
          <p class="font-sans text-base text-muted-foreground text-center max-w-[500px]">
            Start with a single check or buy in bulk for volume discounts. No monthly fees, no subscriptions.
          </p>
        </div>

        <!-- Single Check + Bundles -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-5 w-full">
          <!-- Single Check -->
          <div class="bg-card border border-border p-6 flex flex-col gap-4">
            <h3 class="font-mono text-base font-semibold text-foreground">Single Check</h3>
            <span class="font-mono text-2xl font-bold text-foreground">NGN 12,000</span>
            <span class="font-sans text-[13px] text-muted-foreground">Per verification</span>
            <div class="flex flex-col gap-2 mt-1">
              <span class="font-sans text-[13px] text-foreground">&#10003;  Full verification report</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  72-hour SLA</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  Shareable report link</span>
            </div>
            <NuxtLink
              to="/auth/register"
              class="text-center py-3 border border-border font-sans text-sm text-foreground hover:bg-[#FF840008] transition-colors mt-auto"
            >
              Get Started
            </NuxtLink>
          </div>

          <!-- 5-Check Bundle -->
          <div class="bg-card border border-border p-6 flex flex-col gap-4">
            <h3 class="font-mono text-base font-semibold text-foreground">5-Check Bundle</h3>
            <span class="font-mono text-2xl font-bold text-foreground">NGN 55,000</span>
            <span class="font-sans text-[13px] text-muted-foreground">NGN 11,000 per check</span>
            <div class="bg-[#FF840018] px-2.5 py-0.5 w-fit">
              <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Save 8%</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-sans text-[13px] text-foreground">&#10003;  Everything in Single</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  60-hour SLA</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  Email + SMS alerts</span>
            </div>
            <NuxtLink
              to="/auth/register"
              class="text-center py-3 border border-border font-sans text-sm text-foreground hover:bg-[#FF840008] transition-colors mt-auto"
            >
              Get Started
            </NuxtLink>
          </div>

          <!-- 10-Check Bundle (Featured) -->
          <div class="bg-card border-2 border-[#FF8400] p-6 flex flex-col gap-4 relative">
            <div class="absolute -top-3 left-6 bg-[#FF8400] px-3 py-0.5">
              <span class="font-mono text-[11px] font-bold text-[#0D0D0D]">MOST POPULAR</span>
            </div>
            <h3 class="font-mono text-base font-semibold text-foreground mt-1">10-Check Bundle</h3>
            <span class="font-mono text-2xl font-bold text-foreground">NGN 100,000</span>
            <span class="font-sans text-[13px] text-muted-foreground">NGN 10,000 per check</span>
            <div class="bg-[#FF840018] px-2.5 py-0.5 w-fit">
              <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Save 17%</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-sans text-[13px] text-foreground">&#10003;  Everything in 5-Check</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  Priority 48-hour SLA</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  Dedicated support</span>
            </div>
            <NuxtLink
              to="/auth/register"
              class="text-center py-3 bg-[#FF8400] font-sans text-sm font-semibold text-[#0D0D0D] hover:bg-[#E67700] transition-colors mt-auto"
            >
              Get Started
            </NuxtLink>
          </div>

          <!-- 25-Check Bundle -->
          <div class="bg-card border border-border p-6 flex flex-col gap-4">
            <h3 class="font-mono text-base font-semibold text-foreground">25-Check Bundle</h3>
            <span class="font-mono text-2xl font-bold text-foreground">NGN 225,000</span>
            <span class="font-sans text-[13px] text-muted-foreground">NGN 9,000 per check</span>
            <div class="bg-[#FF840018] px-2.5 py-0.5 w-fit">
              <span class="font-mono text-[11px] font-semibold text-[#FF8400]">Save 25%</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-sans text-[13px] text-foreground">&#10003;  Everything in 10-Check</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  Field verification included</span>
              <span class="font-sans text-[13px] text-foreground">&#10003;  Account manager</span>
            </div>
            <NuxtLink
              to="/auth/register"
              class="text-center py-3 border border-border font-sans text-sm text-foreground hover:bg-[#FF840008] transition-colors mt-auto"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 7. FINAL CTA                                 -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center justify-center gap-6">
        <h2 class="font-mono text-2xl sm:text-3xl lg:text-[40px] font-semibold text-white text-center max-w-[700px] leading-[1.15]">
          No contracts. No monthly fees.<br />Pay only when you screen.
        </h2>
        <p class="font-sans text-base sm:text-lg text-[#7A7A7A] text-center max-w-[520px]">
          Create your free account in 60 seconds. Buy credits when you're ready. Cancel nothing — there's nothing to cancel.
        </p>
        <NuxtLink
          to="/auth/register"
          class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-10 py-4 hover:bg-[#E67700] transition-colors text-center mt-2"
        >
          Create Your Free Account
        </NuxtLink>
        <p class="font-sans text-[12px] text-[#555] mt-1">
          Join 200+ agents already using RentCred
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
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
