<template>
  <el-dialog
    :model-value="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="1000px"
    class="c-LotteryConfig"
    @close="handleDialogClose"
  >
    <template #header>
      <div class="c-LotteryConfigtitle">
        <span :style="{ fontSize: '16px', marginRight: '20px' }">抽奖配置</span>
        <el-button v-if="activeName === 'first'" size="small" type="primary" @click="addLottery">增加奖项</el-button>
        <el-button v-if="activeName === 'second'" size="small" type="primary" @click="addGroup">增加奖池</el-button>
      </div>
    </template>

    <div class="container">
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="奖项配置" name="first">
          <el-table :data="storeNewLottery" style="width: 100%">
            <el-table-column prop="name" label="奖项名称" width="180" />
            <el-table-column prop="description" label="奖品描述" min-width="220" show-overflow-tooltip />
            <el-table-column prop="group" label="所属奖池" width="150">
              <template #default="scope">
                <span>{{ getGroupName(scope.row.group) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="数量" width="80" />
            <el-table-column label="奖品图片" width="120">
              <template #default="scope">
                <img v-if="scope.row.image" :src="scope.row.image" class="thumb" alt="prize" />
                <span v-else style="color: #999">未设置</span>
              </template>
            </el-table-column>
            <el-table-column align="right" label="操作" width="120">
              <template #default="scope">
                <el-popconfirm title="确定删除?" @confirm="handleDeletePrize(scope.row.id)">
                  <template #reference>
                    <el-link type="danger" size="small">删除</el-link>
                  </template>
                </el-popconfirm>
                <el-link type="primary" size="small" style="margin-left: 18px" @click="handleEditPrize(scope.row.id)">编辑</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="奖池配置" name="second">
          <el-table :data="groupListRaw" style="width: 100%">
            <el-table-column prop="name" label="名称" width="300" />
            <el-table-column label="名单人数" width="150">
              <template #default="scope">
                <span style="color: #67c23a; font-weight: bold">{{ userCounts[scope.row.id] || 0 }} 人</span>
              </template>
            </el-table-column>
            <el-table-column align="right" label="操作" min-width="300">
              <template #default="scope">
                <el-popconfirm title="删除奖池将清空该组名单，确定?" @confirm="handleDeleteGroup(scope.row.id)">
                  <template #reference>
                    <el-link type="danger" size="small">删除奖池</el-link>
                  </template>
                </el-popconfirm>
                <el-link type="primary" size="small" style="margin-left: 25px" @click="handleEditGroup(scope.row)">重命名</el-link>
                <el-link type="success" size="small" style="margin-left: 25px" @click="handleShowGroupList(scope.row)">名单管理</el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="界面配置" name="third">
          <el-form label-width="110px" style="max-width: 760px; margin-top: 10px">
            <el-form-item label="背景图地址">
              <el-input v-model="uiConfig.backgroundImage" placeholder="支持 http(s)、dataURL、file:// 或本地绝对路径"></el-input>
            </el-form-item>
            <el-form-item label="上传背景图">
              <input type="file" accept="image/*" @change="handleBackgroundUpload" />
            </el-form-item>
            <el-form-item label="预览">
              <img v-if="uiConfig.backgroundImage" :src="uiConfig.backgroundImage" class="preview lottery-preview" alt="background" />
              <span v-else style="color: #999">未设置背景图</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="isSavingUI" @click="saveUIConfigHandler">保存界面配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showAddLottery" title="奖项配置" :close-on-click-modal="false" :append-to-body="true" width="640px">
      <el-form :model="newLottery" label-width="90px" size="small">
        <el-form-item label="奖项名称">
          <el-input v-model="newLottery.name" size="large"></el-input>
        </el-form-item>
        <el-form-item label="奖项数量">
          <el-input v-model="newLottery.count" type="number" size="large"></el-input>
        </el-form-item>
        <el-form-item label="所属奖池">
          <el-select v-model="newLottery.group" style="width: 100%" size="small" placeholder="请选择抽奖名单来源">
            <el-option v-for="item in groupListRaw" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖品描述">
          <el-input v-model="newLottery.description" type="textarea" :rows="3" placeholder="可填写奖品说明"></el-input>
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input v-model="newLottery.image" placeholder="支持 http(s)、dataURL、file:// 或本地绝对路径"></el-input>
        </el-form-item>
        <el-form-item label="上传图片">
          <input type="file" accept="image/*" @change="handlePrizeImageUpload" />
        </el-form-item>
        <el-form-item label="图片预览">
          <img v-if="newLottery.image" :src="newLottery.image" class="preview lottery-preview" alt="prize" />
          <span v-else style="color: #999">未设置奖品图</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddLottery = false">取消</el-button>
          <el-button type="primary" @click="savePrizeHandler">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showGroupEdit" title="奖池配置" :close-on-click-modal="false" :append-to-body="true" width="400px">
      <el-form size="small">
        <el-form-item label="奖池名称">
          <el-input v-model="currentGroup.name" size="large" placeholder="如：部门A、全员、嘉宾组"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showGroupEdit = false">取消</el-button>
          <el-button type="primary" @click="saveGroupHandler">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      :append-to-body="true"
      :title="`修改 [${currentGroup.name || ''}] 的名单`"
      :close-on-click-modal="false"
      v-model="groupVisible"
      width="1000px"
      class="c-GroupConfig"
    >
      <div style="margin-bottom: 10px; color: #666">当前名单人数：{{ (groupListStr.match(/\n/g) || []).length + (groupListStr ? 1 : 0) }}</div>
      <el-input
        type="textarea"
        v-model="groupListStr"
        :rows="20"
        placeholder="请输入名单(可直接从excel复制)，每行一个，自动去重"
      ></el-input>
      <template #footer>
        <div class="footer">
          <el-button size="small" @click="groupVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="saveGroupListHandler">保存并覆盖</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { ElMessage, ElMessageBox } from 'element-plus';
import { database, prizeName, STORE_GROUPS, STORE_USERS } from '@/helper/db';
import { getUIConfig, saveUIConfig } from '@/helper/appConfig';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'ui-change']);

const activeName = ref('first');
const storeNewLottery = ref([]);
const showAddLottery = ref(false);
const newLottery = reactive({ name: '', count: 0, group: null, description: '', image: '' });
const isSavingPrize = ref(false);

const groupListRaw = ref([]);
const userCounts = ref({});
const showGroupEdit = ref(false);
const currentGroup = reactive({ id: null, name: '' });

const groupVisible = ref(false);
const groupListStr = ref('');

const uiConfig = reactive({ backgroundImage: '' });
const isSavingUI = ref(false);

const handleDialogClose = () => {
  emit('update:visible', false);
};

const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = (err) => reject(err);
  reader.readAsDataURL(file);
});

const handleBackgroundUpload = async (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;
  uiConfig.backgroundImage = await readAsDataURL(file);
  event.target.value = '';
};

const handlePrizeImageUpload = async (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;
  newLottery.image = await readAsDataURL(file);
  event.target.value = '';
};

const refreshAllData = async () => {
  await getGroups();
  await getPrizes();
  await getUIData();
};

const getGroupName = (groupId) => {
  const group = groupListRaw.value.find((g) => g.id === groupId);
  return group ? group.name : `未知奖池(ID:${groupId})`;
};

const addLottery = () => {
  Object.assign(newLottery, { name: '', count: 0, group: null, description: '', image: '' });
  if (groupListRaw.value.length > 0) {
    newLottery.group = groupListRaw.value[0].id;
  }
  showAddLottery.value = true;
};

const getPrizes = async () => {
  const res = await database.getAll(prizeName);
  storeNewLottery.value = (res || []).map((item) => ({
    ...item,
    description: item.description || '',
    image: item.image || ''
  }));
};

const handleEditPrize = async (id) => {
  const data = await database.get(prizeName, id);
  Object.assign(newLottery, { name: '', count: 0, group: null, description: '', image: '' }, data || {});
  showAddLottery.value = true;
};

const handleDeletePrize = async (id) => {
  await database.del(prizeName, id);
  await getPrizes();
};

const savePrizeHandler = async () => {
  if (isSavingPrize.value) return;

  if (!newLottery.name) return ElMessage.warning('名称不能为空');
  if (!newLottery.count) return ElMessage.warning('数量不能为空');
  if (newLottery.group === null) return ElMessage.warning('请选择奖池');

  try {
    isSavingPrize.value = true;
    const payload = {
      ...newLottery,
      count: Number(newLottery.count),
      description: newLottery.description || '',
      image: newLottery.image || ''
    };

    if (payload.id) {
      await database.edit(prizeName, payload.id, payload);
    } else {
      await database.add(prizeName, payload);
    }

    showAddLottery.value = false;
    await getPrizes();
    ElMessage.success('保存成功');
  } finally {
    isSavingPrize.value = false;
  }
};

const addGroup = () => {
  Object.assign(currentGroup, { id: null, name: '' });
  showGroupEdit.value = true;
};

const getGroups = async () => {
  const groups = await database.getAll(STORE_GROUPS);
  groupListRaw.value = groups || [];

  const counts = {};
  for (const group of groupListRaw.value) {
    const users = await database.getAllByIndex(STORE_USERS, 'groupId', group.id);
    counts[group.id] = users.length;
  }
  userCounts.value = counts;
};

const handleEditGroup = async (row) => {
  Object.assign(currentGroup, row || {});
  showGroupEdit.value = true;
};

const handleDeleteGroup = async (id) => {
  await database.del(STORE_GROUPS, id);
  await database.deleteByIndex(STORE_USERS, 'groupId', id);

  await getGroups();
  ElMessage.success('奖池及名单已删除');
};

const saveGroupHandler = async () => {
  if (!currentGroup.name) return ElMessage.warning('奖池名称不能为空');

  if (currentGroup.id) {
    await database.edit(STORE_GROUPS, currentGroup.id, { name: currentGroup.name });
  } else {
    await database.add(STORE_GROUPS, { name: currentGroup.name });
  }
  showGroupEdit.value = false;
  await getGroups();
};

const handleShowGroupList = async (group) => {
  Object.assign(currentGroup, group || {});
  const users = await database.getAllByIndex(STORE_USERS, 'groupId', group.id);
  groupListStr.value = users.map((u) => u.name).join('\n');
  groupVisible.value = true;
};

const saveGroupListHandler = async () => {
  const groupId = currentGroup.id;
  if (!groupId) return;

  const rawText = groupListStr.value;
  const nameList = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  if (nameList.length === 0) {
    try {
      await ElMessageBox.confirm('确定清空该组名单吗?', '提示', { type: 'warning' });
      await database.deleteByIndex(STORE_USERS, 'groupId', groupId);
      groupVisible.value = false;
      await getGroups();
      ElMessage.success('名单已清空');
    } catch (e) {
    }
    return;
  }

  await database.deleteByIndex(STORE_USERS, 'groupId', groupId);

  for (const name of nameList) {
    await database.add(STORE_USERS, {
      name,
      groupId,
      uuid: uuidv4()
    });
  }

  groupVisible.value = false;
  await getGroups();
  ElMessage.success(`成功导入 ${nameList.length} 条数据`);
};

const getUIData = async () => {
  const config = await getUIConfig();
  uiConfig.backgroundImage = config.backgroundImage || '';
};

const saveUIConfigHandler = async () => {
  if (isSavingUI.value) return;
  try {
    isSavingUI.value = true;
    await saveUIConfig({ backgroundImage: uiConfig.backgroundImage || '' });
    ElMessage.success('界面配置已保存');
    emit('ui-change');
  } finally {
    isSavingUI.value = false;
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      refreshAllData();
    }
  }
);

onMounted(() => {
  refreshAllData();
});
</script>

<style lang="scss">
.c-LotteryConfig {
  .el-dialog__body {
    min-height: 400px;

    .container {
      height: 100%;
      overflow-y: auto;
      padding: 0 10px;
    }

    .thumb {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #eee;
    }

  }
}

.lottery-preview {
  max-width: min(100%, 260px);
  max-height: 130px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px;
  background: #fff;
  display: block;
}
</style>
