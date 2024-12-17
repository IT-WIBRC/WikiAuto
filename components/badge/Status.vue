<template>
  <div class="flex items-center gap-x-1.5">
    <div
      :class="['h-1.5 w-1.5 bg-green-500 rounded-full', themes[theme].circle]"
      data-cy="badge-circle"
    />
    <div
      :class="[
        'font-dm-sans lowercase first-letter:uppercase',
        themes[theme].text,
      ]"
      data-cy="badge-title"
    >
      {{ text }}
    </div>
  </div>
</template>
<script setup lang="ts">
type StatusTheme = "validated";

defineProps<{
  text: string;
  theme: StatusTheme;
}>();

type Theme = Record<StatusTheme, { text: string; circle: string }>;
const themes = reactive<Theme>({
  validated: {
    text: "text-[#03A89E]/80",
    circle: "bg-[#03A89E]",
  },
});
</script>
