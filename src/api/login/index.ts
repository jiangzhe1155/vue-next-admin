import request from '/@/utils/request';

import OSS from "ali-oss";
/**
 * 用户登录
 * @param params 要传的参数值
 * @returns 返回接口数据
 */
export function signIn(params: object) {
	return request({
		url: '/user/signIn',
		method: 'post',
		data: params,
	});
}

/**
 * 用户退出登录
 * @param params 要传的参数值
 * @returns 返回接口数据
 */
export function signOut(params: object) {
	return request({
		url: '/user/signOut',
		method: 'post',
		data: params,
	});
}


export const client = new OSS({
	region: 'oss-cn-shenzhen',//节点
	accessKeyId: 'LTAIYkHJxTeKUftZ',
	accessKeySecret: 'sJ43H04r23wtTCZHurA0OLqyf01k7W',
	bucket: 'jiangzhe-eshop'
})
