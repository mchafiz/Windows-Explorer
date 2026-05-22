<script setup lang="ts">
defineProps<{ path: string }>()
</script>

<template>
  <div class="breadcrumb">
    <span class="path">{{ path || 'Select a folder' }}</span>
  </div>
</template>

<style scoped>
.breadcrumb {
  padding: 6px 12px;
  font-size: 12px;
  color: #555;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  min-height: 29px;
}
</style>
