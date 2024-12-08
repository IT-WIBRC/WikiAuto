<template>
  <div class="bg-[#BF0404] p-2 text-white rounded font-medium text-sm">
    {{ message }}
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  message: string;
}>();
</script>
