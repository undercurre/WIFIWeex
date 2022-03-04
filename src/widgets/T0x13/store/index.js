import Vuex from 'vuex';
import debugUtil from "../../../util/debugUtil";
import nativeService from "../../../service/nativeService";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    deviceInfo: {},
    deviceDetail: {},
    homeInfo: {},
    userInfo: {}
  },
  getters: {},
  mutations: {
    setDeviceInfo(state, payload) {
      state.deviceInfo = payload;
      debugUtil.log('setDeviceInfo', state.deviceInfo);
    },
    setDeviceDetail(state, payload) {
      state.deviceDetail = payload;
    },
    setUserInfo(state, payload) {
      state.userInfo = payload;
    },
    setHomeInfo(state, payload) {
      state.homeInfo = payload;
    }
  },
  actions: {
    /**
     * 更新设备信息
     */
    async updateDeviceInfo({commit}) {
      debugUtil.log('更新设备信息')
      const response = await nativeService.getDeviceInfo().catch(err => {
        debugUtil.log('updateDeviceInfo err', err);
        nativeService.toast('设备信息获取失败');
      });
      debugUtil.log('updateDeviceInfo:', response);
      commit('setDeviceInfo', response.result);
      return response;
    },
    /**
     * 更新设备状态
     */
    async updateDeviceDetail({state, dispatch, commit}, {isShowLoading = true} = {}) {
      debugUtil.log('更新设备状态')
      debugUtil.log('updateDeviceDetail state.deviceInfo.applianceID', state.deviceInfo.applianceID);
      const response = await dispatch('getAllStand')
      debugUtil.log('response', response)
      if (response.code == 0) {
        commit('setDeviceDetail', response.result);
      } else {
        nativeService.toast('设备状态获取失败');
      }
      debugUtil.log('updateDeviceDetail response.result', response.result);
      return response;
    },
    /**
     * 更新用户信息
     */
    async updateUserInfo({commit}) {
      const response = await nativeService
        .getUserInfo()
        .catch(() => nativeService.toast('获取用户信息失败'));
      commit('setUserInfo', response);
      return response;
    },
    /**
     * 更新家庭信息
     */
    async updateHomeInfo({commit}) {
      const response = await nativeService
        .getCurrentHomeInfo()
        .catch(() => nativeService.toast('获取家庭信息失败'));
      commit('setHomeInfo', response);
      return response;
    },
    /**
     * 字节埋点
     */
    async trackEvent({state}, obj) {
      let params = {
        operation: 'trackEvent',
        event: obj.event,
        eventParams: {
          module: '插件', // 模块
          bd_name: '美智光电', // 事业部名称
          widget_name: `T${state.deviceInfo.deviceType}_${state.deviceInfo.deviceSn8}`, // 插件包名称
          widget_version: WIDGET_VERSION,  // 插件包版本号
          apptype_name: '香薰灯', // 设备品类名称
          widget_cate: state.deviceInfo.deviceType, // 设备品类代码
          widget_type: state.productCode, // 设备型号，传市场型号
          // widget_type: '', // 由于子设备没有sn8以及网关通过sn去查设备型号会出异常,因为网关sn截出来的sn8是动态的,无法匹配dcp的内容,所以按要求传空
          sn8: state.deviceInfo.deviceSn8, //deviceInfo.deviceSubType.padStart(8,'0'), // SN8
          a0: '', // A0
          iot_device_id: state.deviceInfo.deviceId, // 15位设备ID
          is_legal: '是',
          result: '成功',
          fail_reason: ''
        }
      };

      //自定义参数obj增量替换通用参数eventParams
      params.eventParams = Object.assign({}, params.eventParams, obj);
      debugUtil.log('trackEvent埋点参数打印', JSON.stringify(params));
      delete params.eventParams.event;
      await nativeService.commandInterfaceWrapper(params);
    },
    /**
     * 物模型请求方法
     */
    async requestObjectModel({state}, params) {
      debugUtil.log('物模型调用前获取设备参数', state.deviceInfo)
      const deviceCode = state.deviceInfo.deviceId
      debugUtil.log('物模型调用前获取设备参数Id', deviceCode)
      let url = '/v1/appliance/operation/' + params.model + '/' + deviceCode
      debugUtil.log('调用物模型-params', url);
      debugUtil.log('调用物模型-params', params.method);
      debugUtil.log('调用物模型-params', params.data);
      let res = await nativeService
        .sendCentralCloundRequest(url,
          {
            method: params.method || 'POST',
            data: params.data || {},
          },
          {isShowLoading: false}
        )
        .catch(() => nativeService.toast('物模型调用失败'));
      debugUtil.log('调用物模型-res', res);
      return res;
    },
    /**
     * 物模型：查询电控状态
     */
    async getAllStand({dispatch}) {
      return dispatch('requestObjectModel', {
        model: 'getAllStand',
        method: 'GET',
        data: {}
      })
    },
    /**
     * 物模型-开关灯接口
     * @param
     */
    powerToggle({dispatch}, order) {
      return dispatch('requestObjectModel', {
        model: 'togglePower',
        method: 'POST',
        data: {
          power: order
        }
      })
    },
    /**
     * 物模型-调节色温
     * @param {"colorTemperatureValue":0} data
     */
    async setColorTemperatureValue({dispatch}, value) {
      console.log('物模型调色', value)
      return dispatch('requestObjectModel', {
        model: 'setColorTemperatureValue',
        method: 'POST',
        data: {
          colorTemperatureValue: value
        }
      })
    },
    /**
     * 物模型-调节亮度
     * @param {"brightValue":0} data
     */
    async setBrightValue({dispatch}, value) {
      return dispatch('requestObjectModel', {
        model: 'setBrightValue',
        method: 'POST',
        data: {
          brightValue: value,
        }
      })
    },
    /**
     * 物模型-场景模式调光
     * @param {"screenModel":null} data
     */
    setScreenModel({dispatch}, model) {
      return dispatch('requestObjectModel', {
        model: 'setScreenModel',
        method: 'POST',
        data: {
          screenModel: model
        }
      })
    },
    /**
     * 物模型-控制喷雾
     * @param {"screenModel":null} data
     */
    controlFogMethod({dispatch}, model) {
      return dispatch('requestObjectModel', {
        model: 'controlFogMethod',
        method: 'POST',
        data: {
          fogMethod: model,
        }
      })
    }
  }
});
