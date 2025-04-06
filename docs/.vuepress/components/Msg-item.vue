<script setup>
import markdown from 'markdown'
import { defineProps, computed, ref } from 'vue'

const props = defineProps({
    msgData: 'object'
})

const isCopied = ref(false)

const htmlStr = computed(() => {
    return markdown.markdown.toHTML(props.msgData.message)
})

const handleCopy = () => {
    navigator.clipboard.writeText(props.msgData.message)
        .then(() => {
            isCopied.value = true
            setTimeout(() => {
                isCopied.value = false
            }, 2000)
        })
        .catch(err => {
            console.error('复制失败：', err)
        })
}
</script>
<template>
    <div class="message-item" v-if="msgData.role === 'user'">
        <div> <img class="message-avatar" src="/images/logo.jpg" alt=""> </div>

        <div class="message-content">
            <span class="message-naciname">程序员小石</span>
            <pre v-html="htmlStr"></pre>
            <p style="">
                <button class="copy-btn" @click="handleCopy">{{ isCopied ? '✓' : '复制' }}</button>
            </p>
        </div>
    </div>
    <div v-else-if="msgData.role === 'system'">
        <p style="text-align: center;color: #ccc; margin: 0;">{{ msgData.message }}</p>
    </div>
</template>
<style scoped>
.copy-btn {
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 5px;
    font-size: 10px;
    color: #333;
}

.copy-btn:hover {
    background-color: #f5f5f5;
}
</style>
