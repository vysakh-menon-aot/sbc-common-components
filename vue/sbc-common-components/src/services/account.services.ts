import ConfigHelper from '../util/config-helper'
import Axios, { AxiosResponse } from 'axios'
import { Accounts } from '../models/account'
import { addAxiosInterceptors } from '../util/interceptors'
import { Members, Member } from '../models/member'

const axios = addAxiosInterceptors(Axios.create())

export default class AccountService {
  static getAccounts (): Promise<AxiosResponse<Accounts>> {
    return axios.get(`${ConfigHelper.getAuthAPIUrl()}/users/orgs`)
  }

  static getPendingMembers (accountId: number): Promise<AxiosResponse<Members>> {
    return axios.get(`${ConfigHelper.getAuthAPIUrl()}/orgs/${accountId}/members?status=PENDING_APPROVAL`)
  }

  static getMembership (accountId: number): Promise<AxiosResponse<Member>> {
    return axios.get(`${ConfigHelper.getAuthAPIUrl()}/users/orgs/${accountId}/membership`)
  }
}
