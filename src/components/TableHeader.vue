<template>
  <thead>
    <tr class="tr-box">
      <td v-for="col in columns" :key="'col-' + col.key">
        {{ col.name }}
      </td>
    </tr>
  </thead>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
    },
  },
};
</script>

<style>
.tr-box {
  background-color: #eeeeee;
}
</style>