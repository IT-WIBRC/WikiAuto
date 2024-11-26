<template>
  <NuxtLink
    :to="path"
    :class="[
      'flex items-center gap-x-1.5 relative py-2',
      { 'text-[#3A36DB] rounded-sm px-4': isSelected },
      { 'text-[#3A36DB] rounded-sm pr-9': isOpened },
    ]"
    :data-cy="`item-${title}`"
  >
    <span
      v-if="isSelected"
      :class="[{ selected: isSelected, opened: isOpened }]"
      data-cy="selected-style"
    />
    <span class="inline-block w-1/2 relative">
      <component
        :is="MENU_ICONS[icon]"
        :class="['h-5 w-5', isSelected ? 'fill-[#3A36DB]' : 'fill-gray-400']"
        data-cy="menu-icon"
      />
    </span>
    <span
      v-if="isOpened"
      data-cy="menu-title"
      class="font-medium text-sm first-letter:uppercase"
    >
      {{ title }}
    </span>
  </NuxtLink>
</template>
<script lang="ts">
import { IconDashboard } from "#components";

export const MENU_ICONS = {
  DASHBOARD: markRaw(IconDashboard),
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
  @apply before:absolute before:content-[''] before:h-full before:w-7/12 before:left-0 before:inset-y-0 before:bg-[#788B9A]/20 before:rounded-r-[4.5px];
}

.opened {
  @apply before:w-1/5;
}
</style>
