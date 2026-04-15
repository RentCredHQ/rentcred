<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'About — RentCred', description: 'Building trust in Nigerian rentals.' })
</script>

<template>
  <div>
    <!-- ============================================ -->
    <!-- HERO (dark)                                  -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28 flex flex-col items-center gap-8">
        <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">ABOUT US</span>
        <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-semibold text-white text-center max-w-[900px]">
          Building trust in Nigerian rentals
        </h1>
        <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[700px] leading-relaxed">
          RentCred is closing the trust gap between landlords, agents, and tenants — one verified report at a time.
        </p>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- OUR MISSION (light)                          -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-8">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">OUR MISSION</span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">
            Closing the verification gap
          </h2>
          <div class="max-w-[800px] text-center font-sans text-base text-muted-foreground leading-[1.7]">
            <p class="mb-6">
              In Nigeria, rental decisions still hinge on verbal references and personal connections. Landlords have no reliable way to verify a prospective tenant's identity, employment, or rental history — and tenants have no portable proof of credibility to offer. Agents sit in the middle, shouldering risk they can't quantify.
            </p>
            <p>
              RentCred replaces guesswork with verified data. We combine NIN and BVN cross-referencing, employer confirmation, and on-the-ground address checks to produce a single, standardised tenant report that every party in the transaction can trust.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- BY THE NUMBERS (dark)                        -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-4">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">IMPACT</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-white">
              Built for scale. Trusted by agents.
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2">
              <span class="font-mono text-3xl sm:text-4xl font-semibold text-[#FF8400]">200+</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Agents</span>
            </div>
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2">
              <span class="font-mono text-3xl sm:text-4xl font-semibold text-[#FF8400]">1,000+</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Verifications</span>
            </div>
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2">
              <span class="font-mono text-3xl sm:text-4xl font-semibold text-[#FF8400]">36</span>
              <span class="font-sans text-sm text-[#7A7A7A]">States Covered</span>
            </div>
            <div class="bg-[#161616] border border-[#2A2A2A] p-7 flex flex-col items-center gap-2">
              <span class="font-mono text-3xl sm:text-4xl font-semibold text-[#FF8400]">48hr</span>
              <span class="font-sans text-sm text-[#7A7A7A]">Average SLA</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- OUR VALUES (light)                           -->
    <!-- ============================================ -->
    <section class="bg-background">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center gap-12">
          <div class="flex flex-col items-center gap-4">
            <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">OUR VALUES</span>
            <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-foreground">
              What we stand for
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">visibility</span>
              <h3 class="font-mono text-lg font-semibold text-foreground">Transparency</h3>
              <p class="font-sans text-sm text-muted-foreground leading-[1.6]">
                Every data point in our reports links to a verified source. Agents and landlords see exactly how each check was completed.
              </p>
            </div>
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">target</span>
              <h3 class="font-mono text-lg font-semibold text-foreground">Accuracy</h3>
              <p class="font-sans text-sm text-muted-foreground leading-[1.6]">
                We cross-reference NIN, BVN, and employer records. Field agents physically inspect addresses — no database-only shortcuts.
              </p>
            </div>
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">lock</span>
              <h3 class="font-mono text-lg font-semibold text-foreground">Privacy</h3>
              <p class="font-sans text-sm text-muted-foreground leading-[1.6]">
                Tenant data is encrypted at rest, transmitted over TLS, and shared only with the requesting agent. Full NDPR compliance.
              </p>
            </div>
            <div class="border border-border p-7 flex flex-col gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[32px]">balance</span>
              <h3 class="font-mono text-lg font-semibold text-foreground">Fairness</h3>
              <p class="font-sans text-sm text-muted-foreground leading-[1.6]">
                Every tenant is scored by the same criteria. No bias, no shortcuts — verified facts only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- PARTNER CTA (dark)                           -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-16 lg:py-28">
        <div class="flex flex-col items-center justify-center gap-6">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase">GET STARTED</span>
          <h2 class="font-mono text-2xl sm:text-[28px] lg:text-[32px] font-medium tracking-tight text-center text-white">
            Partner with us
          </h2>
          <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[650px] leading-relaxed">
            Whether you're an independent agent, a property management firm, or a corporate landlord — RentCred gives you the verified tenant data you need to make confident leasing decisions.
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <NuxtLink to="/auth/register" class="bg-[#FF8400] text-[#0D0D0D] font-semibold text-base px-8 py-3.5 hover:bg-[#E67700] transition-colors font-sans w-full sm:w-auto text-center">
              Start Screening
            </NuxtLink>
            <NuxtLink to="/contact" class="text-white/90 text-base px-8 py-3.5 border border-[#3A3A3A] hover:bg-white/10 transition-colors font-sans w-full sm:w-auto text-center">
              Contact Us
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
