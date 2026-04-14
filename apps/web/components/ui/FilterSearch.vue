<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  width: 'w-[240px]',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBCCC9] rounded-lg w-full lg:w-[240px]">
    <span class="material-symbols-rounded text-[#666666] text-[18px]">search</span>
    <input
      :value="modelValue"
      :placeholder="props.placeholder"
      class="flex-1 text-sm outline-none bg-transparent placeholder:text-[#666666]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
