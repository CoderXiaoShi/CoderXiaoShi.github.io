<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>  
    <div style="border: 1px solid red;">
        <h1>Hello World</h1>
        <p>count: {{ count }}</p>
        <button @click="count++">Increment</button>
    </div>
</template>
