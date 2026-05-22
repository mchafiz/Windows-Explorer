<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input
      v-model="model"
      type="text"
      placeholder="Search folders and files..."
      class="search-input"
      data-testid="search-input"
    />
    <button
      v-if="model"
      class="clear-btn"
      data-testid="clear-btn"
      aria-label="Clear search"
      @click="model = ''"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}
.search-icon { font-size: 13px; color: #888; }
.search-input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  outline: none;
  background: #fff;
}
.search-input:focus { border-color: #0078d4; box-shadow: 0 0 0 2px rgba(0,120,212,0.1); }
.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
}
.clear-btn:hover { background: #e0e0e0; }
</style>
