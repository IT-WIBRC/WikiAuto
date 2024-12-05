<template>
  <div
    class="loader before:content-[''] before:absolute before:rounded-[50%] before:border-t-2 before:border-t-white before:border-r-2 before:border-r-transparent"
  />
</template>

<style scoped>
.loader::before {
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
