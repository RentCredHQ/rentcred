<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'NDPR Compliance — RentCred' })
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-[#0D0D0D] px-20 py-16 flex flex-col items-center gap-4">
      <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">DATA PROTECTION</span>
      <h1 class="font-mono text-[40px] font-medium text-white text-center" style="letter-spacing: -1px">NDPR Compliance</h1>
      <p class="font-sans text-base text-[#7A7A7A] text-center max-w-[600px]">How RentCred meets the Nigeria Data Protection Regulation (NDPR) 2019</p>
    </section>

    <!-- Body -->
    <section class="bg-background px-[120px] py-16">
      <div class="flex flex-col gap-12">
        <!-- Intro -->
        <div class="flex flex-col items-center gap-4">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">OUR COMMITMENT</span>
          <p class="font-sans text-base text-foreground text-center max-w-[800px]" style="line-height: 1.6">
            RentCred is committed to full compliance with the Nigeria Data Protection Regulation (NDPR) 2019 and all applicable data protection laws.
          </p>
        </div>

        <!-- Cards Row 1 -->
        <div class="grid grid-cols-3 gap-6">
          <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">verified_user</span>
            <h3 class="font-mono text-base font-semibold text-foreground">NITDA Registration</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">RentCred is registered with the National Information Technology Development Agency (NITDA) as both a Data Controller and Data Processor, as required by Section 4 of the NDPR.</p>
          </div>
          <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">how_to_reg</span>
            <h3 class="font-mono text-base font-semibold text-foreground">Explicit Consent</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">We obtain explicit, informed consent from every tenant before any data processing begins. Consent is captured with a timestamp and IP address, along with a clear privacy notice explaining data use.</p>
          </div>
          <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">person</span>
            <h3 class="font-mono text-base font-semibold text-foreground">Data Protection Officer</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">We have appointed a Data Protection Officer (DPO) responsible for overseeing our data protection strategy and ensuring NDPR compliance. Contact: <a href="mailto:dpo@rentcred.ng" class="text-[#FF8400] hover:underline">dpo@rentcred.ng</a></p>
          </div>
        </div>

        <!-- Cards Row 2 -->
        <div class="grid grid-cols-3 gap-6">
          <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">lock</span>
            <h3 class="font-mono text-base font-semibold text-foreground">Data Security</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">We implement industry-standard encryption (AES-256 at rest, TLS 1.3 in transit), role-based access controls, regular penetration testing, and secure cloud infrastructure hosted in compliance with Nigerian data residency requirements.</p>
          </div>
          <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">delete_sweep</span>
            <h3 class="font-mono text-base font-semibold text-foreground">Data Retention & Deletion</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">Personal data is retained only for the duration necessary to fulfill the verification purpose. Tenants can request data deletion at any time, and we process all deletion requests within 72 hours as required by the NDPR.</p>
          </div>
          <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-4">
            <span class="material-symbols-rounded text-[#FF8400] text-[32px]">notification_important</span>
            <h3 class="font-mono text-base font-semibold text-foreground">Breach Notification</h3>
            <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">In the event of a data breach, RentCred will notify NITDA within 72 hours and affected data subjects without undue delay, as mandated by Article 2.11 of the NDPR Implementation Framework.</p>
          </div>
        </div>

        <!-- Rights Section -->
        <div class="flex flex-col gap-6">
          <span class="font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px]">YOUR RIGHTS</span>
          <h2 class="font-mono text-2xl font-semibold text-foreground">Data Subject Rights Under NDPR</h2>
          <p class="font-sans text-[15px] text-muted-foreground" style="line-height: 1.6">Under the Nigeria Data Protection Regulation, you have the following rights regarding your personal data:</p>

          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[22px] mt-0.5">check_circle</span>
              <p class="font-sans text-sm text-foreground" style="line-height: 1.6">Right of Access — You can request a copy of all personal data we hold about you, and we will respond within 30 days.</p>
            </div>
            <div class="flex items-start gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[22px] mt-0.5">check_circle</span>
              <p class="font-sans text-sm text-foreground" style="line-height: 1.6">Right to Rectification — You can request correction of any inaccurate or incomplete personal data.</p>
            </div>
            <div class="flex items-start gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[22px] mt-0.5">check_circle</span>
              <p class="font-sans text-sm text-foreground" style="line-height: 1.6">Right to Deletion — You can request erasure of your personal data when it is no longer necessary for the original purpose.</p>
            </div>
            <div class="flex items-start gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[22px] mt-0.5">check_circle</span>
              <p class="font-sans text-sm text-foreground" style="line-height: 1.6">Right to Withdraw Consent — You may withdraw consent at any time without affecting the lawfulness of prior processing.</p>
            </div>
            <div class="flex items-start gap-4">
              <span class="material-symbols-rounded text-[#FF8400] text-[22px] mt-0.5">check_circle</span>
              <p class="font-sans text-sm text-foreground" style="line-height: 1.6">Right to Lodge a Complaint — You can file a complaint with NITDA if you believe your data protection rights have been violated.</p>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="bg-white border border-border rounded-lg p-8 flex flex-col gap-5">
          <h3 class="font-mono text-lg font-semibold text-foreground">How to Exercise Your Rights</h3>
          <p class="font-sans text-sm text-muted-foreground" style="line-height: 1.6">To exercise any of the above rights, or if you have questions about our data protection practices, please contact our Data Protection Officer:</p>
          <div class="flex flex-col gap-2">
            <span class="font-sans text-sm font-medium text-foreground">Email: dpo@rentcred.ng</span>
            <span class="font-sans text-sm font-medium text-foreground">Phone: +234 1 888 0000</span>
            <span class="font-sans text-sm font-medium text-foreground">Address: 42 Admiralty Way, Lekki Phase 1, Lagos, Nigeria</span>
          </div>
          <p class="font-sans text-[13px] text-muted-foreground" style="line-height: 1.6">We will respond to all data subject requests within 30 days. If we cannot fulfill your request within this period, we will notify you of the delay and provide a revised timeline.</p>
        </div>
      </div>
    </section>
  </div>
</template>
