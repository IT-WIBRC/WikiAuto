<template>
  <div class="text-left h-fit max-h-full">
    <table class="w-full">
      <thead>
        <tr class="bg-transparent">
          <th
            v-for="header in headers"
            :key="header.key"
            class="p-2 pl-4 leading-tight font-medium text-sm capitalize font-dm-sans"
            data-cy="header"
          >
            {{ header.value }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
          class="rounded-2xl bg-white drop-shadow-sm duration-150 ease-linear hover:shadow-md font-dm-sans font-medium text-sm"
          data-cy="table-row"
          :data-cy-id="item.id"
        >
          <slot
            v-for="header in headers"
            :key="header.key"
            :item="item"
            :header="header"
          >
            <td data-cy="table-data" class="pl-4 py-5">
              {{ item.getTextFor(header.key) }}
            </td>
          </slot>
        </tr>
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
<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0 1em;
  -webkit-border-vertical-spacing: 0.5em;
  -webkit-border-horizontal-spacing: 0;
}

table tbody tr td:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

table tbody tr td:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
</style>
