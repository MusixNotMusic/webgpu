<template>
  <div>
    <!-- <NuxtWelcome /> -->
    <h1>Welcome to the homepage</h1>
    <h2>{{ hasGPU ? 'gpu 存在' : 'no' }}</h2>
    <NuxtPage />
    <!-- <slot /> -->
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
export default {
  name: 'App',
  setup() {
    const hasGPU = ref(null);

    onMounted(() => {
      hasGPU.value = !!navigator.gpu
    })

    return {
      hasGPU
    }
  }
}
</script> 
