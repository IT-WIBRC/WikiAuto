<template>
  <div class="flex gap-x-2 items-center">
    <Badge
      v-for="badge in displayedBadges"
      :key="badge"
      :text="badge"
      :data-cy="badge"
    />
    <div
      v-if="remainingBadges !== 0"
      class="font-dm-sans text-xs font-semibold min-h-7 min-w-7 max-w-9 max-h-9 flex items-center justify-center border rounded-full bg-gray-200 text-primary-text/60"
      data-cy="remainingBadges"
    >
      +{{ remainingBadges }}
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  badges: Array<string>;
  badgeLengthOnLG: number;
  badgeLengthOnXL: number;
  badgeLengthOnMoreThanXL: number;
}>();

const displayedBadges = reactive<string[]>([]);
const setTheNumberOfBadgeToDisplay = (): void => {
  const width = window.innerWidth;
  displayedBadges.splice(0);

  if (width > 1535) {
    displayedBadges.push(
      ...props.badges.slice(0, props.badgeLengthOnMoreThanXL),
    );
  } else if (width > 1279 && width < 1536) {
    displayedBadges.push(...props.badges.slice(0, props.badgeLengthOnXL));
  } else {
    displayedBadges.push(...props.badges.slice(0, props.badgeLengthOnLG));
  }
};

const remainingBadges = computed<number>(
  () => props.badges.slice(displayedBadges.length).length,
);

onMounted(() => {
  setTheNumberOfBadgeToDisplay();
  window.addEventListener("resize", setTheNumberOfBadgeToDisplay);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setTheNumberOfBadgeToDisplay);
});
</script>
