<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="520px" destroy-on-close @close="closeHand">
    <el-form ref="formRef" :model="dataForm" label-width="80px">
      <el-form-item prop="first_name" label="姓名">
        <el-input v-model="dataForm.first_name" placeholder="请输入姓名"></el-input>
      </el-form-item>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="dataForm.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeHand">取消</el-button>
      <el-button :loading="submitting" @click="submit" type="primary">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { addOrUpdateUserDB, getUserInfoByIdDB } from '@/api/user'

interface UserForm {
  id: number | ''
  first_name: string
  email: string
}

const visible = ref(false)
const submitting = ref(false)
const formRef = ref()
const dataForm = reactive<UserForm>({
  id: '',
  first_name: '',
  email: ''
})
const dialogTitle = computed(() => dataForm.id ? '编辑用户' : '新增用户')
const emits = defineEmits(['success'])

const init = (row?: UserForm) => {
  visible.value = true
  dataForm.id = row?.id || ''
  dataForm.first_name = ''
  dataForm.email = ''
  if (dataForm.id) {
    getInfoHand()
  }
}

const getInfoHand = async () => {
  const { code, data } = await getUserInfoByIdDB({ id: dataForm.id })
  if (code === 200) {
    dataForm.first_name = data.first_name
    dataForm.email = data.email
    dataForm.id = data.id
  }
}

const submit = async () => {
  if (!dataForm.first_name || !dataForm.email) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  const { code } = await addOrUpdateUserDB({
    id: dataForm.id,
    first_name: dataForm.first_name,
    email: dataForm.email
  })
  submitting.value = false
  if (code === 200) {
    ElMessage.success('操作成功')
    closeHand()
    emits('success')
  }
}

const closeHand = () => {
  formRef.value?.resetFields?.()
  visible.value = false
  submitting.value = false
}

defineExpose({
  init
})
</script>

<style lang="scss" scoped></style>
