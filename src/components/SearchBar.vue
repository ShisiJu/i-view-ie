<template>
  <div>
    <input v-model="query.keyword" type="text" placeholder="根据名称过滤" />
    <label>
      仅展示在售
      <input v-model="query.only_on_sale" type="checkbox" />
    </label>

    <button @click="search">搜索</button>
  </div>
</template>

<script>
export default {
  created() {
    // 这样做不行
    // this.search();
    // 这样可以让父组件初始化时请求数据;
    this.$emit("search", this.query);
  },
  data() {
    return {
      query: {
        keyword: "",
        only_on_sale: false,
      },
    };
  },
  methods: {
    search() {
      this.$emit("search", this.query);
    },
  },
};
</script>

<style>
</style>