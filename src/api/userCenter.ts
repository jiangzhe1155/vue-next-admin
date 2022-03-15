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

export const listSystem = (systemListReq: SystemReq) => {
    return request.post('/api/userCenter/system/list', systemListReq);
}


export interface SendVerifyCodeReq {
    notifyWay: string,
    phone?: string,
    email?: string
}

export const sendVerifyCode = (sendVerifyCodeReq: SendVerifyCodeReq) => {
    return request.post('/api/userCenter/user/sendVerifyCode', sendVerifyCodeReq);
}

interface MenuDTO {
    id: string,
    type: string,
    name: string,
    pId: string,
    icon: string,
    children: MenuDTO[]
}

export interface SystemMenuDTO {
    systemId: string,
    menus: MenuDTO
}

export const getAllSystemRoute = () => {
    return request.post('/api/userCenter/menu/getAllSystemRoute', {});
}

export const getSystemRoute = function (params: any) {
    return request.post('/api/userCenter/menu/getSystemRoute', params);
}

export const userLogin = (userLoginReq: UserLoginReq) => {
    return request.post('/api/userCenter/user/login', userLoginReq);
}

export const userLogout = () => {
    return request.post('/api/userCenter/user/logout', {});
}


