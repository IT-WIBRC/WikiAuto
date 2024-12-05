<template>
  <img
    :src="useImageAsset(name)"
    :alt="alt"
    :loading="loading"
    :fetchpriority="fetchPriority"
  />
</template>

<script setup lang="ts">
import type { PropType } from "vue";

type Priority = "low" | "high" | "auto";
type LoadingStrategy = "lazy" | "eager";

defineProps({
  name: {
    type: String,
    required: true,
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
