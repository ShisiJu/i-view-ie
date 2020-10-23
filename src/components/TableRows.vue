<template>
  <tbody>
    <tr v-for="(d, index) in data" :key="Math.random() + '-' + index">
      <td v-for="col in columns" :key="'col-' + col.key">{{ d[col.key] }}</td>
    </tr>
  </tbody>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
    },
    data: {
      type: Array,
    },
  },
};
</script>

<style>
</style>