<script setup lang="ts">
// Default layout for marketing/public pages
const route = useRoute()
const mobileMenuOpen = ref(false)

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'For Landlords', to: '/for-landlords' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 bg-[#0D0D0D]">
      <nav class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-4 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <UiRentCredLogo :size="28" variant="dark" :show-text="true" :horizontal="true" />
        </NuxtLink>

        <!-- Desktop Nav Links -->
        <div class="hidden lg:flex items-center gap-8">
          <a href="#how-it-works" class="text-white/80 hover:text-white transition-colors text-sm font-sans">
            How It Works
          </a>
          <a href="#pricing" class="text-white/80 hover:text-white transition-colors text-sm font-sans">
            Pricing
          </a>
          <NuxtLink to="/for-landlords" class="text-white/80 hover:text-white transition-colors text-sm font-sans">
            For Landlords
          </NuxtLink>
        </div>

        <!-- Desktop Buttons -->
        <div class="hidden lg:flex items-center gap-3">
          <NuxtLink
            to="/auth/login"
            class="text-white text-sm px-6 py-2.5 border border-[#7A7A7A] hover:border-white transition-colors"
          >
            Login
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="bg-[#FF8400] text-[#0D0D0D] text-sm font-semibold px-6 py-2.5 hover:opacity-90 transition-opacity"
          >
            Start Screening
          </NuxtLink>
        </div>

        <!-- Mobile Hamburger -->
        <button class="lg:hidden text-white" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="material-symbols-rounded text-[24px]">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </nav>
    </header>

    <!-- Mobile Slide-out Menu -->
    <Teleport to="body">
      <Transition name="mobileoverlay">
        <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 bg-black/60 z-[60]" @click="mobileMenuOpen = false" />
      </Transition>
      <Transition name="mobilenav">
        <div v-if="mobileMenuOpen" class="lg:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-[#0D0D0D] border-l border-[#2E2E2E] z-[61] flex flex-col overflow-y-auto">
          <!-- Menu Header -->
          <div class="flex items-center justify-between px-5 py-5 border-b border-[#2E2E2E]">
            <UiRentCredLogo :size="22" variant="dark" :show-text="true" :horizontal="true" />
            <button class="text-white/60 hover:text-white" @click="mobileMenuOpen = false">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <!-- Nav Links -->
          <nav class="flex flex-col py-4 flex-1">
            <template v-for="link in navLinks" :key="link.label">
              <a v-if="link.href" :href="link.href" class="px-5 py-3.5 text-white/80 hover:text-white hover:bg-white/5 font-sans text-[15px] transition-colors" @click="mobileMenuOpen = false">
                {{ link.label }}
              </a>
              <NuxtLink v-else :to="link.to!" class="px-5 py-3.5 text-white/80 hover:text-white hover:bg-white/5 font-sans text-[15px] transition-colors">
                {{ link.label }}
              </NuxtLink>
            </template>
          </nav>

          <!-- Menu Footer Buttons -->
          <div class="flex flex-col gap-3 px-5 py-5 border-t border-[#2E2E2E]">
            <NuxtLink
              to="/auth/login"
              class="text-white text-sm text-center px-6 py-3 border border-[#7A7A7A] hover:border-white transition-colors"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="bg-[#FF8400] text-[#0D0D0D] text-sm font-semibold text-center px-6 py-3 hover:opacity-90 transition-opacity"
            >
              Start Screening
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </Teleport>

    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[#0D0D0D] border-t border-[#2E2E2E]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-20 py-8 lg:py-12 flex flex-col gap-8 lg:gap-12">
        <!-- Footer Top -->
        <div class="flex flex-col lg:flex-row lg:justify-between gap-8">
          <!-- Brand -->
          <div class="flex flex-col gap-4 max-w-[300px]">
            <UiRentCredLogo :size="28" variant="dark" :show-text="true" :horizontal="true" />
            <p class="text-[#7A7A7A] text-[13px] font-sans leading-relaxed">
              The verification platform for Nigeria's real estate agents.
            </p>
          </div>

          <!-- Footer Links -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-20">
            <div class="flex flex-col gap-3">
              <span class="text-white font-mono text-[13px] font-semibold">Product</span>
              <a href="#how-it-works" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">How It Works</a>
              <a href="#pricing" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">Bundle Pricing</a>
              <NuxtLink to="/for-landlords" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">For Landlords</NuxtLink>
              <NuxtLink to="/status" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">Status Tracker</NuxtLink>
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-white font-mono text-[13px] font-semibold">Company</span>
              <NuxtLink to="/about" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">About</NuxtLink>
              <NuxtLink to="/contact" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">Contact</NuxtLink>
              <NuxtLink to="/careers" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">Careers</NuxtLink>
            </div>
            <div class="flex flex-col gap-3 col-span-2 lg:col-span-1">
              <span class="text-white font-mono text-[13px] font-semibold">Legal</span>
              <NuxtLink to="/privacy" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">Privacy Policy</NuxtLink>
              <NuxtLink to="/terms" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">Terms of Service</NuxtLink>
              <NuxtLink to="/ndpr" class="text-[#7A7A7A] font-sans text-[13px] hover:text-white/80">NDPR Compliance</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-[#2E2E2E]" />

        <!-- Copyright -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span class="text-[#7A7A7A] font-sans text-xs">&copy; 2026 RentCred Technologies Ltd.</span>
          <span class="text-[#7A7A7A] font-sans text-xs">NDPR Registered &bull; Lagos, Nigeria</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.mobileoverlay-enter-active,
.mobileoverlay-leave-active {
  transition: opacity 0.25s ease;
}
.mobileoverlay-enter-from,
.mobileoverlay-leave-to {
  opacity: 0;
}
.mobilenav-enter-active,
.mobilenav-leave-active {
  transition: transform 0.3s ease;
}
.mobilenav-enter-from,
.mobilenav-leave-to {
  transform: translateX(100%);
}
</style>
