<template>
  <el-form class="login-content-form">
    <el-form-item>
      <el-input type="text" placeholder="请输入邮箱" v-model="ruleForm.email" clearable autocomplete="off">
        <template #prefix>
          <i class="iconfont icon-dianhua el-input__icon"></i>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-row :gutter="15">
        <el-col :span="16">
          <el-input type="text" maxlength="6" placeholder="请输入验证码" v-model="ruleForm.code" clearable autocomplete="off">
            <template #prefix>
              <el-icon class="el-input__icon">
                <elementPosition/>
              </el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button class="login-content-code" @click="getVerifyCode">{{ getVerifyCodeText }}</el-button>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" class="login-content-submit" round>
        <span>{{ $t('message.mobile.btnText') }}</span>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import {toRefs, reactive, defineComponent, computed} from 'vue';

export default defineComponent({
  name: 'loginEmailCode',
  setup() {
    const TIME_COUNT = 60;
    const state = reactive({
      ruleForm: {
        email: '',
        code: '',
      },
      isVerifyCodeButtonInActive: true,
      disableVerifyCodeTimeout: TIME_COUNT,
      timer: null as any
    });

    const getVerifyCode = () => {
      // 校验是否是合法的手机号 或者邮箱号
      state.isVerifyCodeButtonInActive = false;
      state.disableVerifyCodeTimeout = TIME_COUNT;
      // 启动计时器
      state.timer = setInterval(() => {
        if (state.disableVerifyCodeTimeout > 0 && state.disableVerifyCodeTimeout <= TIME_COUNT) {
          state.disableVerifyCodeTimeout--;
        } else {
          state.isVerifyCodeButtonInActive = true;
          clearInterval(state.timer);
          state.timer = null;
        }
      }, 1000);
    };

    const getVerifyCodeText = computed(() => {
      if (state.isVerifyCodeButtonInActive) {
        return "获取验证码";
      }

      return state.disableVerifyCodeTimeout + '秒';
    });

    return {
      ...toRefs(state),
      getVerifyCode,
      getVerifyCodeText
    };
  },
});
</script>

<style scoped lang="scss">
.login-content-form {
  margin-top: 20px;

  .login-content-code {
    width: 100%;
    padding: 0;
  }

  .login-content-submit {
    width: 100%;
    letter-spacing: 2px;
    font-weight: 300;
    margin-top: 15px;
  }
}
</style>
