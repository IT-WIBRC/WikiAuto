<template>
  <NuxtLink
    :to="path"
    :class="[
      'flex rounded-sm items-center relative py-2 px-4',
      { 'item-hover': !isSelected },
      { 'pr-9 gap-x-1.5': isOpened },
    ]"
    :data-cy="`item-${title.toLowerCase()}`"
  >
    <span
      v-if="isSelected"
      :class="[{ selected: isSelected, opened: isOpened }]"
      data-cy="selected-style"
    />
    <span class="inline-block relative">
      <component
        :is="MENU_ICONS[icon]"
        :class="['h-5 w-5', isSelected ? 'fill-primary' : 'fill-gray-400']"
        data-cy="menu-icon"
      />
    </span>
    <span
      v-if="isOpened"
      data-cy="menu-title"
      class="font-medium text-sm first-letter:uppercase"
      :class="[isSelected ? 'text-primary' : 'text-gray-400']"
    >
      {{ title }}
    </span>
  </NuxtLink>
</template>
<script lang="ts">
import { IconArticle, IconDashboard } from "#components";

export const MENU_ICONS = {
  DASHBOARD: markRaw(IconDashboard),
  CONTENT: markRaw(IconArticle),
} as const;

export default defineComponent({
  components: {
    IconDashboard,
  },
  props: {
    icon: {
      type: String as keyof typeof MENU_ICONS,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  setup: () => {
    return {
      MENU_ICONS,
    };
  },
});
</script>
<style scoped>
.selected {
  @apply absolute left-0 w-full h-full before:absolute before:content-[''] before:h-full before:w-7/12 before:left-0 before:inset-y-0 before:bg-[#788B9A]/20 before:rounded-r-[4.5px];
}

.opened {
  @apply before:w-1/5;
}

.item-hover:hover [data-cy="menu-title"] {
  @apply text-primary/60;
}

.item-hover:hover [data-cy="menu-icon"] {
  @apply fill-primary/60;
}
</style>
