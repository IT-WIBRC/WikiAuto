<template>
  <div ref="multipleForBadge" class="relative">
    <label class="block">
      <span
        class="block text-sm md:text-base font-medium font-dm-sans text-slate-700"
        data-test="label"
      >
        {{ label }}
        <span v-if="isRequired" data-test="wildcard" class="text-red-600"
          >*</span
        >
      </span>
      <span class="block relative">
        <span
          :class="[
            'flex flex-wrap items-center gap-x-2 gap-y-1 w-full font-dm-sans rounded-lg px-5 py-2',
            !!errorMessage ? 'bg-[#96001829]' : 'bg-[#F1F4FA]',
          ]"
        >
          <BadgeRemovable
            v-for="badge in selectedOpenOptionList"
            :key="badge.identifier"
            :text="badge.displayedValue"
            class="shrink-0"
            data-cy="selected-badge"
            @remove="removeBadgeOptionFromSelectedList(badge)"
          />
          <input
            type="text"
            :placeholder="placeholder"
            class="mt-1 font-medium min-w-12 bg-transparent font-dm-sans px-3 py-0.5 text-sm md:text-base focus:outline-none placeholder-[#788B9A]"
            :value="hittingText"
            @input="setHittingText"
            @focusin="onFocusIn"
          />
        </span>
        <span
          v-if="errorMessage"
          class="inline-block mt-2 text-pink-600 text-xs"
          data-test="error"
        >
          {{ errorMessage }}
        </span>
      </span>
    </label>
    <Transition name="bounce">
      <LazySelectBadgeList
        v-if="shouldOpenOptions"
        :are-badge-list-loading="areBadgeListLoading"
        :options="getFilteredOptions"
        :searching-text="hittingText"
        class="absolute shadow-md top-[110%] z-10"
        @open-creation-form="openCreationForm"
        @selected-badge="setSelectedBadgeOption"
      />
    </Transition>
    <ModalTransition :show="shouldOpenCreationBadgeForm">
      <LazyBadgeCreate
        :name="hittingText"
        @closed="closeCreationForm"
        @created="onTagCreationEnd"
      />
    </ModalTransition>
  </div>
</template>
<script setup lang="ts">
import { BadgeToOptionForList } from "~/components/select/type";
import type { Badge as BadgeType } from "~/api";

defineProps<{
  label: string;
  placeholder?: string;
  isRequired: boolean;
  errorMessage?: string;
}>();

const model = defineModel<BadgeType[]>({ required: true });

const { t } = useI18n({
  useScope: "local",
  messages: {
    fr: {
      no_badges: "Aucun Badge crée",
      error: {
        loading_list: "Failed to load badge-service list",
      },
    },
    en: {
      no_badges: "No Badge created",
      error: {
        loading_list: "Échec du chargement de la liste de badges",
      },
    },
  },
});

const badgeOptions = reactive<BadgeToOptionForList[]>([]);
const areBadgeListLoading = shallowRef(false);
const badgeStore = useBadgeStore();
const getBadgeList = async (): Promise<void> => {
  areBadgeListLoading.value = true;
  const badgesResponse = await badgeStore.fetchBadgeListForOptions();
  if (badgesResponse.status === "error") {
    useToast.error(t("error.loading_list"));
    return;
  }

  badgeOptions.splice(0);
  badgeOptions.push(
    ...badgesResponse.data.map((badge) => {
      return new BadgeToOptionForList(badge, selectedOpenOptionList);
    }),
  );
  areBadgeListLoading.value = false;
};

const shouldOpenCreationBadgeForm = shallowRef(false);
const openCreationForm = (): void => {
  shouldOpenCreationBadgeForm.value = true;
};

const closeCreationForm = (): void => {
  shouldOpenCreationBadgeForm.value = false;
};
const onTagCreationEnd = async (): Promise<void> => {
  await getBadgeList();
  closeCreationForm();
};

const shouldOpenOptions = shallowRef(false);
const openBadgeOptionList = (): void => {
  shouldOpenOptions.value = true;
};

const closeBadgeOptionList = (): void => {
  shouldOpenOptions.value = false;
};

const onFocusIn = async (): Promise<void> => {
  openBadgeOptionList();
  if (shouldOpenOptions.value && badgeOptions.length === 0) {
    await getBadgeList();
  }
};

const selectedOpenOptionList = reactive<BadgeToOptionForList[]>([]);
const hittingText = ref<string>("");
const displayedText = ref<string>("");
const setSelectedBadgeOption = (option: BadgeToOptionForList): void => {
  if (option.isSelected) {
    const optionIndex = selectedOpenOptionList.findIndex((element) => {
      return (
        useString.toPre(element.displayedValue) ===
        useString.toPre(option.displayedValue)
      );
    });
    selectedOpenOptionList.splice(optionIndex, 1);
  } else {
    selectedOpenOptionList.push(option);
  }
  model.value = selectedOpenOptionList.map((element) => element.selectedValue);
  hittingText.value = "";
};

const removeBadgeOptionFromSelectedList = (
  option: BadgeToOptionForList,
): void => {
  const optionIndex = selectedOpenOptionList.findIndex(
    (element) =>
      useString.toPre(element.displayedValue) ===
      useString.toPre(option.displayedValue),
  );
  selectedOpenOptionList.splice(optionIndex, 1);
  model.value = selectedOpenOptionList.map((element) => element.selectedValue);
};

const setHittingText = (event: Event): void => {
  openBadgeOptionList();
  hittingText.value = displayedText.value = (
    event.target as HTMLInputElement
  ).value;
};

const getFilteredOptions = computed((): BadgeToOptionForList[] => {
  if (hittingText.value)
    return badgeOptions.filter((option) =>
      useString
        .toPre(option.displayedValue)
        .includes(useString.toPre(hittingText.value)),
    );
  return badgeOptions;
});

const multipleForBadge = ref<HTMLDivElement>();
useDetectOutsideClick(multipleForBadge, () => {
  closeBadgeOptionList();
});

const unwatch = watchEffect(async () => {
  if (model.value.length > 0 && selectedOpenOptionList.length === 0) {
    await getBadgeList();
    selectedOpenOptionList.push(
      ...model.value.map((badge) => {
        return new BadgeToOptionForList(badge, selectedOpenOptionList);
      }),
    );
    unwatch();
  }
});
</script>
<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.2s;
}

.bounce-leave-active {
  animation: bounce-in 0.2s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

.scroll::-webkit-scrollbar {
  width: 4px;
}

.scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
}
</style>
