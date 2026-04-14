<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Account Settings — RentCred' })

const authStore = useAuthStore()
const { getProfile } = useAgents()

const profile = reactive({
  fullName: authStore.user?.name ?? '',
  email: authStore.user?.email ?? '',
  phone: '',
  role: authStore.user?.role ?? 'Licensed Agent',
})

const passwords = reactive({
  current: '',
  new: '',
  confirm: '',
})

const company = ref({
  name: '',
  rcNumber: '',
  address: '',
  license: '',
})

const notifications = ref([
  { id: 'email', title: 'Email Notifications', desc: 'Receive case updates via email', enabled: true },
  { id: 'sms', title: 'SMS Alerts', desc: 'Get SMS for urgent notifications', enabled: true },
  { id: 'push', title: 'Push Notifications', desc: 'Browser push for real-time alerts', enabled: false },
  { id: 'digest', title: 'Weekly Report Digest', desc: 'Summary of weekly activity', enabled: false },
])

const loading = ref(true)

onMounted(async () => {
  try {
    const agentProfile = await getProfile() as any
    if (agentProfile) {
      profile.fullName = agentProfile.fullName ?? profile.fullName
      profile.email = agentProfile.email ?? profile.email
      profile.phone = agentProfile.phone ?? profile.phone
      profile.role = agentProfile.role ?? profile.role
      company.value = {
        name: agentProfile.companyName ?? '',
        rcNumber: agentProfile.rcNumber ?? '',
        address: agentProfile.address ?? '',
        license: agentProfile.license ?? '',
      }
    }
  } catch { /* empty */ }
  finally { loading.value = false }
})

const showEditProfile = ref(false)

function handleProfileSave(data: { firstName: string; lastName: string; email: string; phone: string; company: string }) {
  profile.fullName = `${data.firstName} ${data.lastName}`
  profile.email = data.email
  profile.phone = data.phone
  company.value.name = data.company
}

function toggleNotification(id: string) {
  const n = notifications.value.find(n => n.id === id)
  if (n) n.enabled = !n.enabled
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <h1 class="font-mono text-2xl font-semibold text-foreground" style="letter-spacing: -0.5px">Account Settings</h1>

    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Column -->
      <div class="flex-1 flex flex-col gap-6">
        <!-- Profile Card -->
        <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-6">
          <h2 class="font-mono text-base font-semibold text-foreground">Profile</h2>

          <div class="flex gap-6">
            <!-- Avatar -->
            <div class="w-[72px] h-[72px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span class="font-mono text-2xl font-semibold text-white">AO</span>
            </div>

            <!-- Profile Info -->
            <div class="flex flex-col gap-4 flex-1 min-w-0">
              <div class="flex flex-col gap-1">
                <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">FULL NAME</span>
                <span class="font-sans text-sm text-foreground">{{ profile.fullName }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">EMAIL</span>
                <span class="font-sans text-sm text-foreground">{{ profile.email }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">PHONE</span>
                <span class="font-sans text-sm text-foreground">{{ profile.phone }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">ROLE</span>
                <span class="inline-flex px-3 py-1 rounded-full bg-[#DFE6E1] text-[#004D1A] font-sans text-[12px] font-medium w-fit">{{ profile.role }}</span>
              </div>
            </div>
          </div>

          <button @click="showEditProfile = true" class="w-fit px-5 py-2.5 bg-foreground text-white font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">Edit Profile</button>
        </div>

        <!-- Security Card -->
        <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-5">
          <h2 class="font-mono text-base font-semibold text-foreground">Security</h2>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">CURRENT PASSWORD</label>
              <input v-model="passwords.current" type="password" placeholder="Enter current password" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">NEW PASSWORD</label>
              <input v-model="passwords.new" type="password" placeholder="Enter new password" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">CONFIRM PASSWORD</label>
              <input v-model="passwords.confirm" type="password" placeholder="Confirm new password" class="w-full h-[44px] px-3.5 bg-white border border-border rounded-lg text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <button class="w-fit px-5 py-2.5 bg-foreground text-white font-mono text-[13px] font-medium hover:opacity-90 transition-opacity">Update Password</button>
        </div>
      </div>

      <!-- Right Column -->
      <div class="w-full lg:w-[400px] flex flex-col gap-6">
        <!-- Company Information -->
        <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-5">
          <h2 class="font-mono text-base font-semibold text-foreground">Company Information</h2>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">COMPANY NAME</span>
              <span class="font-sans text-sm text-foreground">{{ company.name }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">RC NUMBER</span>
              <span class="font-sans text-sm text-foreground">{{ company.rcNumber }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">ADDRESS</span>
              <span class="font-sans text-sm text-foreground">{{ company.address }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">LICENSE NUMBER</span>
              <span class="font-sans text-sm text-foreground">{{ company.license }}</span>
            </div>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div class="bg-white border border-border rounded-lg p-7 flex flex-col gap-5">
          <h2 class="font-mono text-base font-semibold text-foreground">Notification Preferences</h2>

          <div class="flex flex-col">
            <div v-for="(notif, index) in notifications" :key="notif.id" class="flex items-center justify-between py-3.5" :class="index < notifications.length - 1 ? 'border-b border-border' : ''">
              <div class="flex flex-col gap-0.5">
                <span class="font-sans text-sm font-medium text-foreground">{{ notif.title }}</span>
                <span class="font-sans text-[12px] text-muted-foreground">{{ notif.desc }}</span>
              </div>
              <button
                class="w-10 h-[22px] rounded-full p-0.5 transition-colors flex-shrink-0"
                :class="notif.enabled ? 'bg-primary' : 'bg-border'"
                @click="toggleNotification(notif.id)"
              >
                <div class="w-[18px] h-[18px] rounded-full bg-white transition-transform" :class="notif.enabled ? 'translate-x-[18px]' : ''" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardEditProfileModal v-model="showEditProfile" :profile="profile" @save="handleProfileSave" />
  </div>
</template>
