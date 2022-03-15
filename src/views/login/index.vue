<template>
  <div class="login-container">
    <div class="login-logo">
      <span>{{ getThemeConfig.globalViceTitle }}</span>
    </div>
    <div class="login-content" :class="{ 'login-content-mobile': tabsActiveName === 'mobile' }">
      <div class="login-content-main">
        <h4 class="login-content-title">{{ getThemeConfig.globalTitle }}</h4>
        <div></div>
        <el-divider>{{ getLoginWayText }}</el-divider>
        <el-tabs v-model="tabsActiveName" class="demo-tabs">
          <el-tab-pane label="手机号" :name="LoginType.phone" v-if="selectedLoginWay === LoginWay.password">
            <transition name="el-zoom-in-center">
              <Mobile/>
            </transition>
          </el-tab-pane>

          <el-tab-pane label="邮箱" :name="LoginType.email" v-if="selectedLoginWay === LoginWay.password">
            <transition name="el-zoom-in-center">
              <Email/>
            </transition>
          </el-tab-pane>

          <el-tab-pane label="手机号" :name="LoginType.phoneCode" v-if="selectedLoginWay === LoginWay.verifyCode">
            <transition name="el-zoom-in-center">
              <MobileCode/>
            </transition>
          </el-tab-pane>
          <el-tab-pane label="邮箱" :name="LoginType.emailCode" v-if="selectedLoginWay === LoginWay.verifyCode">
            <transition name="el-zoom-in-center">
              <EmailCode/>
            </transition>
          </el-tab-pane>
        </el-tabs>
        <el-button type="text" @click="onSwitchVerify"><span>{{ getLoginWayTextReverse }}</span>
        </el-button>
        <el-divider>其他登录方式</el-divider>

        <!--        <div v-if="!isScan">-->
        <!--        </div>-->
        <!--        <Scan v-else/>-->
        <!--        <div class="login-content-main-sacn" @click="isScan = !isScan">-->
        <!--          <i class="iconfont" :class="isScan ? 'icon-diannao1' : 'icon-barcode-qr'"></i>-->
        <!--          <div class="login-content-main-sacn-delta"></div>-->
        <!--        </div>-->
      </div>
    </div>
    <!--		<div class="login-copyright">-->
    <!--			<div class="mb5 login-copyright-company">{{ $t('message.copyright.one5') }}</div>-->
    <!--			<div class="login-copyright-msg">{{ $t('message.copyright.two6') }}</div>-->
    <!--		</div>-->
  </div>
</template>

<script lang="ts">
import {computed, reactive, toRefs} from 'vue';
import Account from '/@/views/login/component/account.vue';
import Mobile from '/@/views/login/component/mobile.vue';
import Scan from '/@/views/login/component/scan.vue';
import {useStore} from '/@/store';
import Email from "/@/views/login/component/email.vue";
import EmailCode from "/@/views/login/component/emailCode.vue";
import MobileCode from "/@/views/login/component/mobileCode.vue";
import {stat} from "fs";

export default {
  name: 'loginIndex',
  components: {Account, Mobile, Scan, Email, EmailCode, MobileCode},

  setup() {
    const enum LoginWay {
      password = 'password',
      verifyCode = 'verifyCode',
    }

    const enum LoginType {
      username = 'username',
      phone = 'phone',
      email = 'email',
      phoneCode = 'phoneCode',
      emailCode = 'emailCode'
    }

    const store = useStore();

    const state = reactive({
      tabsActiveName: LoginType.phone,
      isTabPaneShow: true,
      isScan: false,
      selectedLoginWay: LoginWay.password
    });


    const getLoginWayTextReverse = computed(() => {
      if (state.selectedLoginWay === LoginWay.password) {
        return "验证码登录/注册";
      } else {
        return "密码登录";
      }
    });

    const getLoginWayText = computed(() => {
      if (state.selectedLoginWay == LoginWay.password) {
        return "密码登录";
      } else {
        return "验证码登录/注册";
      }
    })

    const onSwitchVerify = () => {
      let selectedLoginWay = state.selectedLoginWay;
      if (selectedLoginWay == LoginWay.verifyCode) {
        state.selectedLoginWay = LoginWay.password;
        state.tabsActiveName = LoginType.phone
      } else {
        state.selectedLoginWay = LoginWay.verifyCode;
        state.tabsActiveName = LoginType.phoneCode;
      }
    }

    // 获取布局配置信息
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });


    return {
      getLoginWayTextReverse,
      getLoginWayText,
      getThemeConfig,
      onSwitchVerify,
      LoginWay,
      LoginType,
      ...toRefs(state),
    };
  },
};
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100%;
  background: url('https://gitee.com/lyt-top/vue-next-admin-images/raw/master/login/bg-login.png') no-repeat;
  background-size: 100% 100%;

  .login-logo {
    position: absolute;
    top: 30px;
    left: 50%;
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 20px;
    color: var(--color-primary);
    letter-spacing: 2px;
    width: 90%;
    transform: translateX(-50%);
  }

  .login-content {
    width: 500px;
    padding: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translate3d(0, 0, 0);
    background-color: rgba(255, 255, 255, 0.99);
    border: 5px solid var(--color-primary-light-8);
    border-radius: 4px;
    transition: height 0.2s linear;
    height: 480px;
    overflow: hidden;
    z-index: 1;

    .login-content-main {
      margin: 0 auto;
      width: 80%;

      .login-content-title {
        color: #333;
        font-weight: 500;
        font-size: 22px;
        text-align: center;
        letter-spacing: 4px;
        margin: 15px 0 30px;
        white-space: nowrap;
        z-index: 5;
        position: relative;
        transition: all 0.3s ease;
      }
    }

    .login-content-main-sacn {
      position: absolute;
      top: 0;
      right: 0;
      width: 50px;
      height: 50px;
      overflow: hidden;
      cursor: pointer;
      transition: all ease 0.3s;

      &-delta {
        position: absolute;
        width: 35px;
        height: 70px;
        z-index: 2;
        top: 2px;
        right: 21px;
        background: var(--el-color-white);
        transform: rotate(-45deg);
      }

      &:hover {
        opacity: 1;
        transition: all ease 0.3s;
        color: var(--color-primary);
      }

      i {
        width: 47px;
        height: 50px;
        display: inline-block;
        font-size: 48px;
        position: absolute;
        right: 2px;
        top: -1px;
      }
    }
  }

  .login-content-mobile {
    height: 418px;
  }

  .login-copyright {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 30px;
    text-align: center;
    color: var(--color-whites);
    font-size: 12px;
    opacity: 0.8;

    .login-copyright-company {
      white-space: nowrap;
    }

    .login-copyright-msg {
      @extend .login-copyright-company;
    }
  }
}
</style>
