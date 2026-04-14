<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Option {
  label: string
  value: string
}

interface Props {
  modelValue: string
  options: Option[]
  icon?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 'w-auto',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const match = props.options.find((o) => o.value === props.modelValue)
  return match?.label ?? props.modelValue
})

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="dropdownRef" :class="['relative', props.width]">
    <button
      class="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBCCC9] rounded-lg text-sm cursor-pointer hover:border-[#111111]/20 transition-colors w-full"
      @click="open = !open"
    >
      <span v-if="props.icon" class="material-symbols-rounded text-[#666666] text-[18px]">{{ props.icon }}</span>
      <span class="flex-1 text-left">{{ selectedLabel }}</span>
      <span class="material-symbols-rounded text-[#666666] text-[18px]">keyboard_arrow_down</span>
    </button>
    <div
      v-if="open"
      class="absolute top-full left-0 mt-1 bg-white border border-[#CBCCC9] rounded-lg shadow-lg py-1 z-50 min-w-[160px] w-full"
    >
      <div
        v-for="option in props.options"
        :key="option.value"
        :class="[
          'px-3 py-2 text-sm hover:bg-[#F2F3F0] cursor-pointer',
          modelValue === option.value ? 'text-[#FF8400] font-medium' : 'text-[#111111]',
        ]"
        @click="select(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>
