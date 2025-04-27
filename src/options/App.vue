<template>
  <div class="container">
    <h1>Options</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Props {
  msg?: string;
}

interface Emits {
  (e: "change", value: string): void;
}

defineOptions({
  name: "Options",
  description: "Options",
});

withDefaults(defineProps<Props>(), {
  msg: "default value",
});

const emit = defineEmits<Emits>();

const count = ref(0);

const increment = () => {
  count.value++;
  emit("change", `Count is: ${count.value}`);
};

onMounted(() => {
  console.log("Component mounted");
});

defineExpose({
  increment,
});
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
