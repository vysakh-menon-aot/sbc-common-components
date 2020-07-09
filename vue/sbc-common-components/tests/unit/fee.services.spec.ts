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

const API_URL = 'https://pay-api-dev.pathfinder.gov.bc.ca/api/v1/'

describe('with 1 fee in the list', () => {
  const results = []
  const mockAxiosSpreadResult = jest.fn()
  var filingCodes = [{ filingDescription: 'Annual Filing', filingTypeCode: 'OTANN', waiveFees: false, entityType: 'CP', priority: false, futureEffective: false }]
  beforeAll(() => {
    // @ts-ignore
    Axios.get.mockClear()
    // @ts-ignore
    Axios.all.mockResolvedValue(results)
    // @ts-ignore
    Axios.spread.mockReturnValue(mockAxiosSpreadResult)
    FeeServices.getFee(filingCodes, API_URL)
  })

  it('should call Axios.get once for each Fee ', () => {
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}fees/CP/OTANN`, { 'headers': { 'Account-Id': 0, 'Authorization': 'Bearer null' } })
  })
})

describe('with 2 fee in the list', () => {
  const results = []
  const mockAxiosSpreadResult = jest.fn()
  var filingCodes = [
    { filingDescription: 'Annual Filing', filingTypeCode: 'OTANN', entityType: 'CP', waiveFees: false, priority: false, futureEffective: false },
    { filingDescription: 'Director Change', filingTypeCode: 'OTADD', entityType: 'CP', waiveFees: false, priority: false, futureEffective: false }
  ]
  beforeAll(() => {
    // @ts-ignore
    Axios.get.mockClear()
    // @ts-ignore
    Axios.all.mockResolvedValue(results)
    // @ts-ignore
    Axios.spread.mockReturnValue(mockAxiosSpreadResult)
    FeeServices.getFee(filingCodes, API_URL)
  })

  it('should call Axios.get once for each filing code', () => {
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}fees/CP/OTANN`, { 'headers': { 'Account-Id': 0, 'Authorization': 'Bearer null' } })
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}fees/CP/OTADD`, { 'headers': { 'Account-Id': 0, 'Authorization': 'Bearer null' } })
  })
})

describe('with 1 fee in the list with extra fees', () => {
  const results = []
  const mockAxiosSpreadResult = jest.fn()
  var filingCodes = [{ filingTypeCode: 'BCRSF', waiveFees: false, entityType: 'BC', priority: true, futureEffective: true }]
  beforeAll(() => {
    // @ts-ignore
    Axios.get.mockClear()
    // @ts-ignore
    Axios.all.mockResolvedValue(results)
    // @ts-ignore
    Axios.spread.mockReturnValue(mockAxiosSpreadResult)
    FeeServices.getFee(filingCodes, API_URL)
  })

  it('should call Axios.get once with extra fee parameters ', () => {
    expect(Axios.get).toHaveBeenCalledWith(`${API_URL}fees/BC/BCRSF?priority=true&futureEffective=true`, { 'headers': { 'Account-Id': 0, 'Authorization': 'Bearer null' } })
  })
})
