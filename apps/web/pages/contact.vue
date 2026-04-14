<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Contact — RentCred', description: 'Get in touch with the RentCred team.' })

const form = reactive({ name: '', email: '', subject: '', message: '' })
const submitted = ref(false)

function handleSubmit() {
  submitted.value = true
}
</script>

<template>
  <div>
    <!-- ============================================ -->
    <!-- HERO                                         -->
    <!-- ============================================ -->
    <section class="bg-[#0D0D0D] px-5 sm:px-8 lg:px-20 py-10 lg:py-16 min-h-[auto] lg:min-h-[400px] flex flex-col items-center justify-center gap-6">
      <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">CONTACT</span>
      <h1 class="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center">Get in touch</h1>
      <p class="font-sans text-lg text-[#7A7A7A] text-center max-w-[600px]">
        Have questions about RentCred? We'd love to hear from you.
      </p>
    </section>

    <!-- ============================================ -->
    <!-- CONTACT FORM + INFO                          -->
    <!-- ============================================ -->
    <section class="bg-background px-5 sm:px-8 lg:px-[120px] py-10 lg:py-20">
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <!-- Form -->
        <div class="flex-1">
          <div v-if="!submitted">
            <h2 class="font-mono text-2xl font-bold text-foreground mb-6">Send us a message</h2>
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <label class="font-sans text-sm font-medium text-foreground">Full Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Your name"
                  required
                  class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-sans text-sm font-medium text-foreground">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-sans text-sm font-medium text-foreground">Subject</label>
                <input
                  v-model="form.subject"
                  type="text"
                  placeholder="How can we help?"
                  required
                  class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-sans text-sm font-medium text-foreground">Message</label>
                <textarea
                  v-model="form.message"
                  rows="5"
                  placeholder="Tell us more..."
                  required
                  class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-[#FF8400] text-[#0D0D0D] font-semibold text-base py-3.5 hover:opacity-90 transition-opacity font-sans"
              >
                Send Message
              </button>
            </form>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-4 min-h-[400px]">
            <span class="material-symbols-rounded text-[#FF8400] text-5xl">check_circle</span>
            <h3 class="font-mono text-2xl font-bold text-foreground">Message sent!</h3>
            <p class="font-sans text-muted-foreground text-center">We'll get back to you within 24 hours.</p>
          </div>
        </div>

        <!-- Contact Info Cards -->
        <div class="w-full lg:w-[400px] flex flex-col gap-6">
          <h2 class="font-mono text-2xl font-bold text-foreground">Contact information</h2>

          <div class="bg-card border border-border p-6 flex items-start gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-2xl">mail</span>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[13px] font-semibold text-foreground">Email</span>
              <span class="font-sans text-sm text-muted-foreground">hello@rentcred.ng</span>
            </div>
          </div>

          <div class="bg-card border border-border p-6 flex items-start gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-2xl">call</span>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[13px] font-semibold text-foreground">Phone</span>
              <span class="font-sans text-sm text-muted-foreground">+234 801 234 5678</span>
            </div>
          </div>

          <div class="bg-card border border-border p-6 flex items-start gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-2xl">location_on</span>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[13px] font-semibold text-foreground">Address</span>
              <span class="font-sans text-sm text-muted-foreground">Lagos, Nigeria</span>
            </div>
          </div>

          <div class="bg-card border border-border p-6 flex items-start gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-2xl">schedule</span>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[13px] font-semibold text-foreground">Business Hours</span>
              <span class="font-sans text-sm text-muted-foreground">Mon – Fri, 9:00 AM – 6:00 PM WAT</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- FAQ                                          -->
    <!-- ============================================ -->
    <section class="bg-background px-5 sm:px-8 lg:px-[120px] py-10 lg:py-20 border-t border-border">
      <div class="flex flex-col items-center gap-12">
        <div class="flex flex-col items-center gap-3">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">FAQ</span>
          <h2 class="font-mono text-4xl font-bold text-foreground text-center">Frequently asked questions</h2>
        </div>

        <div class="w-full max-w-[800px] flex flex-col">
          <!-- Q1 -->
          <div class="py-6 border-b border-border flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="font-mono text-base font-semibold text-foreground">What is RentCred?</h3>
              <span class="material-symbols-rounded text-muted-foreground text-xl">add</span>
            </div>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">
              RentCred is a tenant verification platform that helps Nigerian landlords and agents make informed rental decisions through identity, employment, reference, and address checks.
            </p>
          </div>
          <!-- Q2 -->
          <div class="py-6 border-b border-border flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="font-mono text-base font-semibold text-foreground">How long does a verification take?</h3>
              <span class="material-symbols-rounded text-muted-foreground text-xl">add</span>
            </div>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">
              Most verifications are completed within 24–48 hours. Complex cases involving field verification may take up to 72 hours.
            </p>
          </div>
          <!-- Q3 -->
          <div class="py-6 border-b border-border flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="font-mono text-base font-semibold text-foreground">Is my tenant's data secure?</h3>
              <span class="material-symbols-rounded text-muted-foreground text-xl">add</span>
            </div>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">
              Yes. All data is encrypted, stored securely, and only shared with authorized parties. We are fully NDPR compliant.
            </p>
          </div>
          <!-- Q4 -->
          <div class="py-6 border-b border-border flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="font-mono text-base font-semibold text-foreground">Can landlords request reports directly?</h3>
              <span class="material-symbols-rounded text-muted-foreground text-xl">add</span>
            </div>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">
              Currently, reports are submitted through registered agents. Landlords can ask their agent to initiate a check, or register directly on our platform.
            </p>
          </div>
          <!-- Q5 -->
          <div class="py-6 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="font-mono text-base font-semibold text-foreground">How much does a verification cost?</h3>
              <span class="material-symbols-rounded text-muted-foreground text-xl">add</span>
            </div>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">
              Pricing depends on the check level — Basic, Standard, or Premium. Agents can also purchase bundles for volume discounts. Visit our pricing page for details.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
