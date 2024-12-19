<template>
  <div class="relative">
    <label class="block">
      <span class="block text-sm md:text-base font-medium text-slate-700">
        {{ label }}
        <span v-if="isRequired" data-test="wildcard" class="text-red-600"
          >*</span
        >
      </span>
      <input
        ref="inputRef"
        :value="model"
        type="text"
        :placeholder="placeholder"
        :required="isRequired"
        :class="[
          'mt-1 block w-full px-5 font-dm-sans font-medium py-2.5 border border-transparent rounded-lg text-sm md:text-base shadow-sm focus:outline-none placeholder-[#788B9A] disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none',
          errorMessage?.length || hasError
            ? 'bg-[#96001829] border-none'
            : 'bg-[#F1F4FA] focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
        ]"
        @input="($event) => updateModelValue($event)"
      />
      <span
        v-if="limitCharacter"
        class="absolute top-2 right-0 font-medium font-dm-sans text-sm"
        data-cy="evolution"
      >
        {{ model.length }}/{{ limitCharacter }}
      </span>
      <span
        v-if="errorMessage"
        class="block mt-2 text-pink-600 text-xs"
        data-test="error"
      >
        {{ errorMessage }}
      </span>
    </label>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  label: string;
  placeholder: string;
  isRequired: boolean;
  errorMessage?: string;
  hasError?: boolean;
  limitCharacter?: number;
}>();

const model = defineModel<string>({
  required: true,
  default: "",
});

const inputRef = ref<HTMLInputElement>(null);
const updateModelValue = ($event: Event): void => {
  const limitation = props.limitCharacter;
  const inputText = ($event.target as HTMLInputElement).value;

  if (limitation) {
    if (inputText.length >= limitation) {
      if (inputRef.value) {
        inputRef.value.value = inputText.slice(0, limitation);
      }
      model.value = inputText.slice(0, limitation);
      return;
    }
  }
  model.value = inputText;
};
</script>
