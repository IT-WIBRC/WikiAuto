<template>
  <ul
    data-test="options"
    class="w-full p-3 rounded-md bg-white space-y-1.5 font-medium max-h-[300px] scroll border border-gray-300"
  >
    <li v-if="areBadgeListLoading" class="relative">
      <LazyLoaderFade
        class="before:border-t-primary h-6 w-6 before:w-6 before:h-6 before:inset-x-1/2"
      />
    </li>
    <template v-else>
      <li
        v-for="option in options"
        :key="option.identifier"
        class="hover:bg-primary/45 hover:text-white rounded-md py-2 pl-3 duration-75 ease-in cursor-pointer flex items-center gap-x-2"
        :data-test-id="`option-${option.identifier}`"
        data-test="option"
        @click.stop="$emit('selectedBadge', option)"
      >
        <input
          type="checkbox"
          :value="option.displayedValue"
          class="p-2 caret-blue-800 font-semibold"
          :checked="option.isSelected"
        />
        <span class="capitalize">
          {{ option.displayedValue }}
        </span>
      </li>
      <li
        v-if="!options.length"
        class="py-1 pl-3 text-sm space-x-2"
        data-test="no-data"
      >
        <button
          v-if="useString.toPre(searchingText).length > 0"
          class="font-semibold text-center"
          type="button"
          data-test="create-badge"
          @click.stop="$emit('openCreationForm')"
        >
          {{ t("create") }} <strong>&laquo;{{ searchingText }}&raquo;</strong>
        </button>
        <div v-else class="text-center">{{ t("no_badges") }}</div>
      </li>
    </template>
  </ul>
</template>
<script setup lang="ts">
import type { BadgeToOptionForList } from "~/components/select/type";

defineProps<{
  areBadgeListLoading: boolean;
  options: BadgeToOptionForList[];
  searchingText?: string;
}>();

defineEmits<{
  (e: "openCreationForm"): void;
  (e: "selectedBadge", badgeSelected: BadgeToOptionForList): void;
}>();

const { t } = useI18n({
  useScope: "local",
  messages: {
    fr: {
      create: "Crée un nouveau sujet",
      no_badges: "Aucun Badge crée",
    },
    en: {
      create: "Create new topic",
      no_badges: "No Badge created",
    },
  },
});
</script>
