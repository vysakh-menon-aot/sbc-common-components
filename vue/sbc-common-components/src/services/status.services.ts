import Axios, { AxiosResponse } from 'axios'
import { ServiceStatus } from '@/models'

export default {

  getServiceStatus (serviceName: string, statusURL: string): Promise<AxiosResponse<ServiceStatus>> {
    return Axios.get(`${statusURL}/status/${serviceName}`)
  }

}
