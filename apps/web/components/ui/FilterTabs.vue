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
            ? 'border-b-2 border-primary text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
          : modelValue === tab.value
            ? 'bg-foreground text-background rounded-full'
            : 'bg-card border border-border text-muted-foreground hover:border-foreground/20 rounded-full',
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
