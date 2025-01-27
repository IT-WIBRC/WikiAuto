<template>
  <div data-cy="image-content" :title="label">
    <div
      ref="container"
      data-cy="image-shape"
      :class="[
        'rounded-full h-36 w-36 mx-auto flex justify-center items-center cursor-pointer',
        { 'bg-[#F1F4FA]': !isPreviewReady },
      ]"
      @click.prevent="chooseImage"
    >
      <IconImage v-if="!isPreviewReady" class="fill-[#3A36DB] h-5 w-5" />
    </div>
    <input
      ref="file"
      accept="image/*"
      type="file"
      hidden
      @change="showPreview"
    />
    <div
      v-if="errorMessage"
      class="text-pink-600 text-xs text-center"
      data-cy="error"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
  errorMessage?: string;
}>();

const model = defineModel<File>({ required: true });

const file = ref<HTMLInputElement>();
const container = ref<HTMLDivElement>();

const isPreviewReady = shallowRef(false);
const imageToPreview = new Image();
const updateImage = (image: Blob, file: File): void => {
  if (imageToPreview.src) {
    imageToPreview.src = URL.createObjectURL(image);
  } else {
    imageToPreview.src = URL.createObjectURL(image);

    imageToPreview.style.border = "1px solid gray";
    imageToPreview.style.maxHeight = "7em";

    container.value?.appendChild(imageToPreview);
  }
  model.value = file;
  isPreviewReady.value = true;
};

const showPreview = (changeEvent: Event): void => {
  const files = (changeEvent.target as HTMLInputElement).files;
  if (files?.length) {
    const fileReader = new FileReader();
    fileReader.onload = (): void => {
      updateImage(
        new Blob([fileReader.result as ArrayBuffer], { type: files[0].type }),
        files[0],
      );
    };
    fileReader.readAsArrayBuffer(files[0]);
  }
};
const chooseImage = (): void => {
  file.value?.click();
};
</script>
