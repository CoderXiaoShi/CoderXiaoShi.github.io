<template>
  <div class="recycle-scroller">
      <DynamicScroller
        ref="scroller"
        :items="source"
        :min-item-size="54"
        :emit-update="true"
        class="scroller"
        keyField="id"
        @resize="onResize"
        @update="onUpdate"
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
            <slot v-bind="{ item, index }"></slot>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    <slot name="floor" />
  </div>
</template>

<script setup>
import { ref, defineProps, reactive, onMounted, watchEffect, nextTick, watch } from 'vue'

const scroller = ref(null)

const { source } = defineProps({
  source: Object
})

const onResize = () => {}
const onUpdate = () => {}

onMounted(() => {
    nextTick(() => {
        setTimeout(() => {
            scroller.value.scrollToBottom({ behavior: "smooth", })
        }, 100)
    })
})

</script>

<style scoped >
.recycle-scroller{
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: overlay;
}
</style>