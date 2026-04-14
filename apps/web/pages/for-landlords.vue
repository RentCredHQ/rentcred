<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'For Landlords — RentCred', description: 'Know who you\'re renting to. Get verified tenant reports before signing any lease.' })
</script>

<template>
  <div>
    <!-- ============================================ -->
    <!-- HERO SECTION                                 -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D] px-5 sm:px-8 lg:px-20 py-10 lg:py-16 min-h-[auto] lg:min-h-[600px] flex flex-col items-center justify-center gap-12">
      <div class="flex flex-col items-center gap-8">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">FOR LANDLORDS</span>
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center max-w-[900px]">
          Know who you're renting to
        </h1>
        <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[700px] leading-relaxed">
          Get verified tenant reports — identity, employment, references, and address — before you hand over the keys.
        </p>
        <NuxtLink
          to="/contact"
          class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-3.5 hover:opacity-90 transition-opacity font-sans"
        >
          Request a Report
        </NuxtLink>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- WHAT YOU GET — 4 cards                       -->
    <!-- ============================================ -->
    <section class="bg-background px-5 sm:px-8 lg:px-[120px] py-10 lg:py-20">
      <div class="flex flex-col items-center gap-12">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">WHAT YOU GET</span>
          <h2 class="font-mono text-4xl font-bold text-foreground text-center">Every report covers what matters</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <!-- Card 1 -->
          <div class="bg-card border border-border p-8 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">fingerprint</span>
            <h3 class="font-mono text-base font-bold text-foreground">Identity Verified</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">NIN, BVN and government ID cross-checked against national databases.</p>
          </div>
          <!-- Card 2 -->
          <div class="bg-card border border-border p-8 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">work</span>
            <h3 class="font-mono text-base font-bold text-foreground">Employment Confirmed</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Employer verification, salary validation, and job tenure confirmed directly.</p>
          </div>
          <!-- Card 3 -->
          <div class="bg-card border border-border p-8 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">group</span>
            <h3 class="font-mono text-base font-bold text-foreground">References Checked</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Previous landlords and personal references contacted and documented.</p>
          </div>
          <!-- Card 4 -->
          <div class="bg-card border border-border p-8 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">location_on</span>
            <h3 class="font-mono text-base font-bold text-foreground">Address Validated</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Current and previous addresses verified through utility records and field checks.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- HOW IT WORKS — 3 steps                      -->
    <!-- ============================================ -->
    <section class="bg-background px-5 sm:px-8 lg:px-[120px] py-10 lg:py-20 border-t border-border">
      <div class="flex flex-col items-center gap-12">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">HOW IT WORKS</span>
          <h2 class="font-mono text-4xl font-bold text-foreground text-center">Three steps to a verified tenant</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          <!-- Step 1 -->
          <div class="bg-card border border-border p-8 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#FF8400] flex items-center justify-center">
              <span class="font-mono text-xl font-bold text-[#0D0D0D]">1</span>
            </div>
            <h3 class="font-mono text-lg font-bold text-foreground text-center">Your Agent Submits</h3>
            <p class="font-sans text-sm text-muted-foreground text-center" style="line-height: 1.6">Your real estate agent submits the tenant's details through the RentCred platform.</p>
          </div>
          <!-- Step 2 -->
          <div class="bg-card border border-border p-8 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#FF8400] flex items-center justify-center">
              <span class="font-mono text-xl font-bold text-[#0D0D0D]">2</span>
            </div>
            <h3 class="font-mono text-lg font-bold text-foreground text-center">We Verify</h3>
            <p class="font-sans text-sm text-muted-foreground text-center" style="line-height: 1.6">Our team runs identity, employment, reference, and address checks within 48 hours.</p>
          </div>
          <!-- Step 3 -->
          <div class="bg-card border border-border p-8 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#FF8400] flex items-center justify-center">
              <span class="font-mono text-xl font-bold text-[#0D0D0D]">3</span>
            </div>
            <h3 class="font-mono text-lg font-bold text-foreground text-center">You Get the Report</h3>
            <p class="font-sans text-sm text-muted-foreground text-center" style="line-height: 1.6">Receive a clear, color-coded report with a recommendation you can trust.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- SAMPLE REPORT PREVIEW                        -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D] px-5 sm:px-8 lg:px-[120px] py-10 lg:py-20">
      <div class="flex flex-col items-center gap-12">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">SAMPLE REPORT</span>
          <h2 class="font-mono text-4xl font-bold text-white text-center">What your report looks like</h2>
        </div>

        <!-- Report Card -->
        <div class="w-full sm:w-[500px] bg-[#1A1A1A] border border-[#2E2E2E] overflow-hidden">
          <!-- Top -->
          <div class="p-8 flex flex-col gap-3">
            <h3 class="font-mono text-[22px] font-bold text-white">Adebayo Ogundimu</h3>
            <p class="font-sans text-[13px] text-[#7A7A7A]">Submitted by: Prime Realty Lagos  •  March 2026</p>
          </div>
          <!-- Color Band -->
          <div class="flex h-1.5">
            <div class="flex-1 bg-[#22C55E]" />
            <div class="flex-1 bg-[#F59E0B]" />
            <div class="w-[100px] bg-[#EF4444]" />
          </div>
          <!-- Check Items -->
          <div class="p-8 pt-6 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[#22C55E] text-xl">check_circle</span>
              <span class="font-sans text-sm text-white">Identity — Verified</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[#22C55E] text-xl">check_circle</span>
              <span class="font-sans text-sm text-white">Employment — Confirmed</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[#F59E0B] text-xl">warning</span>
              <span class="font-sans text-sm text-white">References — Partially Verified</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-[#22C55E] text-xl">check_circle</span>
              <span class="font-sans text-sm text-white">Address — Validated</span>
            </div>
          </div>
          <!-- Recommendation Bar -->
          <div class="bg-[#22C55E20] px-8 py-4 flex items-center gap-2">
            <span class="material-symbols-rounded text-[#22C55E] text-xl">thumb_up</span>
            <span class="font-sans text-[13px] font-semibold text-[#22C55E]">Recommendation: Proceed with caution — verify references independently</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- FINAL CTA                                    -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D] px-5 sm:px-8 lg:px-[120px] py-10 lg:py-20 border-t border-[#2E2E2E]">
      <div class="flex flex-col items-center justify-center gap-6">
        <h2 class="font-mono text-4xl font-bold text-white text-center">Ask your agent about RentCred</h2>
        <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[600px]">
          Get peace of mind before signing the lease. Your agent can request a report in minutes.
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <NuxtLink
            to="/auth/register"
            class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-3.5 hover:opacity-90 transition-opacity font-sans w-full sm:w-auto text-center"
          >
            Start Screening
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="text-white text-base px-8 py-3.5 border border-[#7A7A7A] hover:bg-white/10 transition-colors font-sans w-full sm:w-auto text-center"
          >
            Or Register Directly
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
