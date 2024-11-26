<template>
  <nav :class="['bg-white space-y-4 py-2', { 'ml-4 my-4': !isMenuExpanded }]">
    <div class="logo px-1">
      <BaseImage
        name="wikiAuto.png"
        :class="['mx-auto', isMenuExpanded ? 'h-[5.3rem]' : 'h-12 w-12']"
        fetch-priority="high"
        loading="eager"
      />
    </div>
    <menu class="menus">
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
    <div class="more text-center">
      <button
        :title="isMenuExpanded ? t('abate') : t('expand')"
        class="mx-auto w-8 h-8 rounded-sm shadow shadow-primary/30"
        data-cy="toggle-expand-btn"
        @click.stop="toggleMenuExpansion"
      >
        <IconExpandRightDouble
          :class="[
            'stroke-gray-900 mx-auto',
            isMenuExpanded ? 'translate rotate-180 h-5 w-5' : 'h-4 w-4',
          ]"
        />
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
      expand: "expand menu",
      abate: "reduce menu",
    },
    fr: {
      dashboard: "dashboard",
      expand: "agrandir le menu",
      abate: "réduire le menu",
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
];

const isMenuExpanded = ref(false);
const toggleMenuExpansion = (): void => {
  isMenuExpanded.value = !isMenuExpanded.value;
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
