<template>
  <section class="space-y-3 2xl:space-y-5">
    <div class="space-y-0.5">
      <h3 class="text-primary-text text-lg xl:text-xl font-medium">
        {{ t("ttl") }}
      </h3>
      <p class="text-primary-text/50 text-sm font-light xl:text-lg">
        {{ t("desc") }}
      </p>
    </div>
    <div class="bg-white p-6 rounded-md">
      <div class="space-y-5">
        <div class="flex gap-x-4">
          <InputText
            v-model="profile.firstname"
            :label="t('name.first')"
            class="w-full"
            :is-required="false"
            :placeholder="t('name.first')"
            data-cy="firstname"
          />
          <InputText
            v-model="profile.lastname"
            :label="t('name.last')"
            :placeholder="t('name.last')"
            class="w-full"
            :is-required="false"
            data-cy="lastname"
          />
        </div>
        <div class="flex gap-x-4">
          <InputText
            v-model="profile.username"
            :label="t('name.user')"
            :placeholder="t('name.user')"
            class="w-full"
            :is-required="false"
            data-cy="username"
          />
          <InputEmail
            v-model="profile.email"
            :label="t('email')"
            :placeholder="t('email')"
            class="w-full"
            :is-required="false"
            :is-disabled="true"
            data-cy="email"
          />
        </div>
        <div class="flex justify-end gap-x-4">
          <BaseButtonIcon
            :text="t('btn.save')"
            :disabled="!canSaveChanges"
            data-cy="save-btn"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      ttl: "Personal info",
      desc: "Update your photo and personal details here.",
      name: {
        first: "Firsname",
        last: "Lastname",
        user: "Username",
      },
      email: "Email",
      btn: {
        save: "Save changes",
      },
    },
    fr: {
      ttl: "Info Personelles",
      desc: "Modifier votre photo et details personal ici.",
      name: {
        first: "Prenoms",
        last: "Nom",
        user: "Nom d'utilisateur",
      },
      email: "Email",
      btn: {
        save: "Enregistrer",
      },
    },
  },
});

const userStore = useUserStore();
const { currentUser } = storeToRefs(userStore);

const profile = reactive({
  firstname: currentUser.value?.user_metadata?.firstname ?? "",
  lastname: currentUser.value?.user_metadata?.lastname ?? "",
  email: currentUser.value?.email ?? "",
  username: currentUser.value?.user_metadata?.username ?? "",
});

const canSaveChanges = computed<boolean>(() => {
  return (
    JSON.stringify({
      firstname: currentUser.value?.user_metadata?.firstname ?? "",
      lastname: currentUser.value?.user_metadata?.lastname ?? "",
      email: currentUser.value?.email ?? "",
      username: currentUser.value?.user_metadata?.username ?? "",
    }) !== JSON.stringify(profile)
  );
});
</script>
