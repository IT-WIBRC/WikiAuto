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
      {{ t(text) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CONTENT_STATUS } from "~/api/types";
type STATUS_KEYS = keyof typeof CONTENT_STATUS;
type StatusTheme = Lowercase<STATUS_KEYS>;

defineProps<{
  text: STATUS_KEYS;
  theme: StatusTheme;
}>();

const { t } = useI18n({
  useScope: "global",
});

type Theme = Record<StatusTheme, { text: string; circle: string }>;
const themes: Theme = {
  validated: {
    text: "text-[#03A89E]/80",
    circle: "bg-[#03A89E]",
  },
  pending: {
    text: "text-orange-400/80",
    circle: "bg-orange-400",
  },
  draft: {
    text: "text-yellow-500/80",
    circle: "bg-yellow-400",
  },
};
</script>
