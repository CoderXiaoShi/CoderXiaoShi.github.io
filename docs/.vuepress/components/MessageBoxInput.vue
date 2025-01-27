<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import axios from 'axios'

const props = defineProps({
    query: {
        type: Function,
        required: true
    }
})

const inputFile = ref(null)
const emojiBox = ref(null)
const inputEml = ref(null)

const state = reactive({
    inputMsg: '',
})

/*
    发消息需求
    1. 发文本
    2. 发链接, 自动带上 A 标签 (http 开头的自动用A标签包裹起来)
    
    ---
    3. 发图片
    4. 发语音
    5. 发抖音或者B站链接, 自动转为视频
*/ 

onMounted(() => {
    emojiBox.value.addEventListener('click', emojiBoxFn, true)
    document.addEventListener('click', backCloseEmojiBox, false)
})

onUnmounted(() => {
    if (emojiBox.value) {
        emojiBox.value.removeEventListener('click', emojiBoxFn, true)
    }
    document.addEventListener('click', backCloseEmojiBox, false)
})

const backCloseEmojiBox = (e) => {
    if (e.target.className !== 'message-input-emoji-box') {
        closeEmojiBox();
    }
}

const emojiBoxFn = (e) => {
    e.stopPropagation()
    e.preventDefault()
    // 点击表情
    if (e.target.classList.contains('emoji-icon')) {
        // state.inputMsg += e.target.innerText
        let str = state.inputMsg
        const { selectionStart, selectionEnd } = inputEml.value
        console.log(selectionStart, selectionEnd)
        // 1. 插入表情
        // 2. 将文本替换为表情
        // 3. 默认追加到末尾
        if (selectionStart === selectionEnd && selectionEnd.length === str) {
            str += e.target.innerText
        }
        if (selectionStart === selectionEnd) {
            // 插入表情
            str = str.slice(0, selectionStart) + e.target.innerText + str.slice(selectionStart)
        } else {
            // 将文本替换为表情
            str = str.slice(0, selectionStart) + e.target.innerText + str.slice(selectionEnd)
        }
        state.inputMsg = str;
        closeEmojiBox();
    }
}

const openEmojiBox = () => {
    emojiBox.value.style.display = 'flex'
}

const closeEmojiBox = () => {
    if (emojiBox.value) {
        emojiBox.value.style.display = 'none'
    }
}

const publish = async () => {
    console.log('publish');
    axios.get('/api/publish')
    alert('已发送')
}

const sendMsg = async () => {
    if (state.inputMsg === '' || state.inputMsg.trim() === '') {
        return
    }

    let str = state.inputMsg.trim()
    let data = {
        message: str,
        role: "user",
        type: "text"
    }
    if (str.startsWith('http')) {
        data.type = 'image'
    }

    await axios.post('/api/message', data)
    state.inputMsg = ''
    props.query()
}

const uploadImg = async (e) => {
    // console.log(e)
    // const file = e.target.files[0]
    // console.log(file)
    // let f = new FormData()
    // f.append('image', e.target.files[0])
    // let res = await axios.post('/api/message/uploadImage', f)
    // console.log(res.data)

    const formData = new FormData();
    formData.append('image', e.target.files[0]);  // file 是文件对象

    axios.post('/api/message/uploadImage', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        console.log(response.data);
        props.query()
    });
}

let emojiList = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😶‍🌫️", "😏", "😒", "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "❤️", "💖", "💗", "💓", "💞", "💕", "💖", "💘", "💝", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💋", "💯", "💢", "💥", "💫", "💦", "💨", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "👋", "🤚", "🖐️", "🖖", "👌", "🤌", "🤏", "✌️", "🤎", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "❤️", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "👶", "👧", "👦"
]

</script>

<template>
    <div class="message-input">
        <!-- 上传图片 -->
        <input type="file" ref="inputFile" style="display: none;" accept="image/*" @change="uploadImg" />
        <span 
            class="message-input-upload"
            @click="inputFile.click()"
            style="background-image: url('/images/huixingzhen.svg');">
        </span>

        <!-- 表情包 -->
        <span class="message-input-emoji" @click.stop.self="openEmojiBox">😁</span>
        <div class="message-input-emoji-box" ref="emojiBox" style="display: none;">
            <!-- <span class="emoji-icon">🥺</span>
            <span class="emoji-icon">☹️</span> -->
            <span v-for="emoji in emojiList" :key="emoji" class="emoji-icon">{{ emoji }}</span>
        </div>

        <!-- 文本框 -->
        <!-- <input type="text" v-model="state.inputMsg" ref="inputEml" /> -->
         <textarea 
            class="message-input-textarea" 
            v-model="state.inputMsg" 
            ref="inputEml" 
            @keyup.enter.stop.self="sendMsg"
         />

        <!-- 发消息 -->
        <button @click="sendMsg" :disabled="state.inputMsg === '' || state.inputMsg.trim() === ''">发送</button>
        <button @click="publish" >发布</button>
    </div>
</template>


<style scoped lang="less">

.message-input{
    display: flex;
    height: 32px;
    border: 1px solid #ccc;
    border-radius: 4px;
    position: relative;
    .message-input-emoji{
        width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        display: flex;
        cursor: pointer;
    }
    .message-input-emoji-box{
        position: absolute;
        bottom: 32px;
        left: -2px;
        width: 50%;
        padding: 5px;
        height: auto;
        background-color: #fff;
        border: 1px solid #ccc;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        .emoji-icon{
            cursor: pointer;
            display: block;
            width: 22px;
            height: 22px;
            &:hover{
                transform: scale(1.5);
            }
        }
    }
    .message-input-upload{
        background-size: 80%; background-repeat: no-repeat; background-position: center; 
        border-radius: 4px; cursor: pointer;
        width: 28px;
        height: 28px;
    }
    .message-input-textarea{
        flex: 1;
        /* 设置选中文本的样式 */
    }
    .message-input-textarea::selection {
        background-color: #0f7bff;  /* 选中背景色 */
    }

    button{
        width: 60px;
        height: 32px;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
    }
}

</style>
