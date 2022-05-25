import request from "/@/utils/request";

export enum LoginType {
    password = 'password',
    phoneCode = 'phoneCode',
    phonePassword = 'phonePassword',
    emailCode = 'emailCode',
    emailPassword = 'emailPassword',
    thirdPartyBindInfo = 'thirdPartyBindInfo'
}

export interface UserLoginReq {
    username?: string,
    phone?: string,
    email?: string,
    password?: string,
    verifyCode?: string,
    areaCode?: string,
    loginType: LoginType
}

export interface UserLoginResult {
    tokenName: string
    tokenTimeout: number
    tokenValue: string
}

export interface SystemReq {
    name?: string
    pageNo?: number
    pageSize?: number
}


export interface SystemDTO {
    id: string
    name: number
    createTime: Date,
    updateTime: Date
}

export const pageSystem = (systemPageReq: SystemReq) => {
    return request.post('/api/userCenter/system/page', systemPageReq);
}

export const listSystem = () => {
    return request.post('/api/userCenter/system/list', {});
}

export const deleteSystemMenu = (systemMenuDeleteReq: object) => {
    return request.post('/api/userCenter/menu/delete', systemMenuDeleteReq);
}

export interface SendVerifyCodeReq {
    notifyWay: string,
    phone?: string,
    email?: string
}

export const sendVerifyCode = (sendVerifyCodeReq: SendVerifyCodeReq) => {
    return request.post('/api/userCenter/user/sendVerifyCode', sendVerifyCodeReq);
}

export interface MenuDTO {
    id: string,
    type: string,
    typeName: string,
    name: string,
    pid: string,
    icon: string,
    level: number,
    children: MenuDTO[]
}

export enum MenuType {
    menu = 'menu',
    menuGroup = 'menuGroup'
}

export interface SystemMenuDTO {
    systemId: string,
    menus: MenuDTO
}

export const getSystemRoute = function (params: any) {
    return request.post('/api/userCenter/menu/getSystemRoute', params);
}


export const getSystemMenu = function (params: any) {
    return request.post('/api/userCenter/menu/getSystemMenu', params);
}

export const moveSystemMenu = function (params: any) {
    return request.post('/api/userCenter/menu/moveSystemMenu', params);
}

export const copySystemMenu = (systemMenuCopyReq: object) => {
    return request.post('/api/userCenter/menu/copy', systemMenuCopyReq);
}

export const batchDeleteSystemMenu = (systemMenubatchDeleteReq: object) => {
    return request.post('/api/userCenter/menu/batchDelete', systemMenubatchDeleteReq);
}

export const userLogin = (userLoginReq: UserLoginReq) => {
    return request.post('/api/userCenter/user/login', userLoginReq);
}

export const userLogout = () => {
    return request.post('/api/userCenter/user/logout', {});
}

export const addSystemMenu = function (menuAddReq: object) {
    return request.post('/api/userCenter/menu/add', menuAddReq);
}

export const updateSystemMenu = function (menuUpdateReq: object) {
    return request.post('/api/userCenter/menu/update', menuUpdateReq);
}


export const getBackendCategoryChildrenList = function (pid :string = '') {
    return request.post('/api/userCenter/backend/category/getChildren', {'pid':pid});
}

export const deleteBackendCategory = function (param:any) {
    return request.post('/api/userCenter/backend/category/delete', param);
}


export const getBackendCategoryTree = function () {
    return request.post('/api/userCenter/backend/category/getTree', {});
}

export const getBackendCategoryDetail = function (param:{}) {
    return request.post('/api/userCenter/backend/category/detail', param);
}

export const addBackendCategory = function (param: { }) {
    return request.post('/api/userCenter/backend/category/add', param);
}


export const updateBackendCategory = function (param: { }) {
    return request.post('/api/userCenter/backend/category/update', param);
}

export const detailBackendCategory = function (param: {}) {
    return request.post('/api/userCenter/backend/category/detail', param);
}

export const getFrontCategoryTree = function () {
    return request.post('/api/userCenter/front/category/getTree', {});
}


export const getItemPageData = function (param) {
    return request.post('/api/userCenter/item/page', param);
}


export const addBackendCategoryProperty = function (param) {
    return request.post('/api/userCenter/property/addProductProperty', param);
}

export const addBackendCategoryPropertyValue = function (param) {
    return request.post('/api/userCenter/property/addProductPropertyValue', param);
}

