<script setup lang="ts">
interface Tab {
  label: string
  value: string
}

interface Props {
  modelValue: string
  tabs: Tab[]
  variant?: 'underline' | 'pill'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div :class="['flex items-center overflow-x-auto scrollbar-hide', props.variant === 'underline' ? 'gap-1' : 'gap-2']">
    <button
      v-for="tab in props.tabs"
      :key="tab.value"
      :class="[
        'text-[13px] px-3 py-1.5 transition-colors whitespace-nowrap',
        props.variant === 'underline'
          ? modelValue === tab.value
            ? 'border-b-2 border-[#FF8400] text-[#111111] font-medium'
            : 'text-[#666666] hover:text-[#111111]'
          : modelValue === tab.value
            ? 'bg-[#111111] text-white rounded-full'
            : 'bg-white border border-[#CBCCC9] text-[#666666] hover:border-[#111111]/20 rounded-full',
      ]"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
