<template>
  <nav :class="['bg-white space-y-4 pt-2', { 'ml-4 my-4': !isMenuExpanded }]">
    <div class="logo px-1">
      <BaseImage
        name="wikiAuto.png"
        :class="['mx-auto', isMenuExpanded ? 'h-[5.3rem]' : 'h-12 w-12']"
        fetch-priority="high"
        loading="eager"
      />
    </div>
    <menu class="menus space-y-2">
      <MenuItem
        v-for="{ title, icon, path } in menus"
        :key="title"
        :title="title"
        :icon="icon"
        :path="path"
        :is-opened="isMenuExpanded"
        :is-selected="route.path === path"
      />
    </menu>
    <div class="more text-center flex flex-col items-center gap-y-4">
      <button
        :title="isMenuExpanded ? '' : t('logout')"
        data-cy="logout-btn"
        :class="[
          'w-full flex items-center justify-center relative p-0.5 transition duration-150 ease-linear border px-4 py-1 border-transparent hover:border-primary',
          { 'gap-x-2': isMenuExpanded },
        ]"
        @click.stop="logOut"
      >
        <span>
          <LoaderFade
            v-if="isLogoutProcessing"
            :class="[
              'h-3 w-3 before:w-3 before:h-3 before:border-t-gray-700',
              isLogoutProcessing && isMenuExpanded
                ? 'before:left-1/4'
                : 'before:left-1/3',
            ]"
          />
          <IconLogOut v-else class="h-4 w-4 fill-gray-600" />
        </span>
        <span v-if="isMenuExpanded" class="first-letter:uppercase text-md">{{
          t("logout")
        }}</span>
      </button>
      <button
        :title="isMenuExpanded ? '' : t('expand')"
        :class="[
          'w-full flex items-center justify-center rounded-sm transition duration-150 ease-linear border py-1 border-transparent hover:border-primary',
          { 'gap-x-2': isMenuExpanded },
        ]"
        data-cy="toggle-expand-btn"
        @click.stop="toggleMenuExpansion"
      >
        <IconExpandRightDouble
          :class="[
            'stroke-gray-900',
            isMenuExpanded ? 'translate rotate-180 h-5 w-5' : 'h-4 w-4',
          ]"
        />
        <span v-if="isMenuExpanded" class="first-letter:uppercase text-md">
          {{ t("abate") }}
        </span>
      </button>
    </div>
  </nav>
</template>
<script setup lang="ts">
import type { MENU_ICONS } from "~/components/menu/item.vue";

type Menu = {
  title: string;
  icon: keyof typeof MENU_ICONS;
  path: string;
};

const { t } = useI18n({
  useScope: "local",
  messages: {
    en: {
      dashboard: "dashboard",
      content: "content",
      expand: "expand",
      abate: "reduce",
      logout: "logout",
      failed_logout: "Logout failed",
    },
    fr: {
      dashboard: "dashboard",
      content: "contenu",
      expand: "agrandir",
      abate: "réduire",
      logout: "se déconnecter",
      failed_logout: "Echec de la déconnection",
    },
  },
});

const route = useRoute();
const menus: Menu[] = [
  {
    title: t("dashboard"),
    icon: "DASHBOARD",
    path: "/dashboard",
  },
  {
    title: t("content"),
    icon: "CONTENT",
    path: "/content",
  },
];

const isMenuExpanded = ref(false);
const toggleMenuExpansion = (): void => {
  isMenuExpanded.value = !isMenuExpanded.value;
};

const isLogoutProcessing = ref(false);
const logOut = async (): Promise<void> => {
  isLogoutProcessing.value = true;
  const { status } = await useAuthStore().logout();
  if (status === "success") {
    await navigateTo("/auth");
  } else {
    useToast.setDuration(7).error(t("failed_logout"));
  }
  isLogoutProcessing.value = false;
};
</script>
<style scoped>
.logo {
  grid-area: logo;
}

.menus {
  grid-area: menus;
}

.more {
  grid-area: more;
}

nav {
  display: grid;
  grid-template: "logo" 90px "menus" 1fr "more";
}
</style>
