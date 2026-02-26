<template>
  <el-dialog
    :model-value="visible"
    title="奖品列表"
    @close="$emit('update:visible', false)"
    width="90%"
    :append-to-body="true"
  >
    <div class="luckList" v-if="prizes.length">
      <div class="list" v-for="item in prizes" :key="item.id">
        <div class="name">【{{ item.name }}】<span class="red">{{ item.count }}</span> 份</div>
        <div class="name des">{{ item.description || '未设置奖品描述' }}</div>
        <div class="img" v-if="item.image">
          <img :src="item.image" :alt="item.name" />
        </div>
        <div class="empty-img" v-else>未设置奖品图</div>
      </div>
    </div>
    <div v-else class="empty">暂无奖品配置</div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { database, prizeName } from '@/helper/db';

const props = defineProps({
  visible: Boolean
});

const prizes = ref([]);

const loadPrizes = async () => {
  const list = await database.getAll(prizeName);
  prizes.value = (list || []).map((item) => ({
    ...item,
    description: item.description || '',
    image: item.image || ''
  }));
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadPrizes();
    }
  }
);
</script>

<style lang="scss" scoped>
.luckList {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;

  .list {
    flex: 0 0 calc(20% - 10px);
    min-width: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }

    .name {
      font-size: 26px;
      font-weight: bold;
      padding-bottom: 10px;
      text-align: center;
      line-height: 1.4;

      &.des {
        font-size: 20px;
        color: #555;
        padding-bottom: 15px;
      }
    }

    .img {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80%;

      img {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
      }
    }

    .empty-img {
      color: #999;
      font-size: 14px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.empty {
  text-align: center;
  color: #999;
  padding: 30px 0;
}

@media (max-width: 1200px) {
  .luckList .list {
    flex: 0 0 calc(33.33% - 15px);
  }
}

@media (max-width: 768px) {
  .luckList .list {
    flex: 0 0 calc(50% - 15px);
  }
}

@media (max-width: 480px) {
  .luckList {
    gap: 10px;

    .list {
      flex: 0 0 100%;
      min-width: auto;
    }
  }
}

.red {
  color: red;
  font-size: 40px;
}
</style>
