<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'For Landlords — RentCred', description: 'Know who you\'re renting to. Get verified tenant reports before signing any lease.' })
</script>

<template>
  <div>
    <!-- ============================================ -->
    <!-- 1. HERO (dark)                               -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-8">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">FOR LANDLORDS</span>
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-semibold text-white text-center max-w-[900px]">
          Know exactly who you're renting to
        </h1>
        <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[700px] leading-relaxed">
          Your agent submits the tenant. We verify everything. You get a clear, color-coded report before signing the lease.
        </p>
        <NuxtLink
          to="/contact"
          class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-3.5 hover:opacity-90 transition-opacity font-sans"
        >
          Ask Your Agent About RentCred
        </NuxtLink>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 2. THE PROBLEM (light)                       -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-3">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">WHY IT MATTERS</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">Verbal references aren't enough</h2>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <!-- Card 1 -->
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">money_off</span>
              <h3 class="font-mono text-base font-semibold text-foreground">Rent defaults cost millions</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">Tenants who can't actually afford the rent slip through without income verification. By the time you know, it's too late.</p>
            </div>
            <!-- Card 2 -->
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">home_repair_service</span>
              <h3 class="font-mono text-base font-semibold text-foreground">Property damage has no recourse</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">Without verified identity and references, holding tenants accountable is nearly impossible. You're left covering the cost.</p>
            </div>
            <!-- Card 3 -->
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">person_off</span>
              <h3 class="font-mono text-base font-semibold text-foreground">Agents can't vouch for strangers</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">Even good agents can't verify what they don't have tools to check. They need a system, not guesswork.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 3. WHAT'S IN A REPORT (dark)                 -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-3">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">YOUR REPORT</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-white">Everything you need to decide</h2>
          </div>

          <div class="flex flex-col lg:flex-row gap-12 lg:gap-16 w-full items-center lg:items-start">
            <!-- Left: Check items -->
            <div class="flex-1 flex flex-col gap-8">
              <div class="flex items-start gap-4">
                <span class="material-symbols-rounded text-[#22C55E] text-2xl mt-0.5">check_circle</span>
                <div class="flex flex-col gap-1">
                  <h3 class="font-mono text-base font-semibold text-white">Identity Verified</h3>
                  <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">NIN, BVN, and government ID cross-checked against national databases to confirm the tenant is who they claim to be.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <span class="material-symbols-rounded text-[#22C55E] text-2xl mt-0.5">check_circle</span>
                <div class="flex flex-col gap-1">
                  <h3 class="font-mono text-base font-semibold text-white">Employment Confirmed</h3>
                  <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">Employer verification, salary validation, and job tenure confirmed directly so you know the rent is affordable.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <span class="material-symbols-rounded text-[#22C55E] text-2xl mt-0.5">check_circle</span>
                <div class="flex flex-col gap-1">
                  <h3 class="font-mono text-base font-semibold text-white">References Checked</h3>
                  <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">Previous landlords and personal references contacted and documented. You see exactly what they said.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <span class="material-symbols-rounded text-[#22C55E] text-2xl mt-0.5">check_circle</span>
                <div class="flex flex-col gap-1">
                  <h3 class="font-mono text-base font-semibold text-white">Address Validated</h3>
                  <p class="font-sans text-sm text-[#7A7A7A] leading-relaxed">Current and previous addresses verified through utility records and physical field inspections by our agents.</p>
                </div>
              </div>
            </div>

            <!-- Right: Sample report card -->
            <div class="w-full sm:w-[460px] lg:w-[440px] bg-[#161616] border border-[#2A2A2A] overflow-hidden flex-shrink-0">
              <!-- Top -->
              <div class="p-8 flex flex-col gap-3">
                <h3 class="font-mono text-[22px] font-bold text-white">Adebayo Ogundimu</h3>
                <p class="font-sans text-[13px] text-[#7A7A7A]">Submitted by: Prime Realty Lagos  &middot;  March 2026</p>
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
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 4. HOW IT WORKS (light)                      -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-3">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">YOUR EXPERIENCE</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">Three steps. Zero effort on your part.</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <!-- Step 1 -->
            <div class="border border-border p-7 flex flex-col gap-5">
              <div class="w-10 h-10 bg-[#FF8400] flex items-center justify-center">
                <span class="font-mono text-lg font-bold text-[#0D0D0D]">1</span>
              </div>
              <h3 class="font-mono text-base font-semibold text-foreground">Your Agent Requests</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">Your real estate agent submits the tenant's details through RentCred. You don't need to do anything.</p>
            </div>
            <!-- Step 2 -->
            <div class="border border-border p-7 flex flex-col gap-5">
              <div class="w-10 h-10 bg-[#FF8400] flex items-center justify-center">
                <span class="font-mono text-lg font-bold text-[#0D0D0D]">2</span>
              </div>
              <h3 class="font-mono text-base font-semibold text-foreground">We Verify in 48 Hours</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">Our team checks identity, employment, references, and sends field agents to inspect the address.</p>
            </div>
            <!-- Step 3 -->
            <div class="border border-border p-7 flex flex-col gap-5">
              <div class="w-10 h-10 bg-[#FF8400] flex items-center justify-center">
                <span class="font-mono text-lg font-bold text-[#0D0D0D]">3</span>
              </div>
              <h3 class="font-mono text-base font-semibold text-foreground">You Review the Report</h3>
              <p class="font-sans text-sm text-muted-foreground leading-relaxed">Receive a secure link to a color-coded report with a clear recommendation. No login required.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 5. TRUST SIGNALS (dark)                      -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-3">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">WHY TRUST RENTCRED</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-white">Built for the Nigerian rental market</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2 text-center">
              <span class="font-mono text-2xl font-bold text-white">200+ Agents</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Registered nationwide</span>
            </div>
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2 text-center">
              <span class="font-mono text-2xl font-bold text-white">NDPR Compliant</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Your data is protected</span>
            </div>
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2 text-center">
              <span class="font-mono text-2xl font-bold text-white">Field Verified</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Physical address inspections</span>
            </div>
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2 text-center">
              <span class="font-mono text-2xl font-bold text-white">48hr SLA</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Average turnaround time</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 6. FINAL CTA (light)                         -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-6">
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">Ask your agent about RentCred</h2>
          <p class="font-sans text-lg text-muted-foreground text-center max-w-[600px] leading-relaxed">
            If your agent isn't using RentCred yet, send them our way. Better tenants start with better verification.
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <NuxtLink
              to="/contact"
              class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-3.5 hover:opacity-90 transition-opacity font-sans w-full sm:w-auto text-center"
            >
              Tell Your Agent
            </NuxtLink>
            <NuxtLink
              to="/#how-it-works"
              class="text-foreground text-base px-8 py-3.5 border border-border hover:bg-muted transition-colors font-sans w-full sm:w-auto text-center"
            >
              Learn More
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
