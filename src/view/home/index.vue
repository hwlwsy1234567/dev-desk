<template>
  <div class="user-page">
    <section class="workbench">
      <div class="main-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="list-title">用户列表</div>
            <el-tag effect="plain">{{ filterList.length }} 条</el-tag>
            <el-input
              v-model="keyword"
              class="search-input"
              clearable
              placeholder="搜索姓名或邮箱"
              :prefix-icon="Search"
            ></el-input>
            <el-button :icon="Refresh" @click="getUserListHand">刷新</el-button>
          </div>
          <div class="toolbar-right">
            <el-button :icon="Setting" @click="checkVersion">版本</el-button>
            <el-button type="primary" :icon="Plus" @click="addHand">新增</el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          highlight-current-row
          :data="filterList"
          height="100%"
          @row-dblclick="showDetail"
        >
          <el-table-column prop="id" label="ID" width="64"></el-table-column>
          <el-table-column prop="first_name" label="姓名" min-width="160"></el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="260"></el-table-column>
          <el-table-column label="操作" width="132" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-tooltip content="详情" placement="top">
                  <el-button text type="info" :icon="View" @click.stop="showDetail(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="编辑" placement="top">
                  <el-button text type="primary" :icon="Edit" @click.stop="changeHand(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button text type="danger" :icon="Delete" @click.stop="deleteHand(row)"></el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <el-dialog v-model="detailVisible" title="用户详情" width="420px">
      <div v-if="currentUser" class="detail-dialog">
        <div class="profile-line">
          <div class="avatar">{{ currentUser.first_name.slice(0, 1) }}</div>
          <div>
            <div class="user-name">{{ currentUser.first_name }}</div>
            <div class="user-email">{{ currentUser.email }}</div>
          </div>
        </div>
        <div class="field-list">
          <div class="field-item">
            <span>ID</span>
            <strong>{{ currentUser.id }}</strong>
          </div>
          <div class="field-item">
            <span>姓名</span>
            <strong>{{ currentUser.first_name }}</strong>
          </div>
          <div class="field-item">
            <span>邮箱</span>
            <strong>{{ currentUser.email }}</strong>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentUser" type="primary" :icon="Edit" @click="changeHand(currentUser)">编辑</el-button>
      </template>
    </el-dialog>
    <addOrUpdate @success="getUserListHand" ref="addRef"></addOrUpdate>
    <checkAppVersion ref="checkRef"></checkAppVersion>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search, Setting, View } from '@element-plus/icons-vue'
import { deleteUserByIdDB, getUserListDB } from '@/api/user'
import addOrUpdate from './addOrUpdate.vue'
import checkAppVersion from './checkAppVersion.vue'

interface UserItem {
  id: number
  first_name: string
  email: string
}

const logger = window.electronAPI?.logger || { info: () => {}, error: () => {}, warn: () => {} }
const tableData = ref<UserItem[]>([])
const currentUser = ref<UserItem>()
const keyword = ref('')
const loading = ref(false)
const detailVisible = ref(false)
const addRef = ref()
const checkRef = ref()
const filterList = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) {
    return tableData.value
  }
  return tableData.value.filter(item => item.first_name.includes(value) || item.email.toLowerCase().includes(value))
})

const getUserListHand = async () => {
  loading.value = true
  logger.info('获取用户列表')
  const { code, data } = await getUserListDB()
  if (code === 200) {
    tableData.value = data
  }
  loading.value = false
}

const showDetail = (row: UserItem) => {
  currentUser.value = row
  detailVisible.value = true
}

const addHand = () => {
  addRef.value.init()
}

const changeHand = (row: UserItem) => {
  addRef.value.init(row)
}

const deleteHand = (row: UserItem) => {
  ElMessageBox.confirm(`确定删除 ${row.first_name} 吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    const { code } = await deleteUserByIdDB({ id: row.id })
    if (code === 200) {
      ElMessage.success('删除成功')
      getUserListHand()
    }
  }).catch(() => undefined)
}

const checkVersion = () => {
  checkRef.value.init()
}

onMounted(() => {
  getUserListHand()
})
</script>

<style lang="scss" scoped>
.user-page {
  min-width: 760px;
  height: 100%;
  overflow: hidden;
}

.workbench {
  height: 100%;
}

.main-panel {
  min-height: 0;
  height: 100%;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.main-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.main-panel :deep(.el-table .cell) {
  line-height: 22px;
}

.main-panel :deep(.el-table__cell) {
  padding: 6px 0;
}

.main-panel :deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

.main-panel :deep(.el-table__row) {
  cursor: default;
}

.main-panel :deep(.el-table__row:hover > td.el-table__cell) {
  background: #f1f5f9;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
}

.list-title {
  margin-right: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.toolbar-left .el-tag {
  margin-right: 12px;
}

.toolbar-left .el-button,
.toolbar-right .el-button {
  margin-left: 8px;
}

.search-input {
  width: 260px;
}

.profile-line {
  display: flex;
  align-items: center;
}

.avatar {
  width: 42px;
  height: 42px;
  line-height: 42px;
  margin-right: 10px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.user-email {
  margin-top: 4px;
  font-size: 14px;
  color: #6b7280;
  word-break: break-all;
}

.field-list {
  margin-top: 14px;
  border-top: 1px solid #eef0f4;
}

.field-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eef0f4;
  font-size: 14px;
}

.field-item span {
  color: #6b7280;
}

.field-item strong {
  max-width: 260px;
  color: #111827;
  text-align: right;
  word-break: break-all;
}

.row-actions {
  display: flex;
  align-items: center;
}

.row-actions .el-button {
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}

.row-actions .el-button + .el-button {
  margin-left: 4px;
}

.detail-dialog {
  padding: 4px 0 8px;
}
</style>
