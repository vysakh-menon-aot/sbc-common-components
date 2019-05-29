// users.test.js
import Axios from 'axios'
import FeeServices from '../../src/services/fee.services'

jest.mock('axios', () => ({
  get: jest.fn(),
  all: jest.fn(),
  spread: jest.fn()
}), {
  virtual: true
})

const API_URL = 'https://pay-api-dev.pathfinder.gov.bc.ca/api/v1/fees'

describe('with 1 fee in the list', () => {
  const results = []
  const mockAxiosSpreadResult = jest.fn()
  var filingCodes = [{ filingDescription: 'Annual Filing', filingTypeCode: 'OTANN', entityType: 'CP' }]
  beforeAll(() => {
    // @ts-ignore
    Axios.get.mockClear()
    // @ts-ignore
    Axios.all.mockResolvedValue(results)
    // @ts-ignore
    Axios.spread.mockReturnValue(mockAxiosSpreadResult)
    FeeServices.getFee(filingCodes)
  })

  it('should call Axios.get once for each student with name', () => {
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}/CP/OTANN`, { 'headers': { 'Authorization': 'Bearer null' } })
  })
})

describe('with 2 fee in the list', () => {
  const results = []
  const mockAxiosSpreadResult = jest.fn()
  var filingCodes = [{ filingDescription: 'Annual Filing', filingTypeCode: 'OTANN', entityType: 'CP' }, { filingDescription: 'Director Change', filingTypeCode: 'OTADD', entityType: 'CP' }]
  beforeAll(() => {
    // @ts-ignore
    Axios.get.mockClear()
    // @ts-ignore
    Axios.all.mockResolvedValue(results)
    // @ts-ignore
    Axios.spread.mockReturnValue(mockAxiosSpreadResult)
  })

  it('should call Axios.get once for each student with name', () => {
    FeeServices.getFee(filingCodes)
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}/CP/OTANN`, { 'headers': { 'Authorization': 'Bearer null' } })
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}/CP/OTADD`, { 'headers': { 'Authorization': 'Bearer null' } })
  })
})
