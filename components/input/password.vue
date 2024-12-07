<template>
  <div>
    <label class="block">
      <span
        class="block text-sm md:text-base font-medium text-slate-700"
        data-test="label"
      >
        {{ label }}
        <span v-if="isRequired" data-test="wildcard" class="text-red-600"
          >*</span
        >
      </span>
      <div class="relative">
        <input
          v-model="model"
          :type="inputType"
          :placeholder="placeholder"
          :required="isRequired"
          :class="[
            'mt-1 block w-full px-5 font-Poppins py-3 border rounded-xl text-sm md:text-base shadow-sm focus:outline-none placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none',
            errorMessage?.length || hasError
              ? 'bg-[#96001829] border-none'
              : 'bg-white border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
          ]"
        />
        <span
          class="absolute right-4 top-3 cursor-pointer"
          :data-test="inputType === 'password' ? 'show' : 'hide'"
          @click.prevent="
            inputType = inputType === 'password' ? 'text' : 'password'
          "
        >
          <IconEyeClosed v-if="inputType === 'password'" class="h-6 w-6" />
          <IconEyeOpen v-else class="h-6 w-6" />
        </span>
      </div>
      <p
        v-if="errorMessage"
        class="mt-2 text-pink-600 text-xs"
        data-test="error"
      >
        {{ errorMessage }}
      </p>
    </label>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
  placeholder: string;
  isRequired: boolean;
  errorMessage?: string;
  hasError?: boolean;
}>();

const model = defineModel<string>({ required: true });

const inputType = ref<"text" | "password">("password");
</script>
