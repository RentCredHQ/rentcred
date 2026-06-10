<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 5 })
</script>

<template>
  <div class="px-5">
    <div
      v-for="i in rows"
      :key="i"
      class="flex items-center gap-4 py-3.5"
      :class="i < rows ? 'border-b border-border' : ''"
    >
      <UiSkeleton w="84px" h="12px" />
      <div class="flex-1 flex flex-col gap-2">
        <UiSkeleton w="56%" h="13px" />
        <UiSkeleton w="34%" h="10px" />
      </div>
      <UiSkeleton w="88px" h="22px" rounded="999px" />
      <UiSkeleton w="56px" h="12px" />
    </div>
  </div>
</template>
