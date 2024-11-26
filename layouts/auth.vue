<template>
  <div class="flex flex-col justify-center items-center min-h-[100svh] xl:p-14 xl:bg-gradient-to-r xl:from-indigo-500 xl:from-10% xl:via-sky-500 xl:via-30% xl:to-emerald-500 xl:to-90%">
    <div class="grow h-full w-full 2xl:w-11/12 flex shadow bg-white">
      <section
        class="flex flex-col items-center justify-center w-full xl:w-1/2 relative"
      >
        <slot />
      </section>
      <section
        class="hidden xl:flex xl:w-1/2 justify-center border items-center px-10 rounded-l-3xl auth bg-no-repeat bg-cover"
      >
      </section>
   </div>
  </div>
</template>
<style lang="css" scoped>
.auth {
  background-image: url(~/assets/images/auth-car.png);
}
</style>
