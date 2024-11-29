<template>
    <div class="h-[70%] xl:h-[60%] 2xl:h-1/2 flex flex-col items-center gap-y-10 md:w-3/5 xl:w-[70%] 2xl:w-1/2">
        <div class="space-y-1 w-full">
            <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-5xl font-bold">
                {{ t("_ttl") }}
            </h1>
            <p class="text-sm md:text-base lg:text-lg xl:text-base font-light">
                {{ t("_desc") }}
            </p>
        </div> 
        <div class="w-full flex items-center">
            <form class="block w-full space-y-10 relative" @submit.prevent="login">
                <AlertError :message="apiResponseError" v-if="apiResponseError" class="absolute top-0 w-full" />
               <div class="space-y-4 lg:space-y-8">
                <InputEmail 
                    :placeholder="t('email._ph')" 
                    :label="t('email._lbl')" 
                    :error-message="credentials.email.error"
                    :has-error="!!apiResponseError"
                    :isRequired="true" 
                    v-model="credentials.email.value"
                />
                <InputPassword 
                    :placeholder="t('password._ph')" 
                    :label="t('password._lbl')" 
                    :error-message="credentials.password.error"
                    :has-error="!!apiResponseError"
                    :isRequired="true" 
                    v-model="credentials.password.value" 
                />
               </div>
               <div>
                <button 
                    type="submit"
                    :disabled="isLoggedInProcessing"
                    class="text-center w-full cursor-pointer rounded-lg py-2 lg:py-3.5 xl:py-3 bg-blue-800 disabled:bg-blue-800/60 disabled:cursor-not-allowed font-semibold text-white md:text-lg lg:text-xl flex items-center justify-center relative"
                >
                    <LoaderFade class="h-6 w-6 before:w-6 before:h-6 before:left-1/2" v-if="isLoggedInProcessing" />
                    <span v-else>{{ t("login_btn") }}</span>
                </button>
               </div>
            </form>
        </div>
    </div>
</template>
<script setup lang="ts">
import i18Messages from  "./i18n.json";

definePageMeta({
  layout: "auth"
});

const { t } = useI18n({
  useScope: 'local',
  inheritLocale: true,
  messages: i18Messages,
});


const credentials = reactive({
    email: {
        value: "",
        error: ""
    },
    password: {
        value: "",
        error: ""
    }
});

const apiResponseError = ref("");
const isLoggedInProcessing = ref(false);
const authStore = useAuthStore();
const login = async (): Promise<void> => {
  isLoggedInProcessing.value = true;
  const { email: { value: email }, password: { value:password } } = credentials;

    const response = await authStore.login(email, password);

    if (response.status === "success") {
      useUserStore().currentUser = response.user;
      navigateTo("/dashboard");
    } else {
      apiResponseError.value = t(`generic_errors.${response.message}`);
    }
  isLoggedInProcessing.value = false;
}
</script>