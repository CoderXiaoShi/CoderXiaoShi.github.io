<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import MessageBoxInput from './MessageBoxInput.vue'

let data = ref([])
const scroller = ref(null)

/*
    数据格式
    {
        id: Math.random().toString(32).slice(2),
        message: msg,
        role: 'user', // user | assistant
        type: 'text', // text | image | video | audio | link
    }
    突发灵感，我决定写一个 vuepress 的聊天组件
    组件的样式模仿微信， 这样更有亲和力
    最好在来一个H5页面，这样我就 在手机上 编辑这部分内容了
    目前支持图片，<a href="/blog.html">链接</a>，和纯文本
    https://s21.ax1x.com/2025/01/15/pEFFmuR.jpg
    还支持表情包 😂, 表情包去这里找  <a target="_blank" href="https://github.com/ikatyang/emoji-cheat-sheet">https://github.com/ikatyang/emoji-cheat-sheet</a>
*/

const isEdit = computed(() => {
    if (location.search === '?edit=true') {
        return true;
    }
    return false;
})

onMounted(() => {
    query()
})

const query = async () => {
    let url = '/messageData.json'
    if (isEdit.value) {
        url = '/api/message'
    }
    const res = await fetch(url, {
        method: 'GET'
    })
    let resData = await res.json()
    data.value = resData.data
    scrollToBottom()
}

const deleteMessage = async (id) => {
    const res = await fetch(`/api/message/${id}`, {
        method: 'DELETE'
    })
    await res.json()
    query()
}

const scrollToBottom = () => {
    nextTick(() => {
        setTimeout(() => {
            scroller.value.scrollToBottom()
        }, 100)
    })
}

</script>

<template>
    <div class="message-box">

        <DynamicScroller
            ref="scroller"
            :style="isEdit ? {height: `calc(100% - 32px)`} : {height: `100%`}"
            :items="data"
            :min-item-size="54"
            :emit-update="true"
            class="scroller"
            keyField="id"
        >
            <template #default="{ item, index, active }">
            <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[
                item.message,
                ]"
                :data-index="index"
                :data-active="active"
            >
                <div class="message-item">  
                    <div> <img class="message-avatar" src="/images/logo.jpg" alt=""> </div>
                    
                    <div class="message-content">
                        <span class="message-naciname">程序员小石</span>
                        <div v-if="item.type === 'image'">
                            <img width="50%" :src="item.message" alt="">
                        </div>
                        <pre v-if="item.type === 'text'" v-html="item.message"  ></pre>
                        <a v-if="isEdit" @click="deleteMessage(item.id)">删除</a>
                    </div>
                </div>
            </DynamicScrollerItem>
            </template>
        </DynamicScroller>

        <MessageBoxInput v-if="isEdit" :query="query" />
    </div>
</template>

<style scoped lang="less">

@media screen and (max-width: 768px) {
    .message-box{
        width: 100% !important;
    }
}

@color_you: #95EC69;
@color_me: #fff;

.message-box{
    width: 60%;
    height: 400px;
    background-color: #F5F5F5;
    margin: 0 auto;
    // padding: 10px 0;
    padding-top: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.message-item{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 10px;
    padding-bottom: 10px;
}

.message-item .message-avatar{
    width: 40px;
    height: 40px;
    user-select: none;
    border-radius: 3px;
}
.message-content{
    margin: 0;
    padding: 0;
    margin-left: 10px;
    flex: 1;
    display: flex;
    position: relative;
    align-items: flex-start;
    flex-direction: column;
    .message-naciname{
        font-size: 10px;
        color: #999;
        padding-bottom: 5px;
        font-weight: normal;
        margin: 0;
        user-select: none;
    }
    img{
        max-width: inherit !important;
        background-color: @color_you;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid @color_you;
    }
    pre{
        margin: 0;
        padding: 5px;
        background-color: @color_you;
        font-size: 14px;
        border-radius: 4px;
        border: 1px solid @color_you;
        white-space: pre-wrap;
        .message-content pre a{
            color: #95EC69;
        }
    }
    &::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 25px;
        z-index: 2;
        border-width: 6px;
        border-style: solid;
        border-color: transparent @color_you transparent transparent;  /* 假设内容背景色是#f3f3f3 */
    }
    &::after {
        content: '';
        position: absolute;
        left: -11px;
        top: 25px;
        z-index: 1;
        border-width: 6px;
        border-style: solid;
        border-color: transparent @color_you transparent transparent;  /* 假设内容背景色是#f3f3f3 */
    }
}

/* .vue-recycle-scroller.direction-vertical:not(.page-mode) */

.message-box :deep(.scroller){
    /* overflow: hidden !important; */
    overflow-y: overlay !important;
}
.message-box :deep(.scroller)::-webkit-scrollbar{
    width: 10px;  /* 滚动条宽度 */
}
.message-box :deep(.scroller)::-webkit-scrollbar-thumb{
    background-color: #c1c1c1;  /* 滑块颜色 */
    border-radius: 3px;  /* 滑块圆角 */
}
.message-box :deep(.scroller)::-webkit-scrollbar-track{
    background-color: #f1f1f1;  /* 轨道颜色 */
    border-radius: 3px;  /* 轨道圆角 */
}
</style>