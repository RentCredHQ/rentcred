<script setup lang="ts">
import { statusHue, statusLabel, type StatusHue } from '~/composables/useStatus'

const props = defineProps<{
  /** Raw status string — used to derive hue and (fallback) label. */
  status?: string
  /** Force a specific hue regardless of status. */
  hue?: StatusHue
  /** Override the displayed text (e.g. a pre-localized label). */
  label?: string
}>()

const pillHue = computed<StatusHue>(() => props.hue ?? statusHue(props.status))
const text = computed(() => props.label ?? statusLabel(props.status))
</script>

<template>
  <span class="rc-pill" :class="`rc-pill-${pillHue}`">{{ text }}</span>
</template>
