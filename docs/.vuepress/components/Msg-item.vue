<script setup>
import markdown from 'markdown'
import { defineProps, computed } from 'vue'

const props = defineProps({
    msgData: 'object'
})

const htmlStr = computed(() => {
  return markdown.markdown.toHTML(props.msgData.message)
})
</script>
<template>
    <div 
        class="message-item"
    >  
        <div> <img class="message-avatar" src="/images/logo.jpg" alt=""> </div>
        
        <div class="message-content">
            <span class="message-naciname">程序员小石</span>
            <pre v-html="htmlStr"  ></pre>
        </div>
    </div>
</template>
