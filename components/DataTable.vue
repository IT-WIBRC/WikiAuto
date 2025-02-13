<template>
  <div class="text-left h-fit max-h-full">
    <table class="w-full">
      <thead>
        <tr class="bg-transparent">
          <slot name="header">
            <th
              v-for="header in headers"
              :key="header.key"
              class="p-2 pl-4 leading-tight font-medium text-sm capitalize font-dm-sans"
              data-cy="header"
            >
              {{ header.value }}
            </th>
          </slot>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in items" :key="item.id">
          <slot :item="item" name="body">
            <tr
              class="rounded-2xl duration-150 ease-linear hover:bg-primary/10 font-dm-sans font-medium text-sm"
              data-cy="table-row"
              :data-cy-id="`row-${item.id}`"
            >
              <td
                v-for="header in headers"
                :key="header.key"
                data-cy="table-data"
                :data-cy-id="header"
                class="pl-4 py-5"
              >
                {{ item.getTextFor(header.key) }}
              </td>
            </tr>
          </slot>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
export interface DataHeader<Key = string> {
  key: Key;
  value: string;
}

export interface DataItem<K> {
  get id(): string;
  getTextFor(key: K): string | string[] | number;
}

export default defineComponent({
  props: {
    headers: {
      type: Array as PropType<DataHeader[]>,
      required: true,
    },
    items: {
      type: Array as PropType<DataItem[]>,
      required: true,
    },
  },
});
</script>
<style>
table tbody tr {
  @apply border-b;
}

table thead th {
  @apply font-semibold font-dm-sans capitalize text-sm leading-tight bg-primary/10;
}

table thead tr th:first-child {
  @apply rounded-tl-lg;
}

table thead tr th:last-child {
  @apply rounded-tr-lg;
}
</style>
