// users.test.js
import Axios from 'axios'
import StatusServices from '../../src/services/status.services'

jest.mock('axios', () => ({
  get: jest.fn(),
  all: jest.fn(),
  spread: jest.fn()
}), {
  virtual: true
})

const API_URL = 'https://status-api-dev.pathfinder.gov.bc.ca/api/v1'

describe('get status for payment service', () => {
  const results: any = []
  const mockAxiosSpreadResult = jest.fn()
  var serviceName = 'PAYBC'
  beforeAll(() => {
    // @ts-ignore
    Axios.get.mockClear()
    // @ts-ignore
    Axios.all.mockResolvedValue(results)
    // @ts-ignore
    Axios.spread.mockReturnValue(mockAxiosSpreadResult)
    StatusServices.getServiceStatus(serviceName)
  })

  it('should call Axios.get once for status ', () => {
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}/status/PAYBC`)
  })
})
