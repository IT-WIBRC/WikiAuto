<template>
  <div class="space-y-2">
    <label>
      <span class="block text-sm md:text-base font-medium text-slate-700">
        {{ label }}
        <span v-if="isRequired" data-test="wildcard" class="text-red-600"
          >*</span
        >
      </span>
    </label>
    <div class="flex gap-x-3 flex-wrap">
      <label
        v-for="status in statusList"
        :key="status"
        :for="status"
        data-cy="status"
        :data-cy-id="status.toLowerCase()"
        :class="[
          'text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-all ease-linear duration-100',
          status.toLowerCase(),
          { 'validated-selected': status === 'VALIDATED' && status === model },
          { 'pending-selected': status === 'PENDING' && status === model },
          { 'draft-selected': status === 'DRAFT' && status === model },
        ]"
        @click="setStatus(status)"
      >
        {{ t(status) }}
      </label>
    </div>
    <div v-if="errorMessage" data-cy="error" class="mt-2 text-pink-600 text-xs">
      {{ errorMessage }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { CONTENT_STATUS } from "~/api/types";

defineProps<{
  label: string;
  isRequired: boolean;
  errorMessage?: string;
}>();

const { t } = useI18n({
  useScope: "global",
});

const model = defineModel({
  type: String as PropType<keyof CONTENT_STATUS>,
  required: true,
  default: CONTENT_STATUS.DRAFT,
});

const statusList = Object.values(CONTENT_STATUS) as const;
const setStatus = (status: keyof CONTENT_STATUS): void => {
  model.value = status;
};
</script>
<style scoped>
.validated {
  @apply text-[#03A89E] bg-[#03A89E]/5 border border-[#03A89E];
}

.validated-selected {
  @apply text-black bg-[#03A89E] border border-[#03A89E] font-bold;
}

.pending {
  @apply text-orange-400 bg-orange-50 border border-orange-400;
}

.pending-selected {
  @apply text-black bg-orange-400 border border-orange-400 font-bold;
}

.draft {
  @apply text-yellow-400 bg-yellow-50 border border-yellow-400;
}

.draft-selected {
  @apply text-black bg-yellow-400 border border-yellow-400 font-bold;
}
</style>
