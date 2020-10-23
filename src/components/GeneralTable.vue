<template>
  <div>
    <table>
      <TableHeader :columns="columns"></TableHeader>
      <table-rows :columns="columns" :data="data"></table-rows>
    </table>
  </div>
</template>

<script>
import TableHeader from "./TableHeader";
import TableRows from "./TableRows";

export default {
  props: {
    columns: {
      type: Array,
    },
    data: {
      type: Array,
    },
  },
  components: {
    TableHeader,
    TableRows,
  },
};
</script>

<style>
</style>