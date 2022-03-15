<template>
  <el-form class="login-content-form" :rules="rules" ref="formRef"
           :model="ruleForm"
  >
    <el-form-item prop="email">
      <el-input size="large" type="text" placeholder="请输入邮箱" v-model="ruleForm.email"
                clearable autocomplete="off">
        <template #prefix>
          <el-icon class="el-input__icon">
            <elementMessage/>
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code">
      <el-row :gutter="15">
        <el-col :span="16">
          <el-input size="large" type="text" maxlength="6" placeholder="请输入验证码" v-model="ruleForm.code" clearable autocomplete="off">
            <template #prefix>
              <el-icon class="el-input__icon">
                <elementPosition/>
              </el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8" >
          <el-button class="login-content-code" @click="getVerifyCode"><span class="w-22">{{ getVerifyCodeText }}</span>
          </el-button>
        </el-col>
      </el-row>
    </el-form-item>
      <el-button type="primary" class="login-content-submit" round @click="onSignIn(formRef)"
                 :loading="loading.signIn"><span>{{ $t('message.mobile.btnText') }}</span>
      </el-button>
  </el-form>
</template>

<script lang="ts">
import {toRefs, reactive, defineComponent, computed, getCurrentInstance, ref} from 'vue';
import {formatAxis} from "/@/utils/formatTime";
import {ElForm, ElMessage, FormInstance} from "element-plus";
import {LoginType, sendVerifyCode, SendVerifyCodeReq, userLogin, UserLoginReq} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import {Local, Session} from "/@/utils/storage";
import {initFrontEndControlRoutes} from "/@/router/frontEnd";
import {initBackEndControlRoutes} from "/@/router/backEnd";
import {useI18n} from "vue-i18n";
import {useStore} from "/@/store";
import {useRoute, useRouter} from "vue-router";

export default defineComponent({
  name: 'loginEmailCode',
  setup() {
    const {t} = useI18n();
    const {proxy} = getCurrentInstance() as any;
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const TIME_COUNT = 60;
    const state = reactive({
      ruleForm: {
        email: '1024741733@qq.com',
        code: '',
      },
      isVerifyCodeButtonInActive: true,
      disableVerifyCodeTimeout: TIME_COUNT,
      timer: null as any,
      loading: {
        signIn: false,
      }, rules: {
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: [],
        }, {
          type: "email",
          message: '请输入正确的邮箱',
          trigger: [],
        }], code: [{
          required: true,
          message: '请输入验证码',
          trigger: [],
        }, {
          min: 6,
          max: 6,
          message: '请输入6位验证码',
          trigger: [],
        }]
      },
      formRef: ref<InstanceType<typeof ElForm>>()
    });

    const getVerifyCode = () => {
      if (state.isVerifyCodeButtonInActive) {

        let sendVerifyCodeReq: SendVerifyCodeReq = {
          email: state.ruleForm.email,
          notifyWay: 'email',
        }

        // 发送验证码
        useRequest(sendVerifyCode(sendVerifyCodeReq), {
          onSuccess: () => {
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
          }
        })
      }
    };

    // 时间获取
    const currentTime = computed(() => {
      return formatAxis(new Date());
    });

    // 登录
    const onSignIn = async (formEl: FormInstance) => {
      await formEl.validate((valid, fields) => {
        if (valid) {
          // 模拟数据
          state.loading.signIn = true;
          // 用户信息模拟数据
          const userInfos = {
            userName: '江哲',
            photo: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1813762643,1914315241&fm=26&gp=0.jpg',
            time: new Date().getTime(),
            roles: [],
            authBtnList: [],
          };

          let loginReq: UserLoginReq = {
            email: state.ruleForm.email as string,
            verifyCode: state.ruleForm.code,
            loginType: LoginType.emailCode,
          };

          useRequest(userLogin(loginReq), {
            onSuccess: async (tokenInfo) => {
              // 存储 token 到浏览器缓存
              Local.set('token', tokenInfo.data.tokenValue);
              Local.set('tokenName', tokenInfo.data.tokenName);
              // 存储用户信息到浏览器缓存
              Session.set('userInfo', userInfos);
              // 1、请注意执行顺序(存储用户信息到vuex)
              store.dispatch('userInfos/setUserInfos', userInfos);
              if (!store.state.themeConfig.themeConfig.isRequestRoutes) {
                // 前端控制路由，2、请注意执行顺序
                await initFrontEndControlRoutes();
                signInSuccess();
              } else {
                // 模拟后端控制路由，isRequestRoutes 为 true，则开启后端控制路由
                // 添加完动态路由，再进行 router 跳转，否则可能报错 No match found for location with path "/"
                await initBackEndControlRoutes();
                // 执行完 initBackEndControlRoutes，再执行 signInSuccess
                signInSuccess();
              }
            }, onError: () => {
              state.loading.signIn = false;
            }
          })
        }
      }).catch(() => {
      })
    };

    // 登录成功后的跳转
    const signInSuccess = () => {
      // 初始化登录成功时间问候语
      let currentTimeInfo = currentTime.value;
      // 登录成功，跳到转首页
      // 添加完动态路由，再进行 router 跳转，否则可能报错 No match found for location with path "/"
      // 如果是复制粘贴的路径，非首页/登录页，那么登录成功后重定向到对应的路径中
      if (route.query?.redirect) {
        router.push({
          path: route.query?.redirect,
          query: Object.keys(route.query?.params).length > 0 ? JSON.parse(route.query?.params) : '',
        });
      } else {
        router.push('/')
      }
      // 登录成功提示
      setTimeout(() => {
        // 关闭 loading
        state.loading.signIn = false;
        const signInText = t('message.signInText');
        ElMessage.success(`${currentTimeInfo}，${signInText}`);
        // 修复防止退出登录再进入界面时，需要刷新样式才生效的问题，初始化布局样式等(登录的时候触发，目前方案)
        proxy.mittBus.emit('onSignInClick');
      }, 300);
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
      getVerifyCodeText,
      onSignIn
    };
  },
});
</script>

<style scoped lang="scss">
.login-content-form {
  margin-top: 20px;

  .login-content-password {
    display: inline-block;
    width: 25px;
    cursor: pointer;

    &:hover {
      color: #909399;
    }
  }

  .login-content-code {
    display: flex;
    align-items: center;
    justify-content: space-around;

    .login-content-code-img {
      width: 100%;
      height: 40px;
      line-height: 40px;
      background-color: #ffffff;
      border: 1px solid rgb(220, 223, 230);
      color: #333;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 5px;
      text-indent: 5px;
      text-align: center;
      cursor: pointer;
      transition: all ease 0.2s;
      border-radius: 4px;
      user-select: none;

      &:hover {
        border-color: #c0c4cc;
        transition: all ease 0.2s;
      }
    }
  }

  .login-content-submit {
    width: 100%;
    letter-spacing: 2px;
    font-weight: 300;
    margin-top: 15px;
  }
}
</style>
