<template>
  <div class="app-layout">
    <section class="app-main">
      <header class="app-header">
        <div class="title-block">
          <div class="page-title">{{ route.meta.title }}</div>
          <div class="page-subtitle">本地优先的开发者工具箱</div>
        </div>
        <div class="header-actions">
          <el-tag effect="plain" type="success">{{ envText }}</el-tag>
          <el-button :icon="Refresh" circle @click="refreshPage"></el-button>
        </div>
      </header>
      <main class="page-body">
        <router-view></router-view>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const envText = computed(() => window.electronAPI?.env === 'production' ? '生产环境' : '开发环境')
const refreshPage = () => {
  router.go(0)
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f5f7fb;
  color: #1f2937;
  overflow: hidden;
}

.app-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  margin-top: 1px;
  color: #64748b;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-actions .el-tag {
  margin-right: 12px;
}

.page-body {
  min-height: 0;
  padding: 8px;
  flex: 1;
  overflow: hidden;
}

</style>
