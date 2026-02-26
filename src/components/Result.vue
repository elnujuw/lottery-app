<template>
  <el-dialog :model-value="visible" :close-on-click-modal="false" @close="$emit('update:visible', false)" width="80%"
    class="c-Result" :append-to-body="true">
    <template #header>
      <div class="dialog-title">
        <span :style="{ fontSize: '18px', color: '#d30f0f' }">
          抽奖结果
        </span>
      </div>
    </template>
    <div class="result_box">
      <div v-for="(item, index) in resultList" :key="index" class="listrow">
        <div class="result-name">{{ item.luckName }}</div>
        <div class="result-list">
          <span v-for="child in item.children" :key="child.id" class="user-name">
            <el-icon class="close-icon" @click="clearLuck(item.luckName, child)"><Close /></el-icon>
            {{ child.name }}
          </span>
        </div>
      </div>
      <div v-if="resultList.length === 0" style="text-align: center; color: #999; padding: 20px;">
        暂无中奖记录
      </div>
    </div>

    <template #footer>
      <div class="footer" style="display: flex;justify-content: space-between;">
        <el-button @click="handleClear">清除所有数据</el-button>
        <el-button @click="$emit('update:visible', false)">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { database, STORE_BALLOT } from "@/helper/db";

const props = defineProps({
  visible: Boolean
});

const resultList = ref([]);

const buildTree = (list) => {
  const map = {};
  list.forEach(item => {
    const key = item.prize || item.luckName || '未知奖项';
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push({ id: item.id, name: item.name });
  });
  return Object.keys(map).map(luckName => ({
    luckName,
    children: map[luckName]
  }));
};

const getStory = async () => {
  const res = await database.getAll(STORE_BALLOT);
  resultList.value = buildTree(res || []);
};

const clearLuck = async (luckName, item) => {
  try {
    await ElMessageBox.confirm('确定删除该中奖记录?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await database.del(STORE_BALLOT, item.id);
    await getStory();
  } catch (e) {
  }
};

const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定清空所有中奖记录吗? 此操作不可恢复!', '警示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await database.clear(STORE_BALLOT);
    await getStory();
  } catch (e) {
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      getStory();
    }
  }
);
</script>

<style lang="scss" scoped>
.result_box {
  display: flex;
  max-height: 80vh;
  flex-direction: column;
  overflow-y: auto;

  .listrow {
    padding: 10px;
    font-size: 18px;
    border-bottom: 1px solid #eee;

    .result-name {
      font-size: 20px;
      color: #d30f0f;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .result-list {
      display: flex;
      flex-wrap: wrap;

      span {
        margin-right: 15px;
        margin-bottom: 10px;
        padding: 5px 15px;
        min-width: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px dashed #d30f0f;
        color: #d30f0f;
        border-radius: 4px;
        background-color: #fff0f0;
      }

      .user-name {
        position: relative;
        cursor: default;
      }

      .user-name:hover .close-icon {
        display: block;
      }

      .close-icon {
        display: none;
        position: absolute;
        right: -8px;
        top: -8px;
        cursor: pointer;
        background: red;
        color: white;
        border-radius: 50%;
        padding: 2px;
        font-size: 12px;
        z-index: 10;
      }
    }
  }
}
</style>


