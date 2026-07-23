<script setup lang="ts">
definePageMeta({ colorMode: 'light', layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Tenant invitation emails link here with ?email=…&role=tenant. Both were
// ignored and the role was hardcoded to 'agent', so every invited tenant was
// signed up as an agent, sent into KYB, and could never see their verification.
const isTenantInvite = computed(() => route.query.role === 'tenant')
const invitedEmail = computed(() => (route.query.email as string) || '')

const form = reactive({
  name: '',
  email: invitedEmail.value,
  phone: '',
  password: '',
  agreeTerms: false,
})
const showPassword = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''

  if (!form.agreeTerms) {
    error.value = 'You must agree to the Terms of Service and Privacy Policy'
    return
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/
  if (!passwordRegex.test(form.password)) {
    error.value = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&#)'
    return
  }

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      role: isTenantInvite.value ? 'tenant' : 'agent',
    })
    // Tenants go to their portal; agents still have KYB to complete.
    if (authStore.user?.role === 'tenant') {
      router.push('/tenant')
    } else {
      router.push('/settings/kyb')
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Registration failed. Please try again.'
  }
}
</script>

<template>
  <div>
    <h1 class="font-mono text-[28px] font-bold text-foreground mb-2">
      {{ isTenantInvite ? 'Complete your tenant profile' : 'Create your account' }}
    </h1>
    <p class="font-sans text-[15px] text-muted-foreground mb-8">
      {{ isTenantInvite
        ? 'Your agent has started a verification for you. Create your account to track it and view your report.'
        : 'Create your profile to start verifying tenants with confidence.' }}
    </p>

    <div v-if="error" class="bg-st-red-bg border border-st-red-text/20 text-st-red-text text-sm font-sans px-4 py-3 mb-6">
      {{ error }}
    </div>

    <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
      <div>
        <label class="block text-sm font-sans font-medium text-foreground mb-2">Full Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="John Doe"
          required
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-sans font-medium text-foreground mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="you@company.com"
          required
          :readonly="isTenantInvite && !!invitedEmail"
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors read-only:bg-surface read-only:text-muted-foreground"
        />
        <!-- The verification is keyed to this address, so it must not be edited. -->
        <p v-if="isTenantInvite && invitedEmail" class="mt-2 text-xs font-sans text-muted-foreground">
          This is the address your verification was sent to.
        </p>
      </div>

      <div>
        <label class="block text-sm font-sans font-medium text-foreground mb-2">Phone Number</label>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="+234 812 345 6789"
          required
          class="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-sans font-medium text-foreground mb-2">Password</label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Uppercase, lowercase, number, special char"
            required
            class="w-full px-4 py-3 pr-16 border border-border bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#FF8400] transition-colors"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-medium text-muted-foreground hover:text-foreground transition-colors select-none"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>

      <!-- Terms checkbox -->
      <label class="flex items-start gap-3 cursor-pointer">
        <input v-model="form.agreeTerms" type="checkbox" class="mt-1 accent-[#FF8400]" />
        <span class="text-sm font-sans text-muted-foreground">
          I agree to the
          <NuxtLink to="/terms" class="text-[#FF8400] hover:underline">Terms of Service</NuxtLink>
          and
          <NuxtLink to="/privacy" class="text-[#FF8400] hover:underline">Privacy Policy</NuxtLink>
        </span>
      </label>

      <button
        type="submit"
        class="w-full py-3 bg-[#FF8400] text-[#0D0D0D] font-sans font-semibold text-base hover:opacity-90 transition-opacity"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm font-sans text-muted-foreground">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-[#FF8400] hover:underline">Sign In</NuxtLink>
    </p>
  </div>
</template>
