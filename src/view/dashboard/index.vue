<template>
  <div class="tool-page">
    <section class="tool-nav">
      <div class="tool-search">
        <el-input v-model="toolKeyword" size="small" placeholder="搜索工具" clearable></el-input>
      </div>
      <button
        v-for="item in filteredTools"
        :key="item.type"
        class="tool-item"
        :class="{ active: activeTool === item.type }"
        @click="selectTool(item.type)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.name }}</span>
      </button>
    </section>

    <section class="tool-workspace">
      <div class="tool-main">
        <div class="tool-head">
          <div>
            <div class="tool-title">{{ currentTool.name }}</div>
            <div class="tool-desc">{{ currentTool.desc }}</div>
          </div>
          <div class="tool-actions">
            <el-button :icon="Delete" @click="clearInput">清空</el-button>
            <el-button type="primary" :icon="Switch" @click="runTool">{{ activeTool === 'uuid' ? '生成' : '执行' }}</el-button>
          </div>
        </div>

        <div v-if="activeTool === 'json'" class="mode-switch">
          <button :class="{ active: jsonMode === 'format' }" @click="jsonMode = 'format'">格式化</button>
          <button :class="{ active: jsonMode === 'compact' }" @click="jsonMode = 'compact'">压缩</button>
        </div>

        <div v-if="activeTool === 'codec'" class="mode-switch">
          <button :class="{ active: codecMode === 'base64Encode' }" @click="codecMode = 'base64Encode'">B64 编码</button>
          <button :class="{ active: codecMode === 'base64Decode' }" @click="codecMode = 'base64Decode'">B64 解码</button>
          <button :class="{ active: codecMode === 'urlEncode' }" @click="codecMode = 'urlEncode'">URL 编码</button>
          <button :class="{ active: codecMode === 'urlDecode' }" @click="codecMode = 'urlDecode'">URL 解码</button>
        </div>

        <div v-if="activeTool === 'hash'" class="mode-switch">
          <button :class="{ active: hashMode === 'SHA-256' }" @click="hashMode = 'SHA-256'">SHA-256</button>
          <button :class="{ active: hashMode === 'SHA-1' }" @click="hashMode = 'SHA-1'">SHA-1</button>
          <button :class="{ active: hashMode === 'SHA-384' }" @click="hashMode = 'SHA-384'">SHA-384</button>
          <button :class="{ active: hashMode === 'SHA-512' }" @click="hashMode = 'SHA-512'">SHA-512</button>
        </div>

        <div v-if="activeTool === 'regex'" class="regex-options">
          <el-input v-model="regexPattern" placeholder="正则表达式，例如 \\w+" clearable></el-input>
          <el-input v-model="regexFlags" placeholder="标记，例如 gim"></el-input>
        </div>

        <template v-if="activeTool === 'uuid'">
          <div class="uuid-panel">
            <el-input v-model="outputValue" readonly></el-input>
          </div>
        </template>
        <template v-else>
          <div class="editor-grid">
            <div class="editor-pane">
              <div class="pane-title">输入</div>
              <el-input
                v-model="inputValue"
                type="textarea"
                resize="none"
                :autosize="false"
                class="tool-textarea"
                :placeholder="currentTool.placeholder"
              ></el-input>
            </div>
            <div class="editor-pane">
              <div class="pane-title">输出</div>
              <el-input
                v-model="outputValue"
                type="textarea"
                resize="none"
                readonly
                :autosize="false"
                class="tool-textarea"
              ></el-input>
            </div>
          </div>
        </template>

        <div class="bottom-actions">
          <el-button :icon="CopyDocument" @click="copyOutput">复制结果</el-button>
          <el-button :icon="DocumentAdd" @click="saveHistory">保存历史</el-button>
        </div>
      </div>

      <aside class="history-panel">
        <div class="history-head">
          <div>
            <div class="history-title">历史记录</div>
            <div class="history-count">{{ historyList.length }} 条</div>
          </div>
          <el-button text type="danger" @click="clearHistory">清空</el-button>
        </div>
        <div class="history-search">
          <el-input v-model="historyKeyword" size="small" placeholder="搜索历史" clearable></el-input>
        </div>
        <div class="history-list">
          <button v-for="item in filteredHistory" :key="item.id" class="history-item" @click="useHistory(item)">
            <div class="history-line">
              <strong>{{ toolNameMap[item.tool_type] }}</strong>
              <span>
                {{ formatTime(item.created_at) }}
                <el-icon @click.stop="deleteHistory(item.id)"><Delete /></el-icon>
              </span>
            </div>
            <div class="history-output">{{ item.output }}</div>
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  Coin,
  CopyDocument,
  Delete,
  Document,
  DocumentAdd,
  Key,
  Lock,
  Search,
  Switch
} from '@element-plus/icons-vue'
import {
  addToolHistoryDB,
  clearToolHistoryDB,
  deleteToolHistoryDB,
  getToolHistoryDB
} from '@/api/toolHistory'

type ToolType = 'json' | 'timestamp' | 'codec' | 'uuid' | 'hash' | 'jwt' | 'regex'
type JsonMode = 'format' | 'compact'
type CodecMode = 'base64Encode' | 'base64Decode' | 'urlEncode' | 'urlDecode'
type HashMode = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

interface ToolItem {
  type: ToolType
  name: string
  desc: string
  placeholder: string
  icon: any
}

interface HistoryItem {
  id: number
  tool_type: ToolType
  input: string
  output: string
  created_at: number
}

const tools: ToolItem[] = [
  { type: 'json', name: 'JSON', desc: '格式化、压缩和校验 JSON 文本', placeholder: '粘贴 JSON 文本', icon: Document },
  { type: 'timestamp', name: '时间戳', desc: '时间戳和本地时间互转', placeholder: '输入时间戳，支持秒或毫秒', icon: Clock },
  { type: 'codec', name: '编解码', desc: 'Base64、URL 编码和解码', placeholder: '输入需要转换的文本', icon: Coin },
  { type: 'uuid', name: 'UUID', desc: '生成随机 UUID 并保存历史', placeholder: '', icon: Key },
  { type: 'hash', name: '哈希', desc: '生成 SHA 系列摘要，适合校验文本', placeholder: '输入需要计算摘要的文本', icon: Lock },
  { type: 'jwt', name: 'JWT', desc: '解析 JWT Header 和 Payload', placeholder: '粘贴 JWT 字符串', icon: Key },
  { type: 'regex', name: '正则', desc: '测试正则表达式匹配结果', placeholder: '输入需要匹配的文本', icon: Search }
]
const toolNameMap = tools.reduce<Record<string, string>>((map, item) => {
  map[item.type] = item.name
  return map
}, {})
const activeTool = ref<ToolType>('json')
const jsonMode = ref<JsonMode>('format')
const codecMode = ref<CodecMode>('base64Encode')
const hashMode = ref<HashMode>('SHA-256')
const toolKeyword = ref('')
const historyKeyword = ref('')
const regexPattern = ref('')
const regexFlags = ref('g')
const inputValue = ref('')
const outputValue = ref('')
const historyList = ref<HistoryItem[]>([])
const currentTool = computed(() => tools.find(item => item.type === activeTool.value) || tools[0])
const filteredTools = computed(() => {
  const keyword = toolKeyword.value.trim().toLowerCase()
  if (!keyword) return tools
  return tools.filter(item => item.name.toLowerCase().includes(keyword) || item.desc.toLowerCase().includes(keyword))
})
const filteredHistory = computed(() => {
  const keyword = historyKeyword.value.trim().toLowerCase()
  if (!keyword) return historyList.value
  return historyList.value.filter(item => {
    return [toolNameMap[item.tool_type], item.input, item.output].join(' ').toLowerCase().includes(keyword)
  })
})

const selectTool = (type: ToolType) => {
  if (activeTool.value === type) return
  activeTool.value = type
  inputValue.value = ''
  outputValue.value = ''
  if (type === 'uuid') {
    generateUuid()
  }
}

const runTool = async () => {
  if (activeTool.value === 'json') {
    runJsonTool()
  }
  if (activeTool.value === 'timestamp') {
    runTimestampTool()
  }
  if (activeTool.value === 'codec') {
    runCodecTool()
  }
  if (activeTool.value === 'uuid') {
    generateUuid()
  }
  if (activeTool.value === 'hash') {
    await runHashTool()
  }
  if (activeTool.value === 'jwt') {
    runJwtTool()
  }
  if (activeTool.value === 'regex') {
    runRegexTool()
  }
}

const runJsonTool = () => {
  try {
    const data = JSON.parse(inputValue.value)
    outputValue.value = jsonMode.value === 'format' ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  } catch (e) {
    outputValue.value = ''
    ElMessage.error('JSON 格式不正确')
  }
}

const runTimestampTool = () => {
  const value = inputValue.value.trim()
  const time = Number(value)
  if (!value || Number.isNaN(time)) {
    outputValue.value = [
      `当前毫秒: ${Date.now()}`,
      `当前秒: ${Math.floor(Date.now() / 1000)}`,
      `当前时间: ${new Date().toLocaleString()}`
    ].join('\n')
    return
  }
  const date = new Date(value.length === 10 ? time * 1000 : time)
  outputValue.value = [
    `本地时间: ${date.toLocaleString()}`,
    `毫秒时间戳: ${date.getTime()}`,
    `秒时间戳: ${Math.floor(date.getTime() / 1000)}`
  ].join('\n')
}

const runCodecTool = () => {
  const text = inputValue.value
  try {
    if (codecMode.value === 'base64Encode') outputValue.value = toBase64(text)
    if (codecMode.value === 'base64Decode') outputValue.value = fromBase64(text)
    if (codecMode.value === 'urlEncode') outputValue.value = encodeURIComponent(text)
    if (codecMode.value === 'urlDecode') outputValue.value = decodeURIComponent(text)
  } catch (e) {
    outputValue.value = ''
    ElMessage.error('输入内容无法完成解码')
  }
}

const runHashTool = async () => {
  const bytes = new TextEncoder().encode(inputValue.value)
  const buffer = await crypto.subtle.digest(hashMode.value, bytes)
  outputValue.value = Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

const runJwtTool = () => {
  try {
    const parts = inputValue.value.trim().split('.')
    if (parts.length < 2) {
      ElMessage.error('JWT 格式不正确')
      return
    }
    const header = JSON.parse(fromBase64Url(parts[0]))
    const payload = JSON.parse(fromBase64Url(parts[1]))
    outputValue.value = [
      'Header:',
      JSON.stringify(header, null, 2),
      '',
      'Payload:',
      JSON.stringify(payload, null, 2),
      '',
      `Signature: ${parts[2] ? parts[2].length + ' chars' : '-'}`
    ].join('\n')
  } catch (e) {
    outputValue.value = ''
    ElMessage.error('JWT 无法解析')
  }
}

const runRegexTool = () => {
  try {
    if (!regexPattern.value) {
      ElMessage.error('请输入正则表达式')
      return
    }
    const flags = regexFlags.value.includes('g') ? regexFlags.value : `${regexFlags.value}g`
    const regexp = new RegExp(regexPattern.value, flags)
    const matches = Array.from(inputValue.value.matchAll(regexp))
    if (!matches.length) {
      outputValue.value = '未匹配到结果'
      return
    }
    outputValue.value = matches.map((match, index) => {
      return [`#${index + 1}`, `index: ${match.index}`, `value: ${match[0]}`].join('\n')
    }).join('\n\n')
  } catch (e) {
    outputValue.value = ''
    ElMessage.error('正则表达式不正确')
  }
}

const toBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const fromBase64 = (text: string) => {
  const binary = atob(text)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const fromBase64Url = (text: string) => {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  return fromBase64(padded)
}

const generateUuid = () => {
  outputValue.value = crypto.randomUUID()
}

const clearInput = () => {
  inputValue.value = ''
  outputValue.value = ''
}

const copyOutput = async () => {
  if (!outputValue.value) return
  await navigator.clipboard.writeText(outputValue.value)
  ElMessage.success('已复制')
}

const saveHistory = async () => {
  if (!outputValue.value) return
  const { code } = await addToolHistoryDB({
    tool_type: activeTool.value,
    input: inputValue.value,
    output: outputValue.value
  })
  if (code === 200) {
    ElMessage.success('已保存')
    loadHistory()
  }
}

const loadHistory = async () => {
  const { code, data } = await getToolHistoryDB()
  if (code === 200) {
    historyList.value = data
  }
}

const useHistory = (item: HistoryItem) => {
  activeTool.value = item.tool_type
  inputValue.value = item.input
  outputValue.value = item.output
}

const clearHistory = () => {
  ElMessageBox.confirm('确定清空所有历史记录吗？', '清空确认', {
    type: 'warning'
  }).then(async () => {
    const { code } = await clearToolHistoryDB()
    if (code === 200) {
      historyList.value = []
    }
  }).catch(() => undefined)
}

const deleteHistory = async (id: number) => {
  const { code } = await deleteToolHistoryDB({ id })
  if (code === 200) {
    loadHistory()
  }
}

const formatTime = (time: number) => {
  return new Date(time).toLocaleTimeString()
}

onMounted(() => {
  generateUuid()
  loadHistory()
})
</script>

<style lang="scss" scoped>
.tool-page {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.tool-nav {
  width: 116px;
  margin-right: 8px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  flex-shrink: 0;
}

.tool-search {
  margin-bottom: 6px;
}

.tool-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-bottom: 4px;
  padding: 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}

.tool-item .el-icon {
  margin-right: 6px;
  font-size: 18px;
}

.tool-item.active {
  background: #2563eb;
  color: #ffffff;
}

.tool-workspace {
  display: flex;
  min-width: 0;
  flex: 1;
}

.tool-main,
.history-panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.tool-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.tool-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 12px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.tool-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-desc {
  margin-top: 2px;
  font-size: 14px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tool-head > div:first-child {
  min-width: 0;
}

.tool-actions .el-button + .el-button {
  margin-left: 6px;
}

.mode-switch {
  display: flex;
  height: 38px;
  padding: 7px 10px 0;
  flex-shrink: 0;
}

.mode-switch button {
  height: 30px;
  margin-right: 6px;
  padding: 0 10px;
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
}

.mode-switch button.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.regex-options {
  display: flex;
  height: 42px;
  padding: 8px 10px 0;
  flex-shrink: 0;
}

.regex-options .el-input + .el-input {
  width: 130px;
  margin-left: 8px;
  flex-shrink: 0;
}

.editor-grid {
  display: flex;
  min-height: 0;
  padding: 10px;
  flex: 1;
}

.editor-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 50%;
}

.editor-pane + .editor-pane {
  margin-left: 10px;
}

.pane-title {
  height: 28px;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  flex-shrink: 0;
}

.tool-textarea {
  min-height: 0;
  flex: 1;
}

.tool-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  font-family: Consolas, monospace;
  font-size: 14px;
  line-height: 22px;
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  height: 46px;
  padding: 7px 10px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.bottom-actions .el-button + .el-button {
  margin-left: 6px;
}

.uuid-panel {
  display: flex;
  align-items: center;
  padding: 14px;
  flex: 1;
}

.history-panel {
  display: flex;
  flex-direction: column;
  width: 230px;
  margin-left: 8px;
  flex-shrink: 0;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 10px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.history-search {
  padding: 6px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.history-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.history-count {
  margin-top: 2px;
  font-size: 14px;
  color: #64748b;
}

.history-list {
  min-height: 0;
  padding: 6px;
  flex: 1;
  overflow: auto;
}

.history-item {
  width: 100%;
  margin-bottom: 6px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.history-item:hover {
  background: #f8fafc;
}

.history-line {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.history-line strong {
  color: #111827;
}

.history-line span {
  display: flex;
  align-items: center;
  color: #64748b;
}

.history-line .el-icon {
  margin-left: 8px;
  color: #94a3b8;
}

.history-line .el-icon:hover {
  color: #ef4444;
}

.history-output {
  margin-top: 8px;
  max-height: 44px;
  overflow: hidden;
  color: #475569;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}
</style>
