import Axios, { AxiosResponse } from 'axios'
import { ServiceStatus } from '../models'
import ConfigHelper from '../util/config-helper'

const statusUrl = ConfigHelper.getStatusAPIUrl()

export default class StatusService {
  static getServiceStatus (serviceName: string): Promise<AxiosResponse<ServiceStatus>> {
    return Axios.get(`${statusUrl}/status/${serviceName}`)
  }
}
