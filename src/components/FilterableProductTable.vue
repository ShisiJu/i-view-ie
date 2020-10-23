<template>
  <div>
    <SearchBar @search="handleSearch"> </SearchBar>
    <GeneralTable :columns="columns" :data="product_data"> </GeneralTable>
  </div>
</template>

<script>
import SearchBar from "./SearchBar";
import GeneralTable from "./GeneralTable";

export default {
  data() {
    return {
      columns: [
        { name: "产品名称", key: "product_name" },
        { name: "价格", key: "price" },
        { name: "是否在售", key: "is_sale" },
      ],
      product_data: [
        { product_name: "苹果IPhoneX", price: 7111.0, is_sale: "是" },
        { product_name: "华为Note7", price: 5321.0, is_sale: "是" },
        { product_name: "iphone 4", price: 3100.0, is_sale: "否" },
        { product_name: "nova1", price: 2011.0, is_sale: "否" },
      ],
    };
  },
  components: {
    SearchBar,
    GeneralTable,
  },
  methods: {
    handleSearch(query) {
      // 这里根据query 去请求数据
      console.log(query);
      // this.data = []
    },
  },
};
</script>

<style>
</style>