<template>
  <div class="forkme">
    <Ribbon
      text="Fork me on github"
      url="https://github.com/zecka/image-colors-extractor"
      position="top-right"
      color="#2c3e50"
    />
  </div>
</template>
<script>
import Ribbon from "vue-ribbon";

export default {
  name: "ForkMe",
  components: {
    Ribbon
  }
};
</script>