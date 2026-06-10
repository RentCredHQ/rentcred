<script setup lang="ts">
const props = defineProps<{
  w?: string | number
  h?: string | number
  rounded?: string
}>()

const style = computed(() => ({
  width: typeof props.w === 'number' ? `${props.w}px` : (props.w || '100%'),
  height: typeof props.h === 'number' ? `${props.h}px` : (props.h || '14px'),
  borderRadius: props.rounded,
}))
</script>

<template>
  <div class="rc-skel" :style="style" />
</template>
