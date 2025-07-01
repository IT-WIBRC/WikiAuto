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
            :disabled="!infosHaveChanged || areChangesSaveInProgress"
            data-cy="save-btn"
            class="relative"
            @click.stop="save"
          >
            <template #icon>
              <LoaderFade
                v-if="areChangesSaveInProgress"
                class="w-5 h-5 text-white before:w-5 before:h-5 before:left-5"
              />
            </template>
          </BaseButtonIcon>
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
      success: "Changes saved successfully",
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
    success: "Modifications enregistrées avec succès",
  },
});

const userStore = useUserStore();
const { currentUser } = storeToRefs(userStore);

const profile = reactive({
  firstname: currentUser.value?.firstname ?? "",
  lastname: currentUser.value?.lastname ?? "",
  email: currentUser.value.email,
  username: currentUser.value?.username ?? "",
});

const infosHaveChanged = computed<boolean>(() => {
  return (
    JSON.stringify({
      firstname: currentUser.value?.firstname ?? "",
      lastname: currentUser.value?.lastname ?? "",
      email: currentUser.value.email,
      username: currentUser.value?.username ?? "",
    }) !== JSON.stringify(profile)
  );
});

const areChangesSaveInProgress = shallowRef(false);
const save = async (): Promise<void> => {
  areChangesSaveInProgress.value = true;

  const editionRequest = await userStore.updateInfo({
    lastname: profile.lastname,
    firstname: profile.firstname,
    username: profile.username,
    user_id: currentUser.value?.id ?? "",
  });

  const toast = new useToast();
  if (editionRequest.status === "success") {
    toast.success(t("success"));
  } else {
    toast.error(t(`generic_errors.${editionRequest.message}`));
  }

  profile.firstname = currentUser.value?.firstname ?? "";
  profile.lastname = currentUser.value?.lastname ?? "";
  profile.username = currentUser.value?.username ?? "";

  areChangesSaveInProgress.value = false;
};
</script>
