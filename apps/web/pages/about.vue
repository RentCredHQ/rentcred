<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'About — RentCred', description: 'Building trust in Nigerian rentals.' })
</script>

<template>
  <div>
    <!-- ============================================ -->
    <!-- HERO                                         -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-16 min-h-[auto] lg:min-h-[500px] flex flex-col items-center justify-center gap-8">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">ABOUT US</span>
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center max-w-[900px]">
          Building trust in Nigerian rentals
        </h1>
        <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[700px] leading-relaxed">
          RentCred is closing the trust gap between landlords, agents, and tenants — one verified report at a time.
        </p>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- OUR MISSION                                  -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-20">
        <div class="flex flex-col items-center gap-8">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">OUR MISSION</span>
          <h2 class="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center">Why RentCred exists</h2>
          <div class="max-w-[800px] text-center font-sans text-base text-muted-foreground" style="line-height: 1.7">
            <p class="mb-6">
              Nigeria's rental market relies on verbal references and personal connections. Landlords can't verify who they're renting to. Tenants have no portable proof of credibility. Agents are caught in the middle with no reliable tools.
            </p>
            <p>
              RentCred was built to change that. We provide technology-driven tenant verification that gives every party in the rental transaction the confidence to move forward.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- HOW WE WORK                                  -->
    <!-- ============================================ -->
    <section class="bg-background border-t border-border">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-20">
        <div class="flex flex-col items-center gap-8">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">HOW WE WORK</span>
          <h2 class="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center max-w-[800px]">
            Tech-enabled verification meets field operations
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full mt-4">
            <!-- Left -->
            <div class="flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[40px]">devices</span>
              <h3 class="font-mono text-xl font-bold text-foreground">Digital-first platform</h3>
              <p class="font-sans text-[15px] text-muted-foreground" style="line-height: 1.7">
                Agents submit tenant details online. Our system cross-references national databases, runs automated checks, and flags discrepancies in real time.
              </p>
            </div>
            <!-- Right -->
            <div class="flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[40px]">person_search</span>
              <h3 class="font-mono text-xl font-bold text-foreground">Boots on the ground</h3>
              <p class="font-sans text-[15px] text-muted-foreground" style="line-height: 1.7">
                Where databases fall short, our field verification team steps in — confirming addresses, contacting references, and validating employment in person.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- OUR VALUES — 4 cards                        -->
    <!-- ============================================ -->
    <section class="bg-background border-t border-border">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-20">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-3">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">OUR VALUES</span>
            <h2 class="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center">What we stand for</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div class="bg-card border border-border p-8 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">visibility</span>
              <h3 class="font-mono text-lg font-bold text-foreground">Transparency</h3>
              <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Every data point in our reports is sourced and traceable. No black boxes.</p>
            </div>
            <div class="bg-card border border-border p-8 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">target</span>
              <h3 class="font-mono text-lg font-bold text-foreground">Accuracy</h3>
              <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">We cross-reference multiple sources and deploy field agents to ensure every check is reliable.</p>
            </div>
            <div class="bg-card border border-border p-8 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">lock</span>
              <h3 class="font-mono text-lg font-bold text-foreground">Privacy</h3>
              <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Tenant data is handled with care, encrypted at rest, and shared only with authorized parties.</p>
            </div>
            <div class="bg-card border border-border p-8 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">balance</span>
              <h3 class="font-mono text-lg font-bold text-foreground">Fairness</h3>
              <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Our process treats every tenant equally — no bias, no shortcuts, just verified facts.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- PARTNER CTA                                  -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-10 lg:py-20">
        <div class="flex flex-col items-center justify-center gap-6">
          <h2 class="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">Partner with us</h2>
          <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[650px]">
            Whether you're an agent, a property manager, or a corporate landlord — we'd love to work with you.
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <NuxtLink to="/auth/register" class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-3.5 hover:opacity-90 transition-opacity font-sans w-full sm:w-auto text-center">
              Start Screening
            </NuxtLink>
            <NuxtLink to="/contact" class="text-white text-base px-8 py-3.5 border border-[#7A7A7A] hover:bg-white/10 transition-colors font-sans w-full sm:w-auto text-center">
              Contact Us
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
