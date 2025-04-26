<template>
  <div class="container" v-for="item in 10" :key="item.id">
    <div>{{ item }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
interface Props {
  msg?: string;
}

defineOptions({
  name: "Popup",
  description: "弹出页",
});

withDefaults(defineProps<Props>(), {
  msg: "default value",
});

onMounted(() => {
  console.log("加载弹出页");
});
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
