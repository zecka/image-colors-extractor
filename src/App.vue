<template>
  <div id="app">
    <PixelExtractor />
  </div>
</template>

<script>
import PixelExtractor from "./components/PixelExtractor.vue";

export default {
  name: "app",
  components: {
    PixelExtractor
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
