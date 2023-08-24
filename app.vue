<template>
  <div theme="main" class="wrap">
    <Navigation/>
    <Main/>
  </div>
</template>
<script>
import Navigation from './components/Navigation';
import Main from './components/Main';
export default {
  name: 'App',
  components: [Navigation, Main]
}
</script>

<style scoped>
  .wrap {
    display: flex;
  }
</style>