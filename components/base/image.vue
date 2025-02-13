<template>
  <img
    :src="srcUrl ? srcUrl : useImageAsset(name)"
    :alt="alt"
    :loading="loading"
    :fetchpriority="fetchPriority"
  />
</template>

<script setup lang="ts">
type Priority = "low" | "high" | "auto";
type LoadingStrategy = "lazy" | "eager";

defineProps({
  name: {
    type: String,
    required: true,
  },
  // eslint-disable-next-line vue/require-default-prop
  srcUrl: {
    type: String,
    required: false,
  },
  alt: {
    type: String,
    default: "The image provided is not right",
  },
  loading: {
    type: String as PropType<LoadingStrategy>,
    default: "lazy",
  },
  fetchPriority: {
    type: String as PropType<Priority>,
    default: "auto",
    validator(value: string): boolean {
      return ["low", "high", "auto"].includes(value);
    },
  },
});
</script>
