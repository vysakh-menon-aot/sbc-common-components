import Axios from 'axios'

// const API_URL = 'https://mock-lear-tools.pathfinder.gov.bc.ca/rest/SBC+Pay+API+Reference/1.0.1'
// sample microcks url https://mock-lear-tools.pathfinder.gov.bc.ca/rest/SBC+Pay+API+Reference/1.0.1/api/v1/fees/CP/OTANN
// https://mock-lear-tools.pathfinder.gov.bc.ca/rest/SBC+Pay+API+Reference/1.0.1/api/v1/fees/CP/OTADD
// const API_URL = 'https://mock-lear-tools.pathfinder.gov.bc.ca/rest/SBC+Pay+API+Reference/1.0.1'
const API_URL = 'https://pay-api-dev.pathfinder.gov.bc.ca/api/v1/fees'
export default {

  getFee (filingData: { filingDescription: string; filingTypeCode: string; entityType: string; }[]) {
    const token = sessionStorage.getItem('KEYCLOAK_TOKEN')
    if (filingData.length < 1) {
      Promise.resolve()
    }
    let promises = []
    for (const filing of filingData) {
      if (!filing.filingTypeCode) {
        Promise.resolve()
      }
      var url = `${API_URL}/${filing.entityType}/${filing.filingTypeCode}`

      promises.push(Axios.get(url, { headers: { Authorization: `Bearer ${token}` } }))
    }

    return Axios.all(promises)
      .then(Axios.spread((...args) => {
        // customise the response here
        return args
          .map(response => response.data)
          .map(data => {
            // @ts-ignore
            let clientPassedDesc = filingData.find(fee => fee.filingTypeCode === data.filing_type_code).filingDescription
            data.filingType = !clientPassedDesc ? data.filing_type : clientPassedDesc// just defaulting the title if client hasnt passed this on
            data.fee = data.filing_fees + data.service_fees + data.processing_fees + data.tax.gst + data.tax.pst// total fees is a sum of filing_fees,service_fees,processing_fees , gst , pst
            return data
          })
      }))
      .catch(error => {
        switch (error.response.status) {
          case 400:
            console.log('%c FeeMdoule-ERROR:Probably fee code mismatch %s', 'color: red ;font-size : 13px', JSON.stringify(this.filingData))
            break
          case 500:
            console.log('%c FeeMdoule-ERROR:Probably invalid Token %s', 'color: red ;font-size : 13px', JSON.stringify(this.filingData))

            break
          default:
            console.log('%c FeeMdoule-ERROR:Probably unknown Error %s', 'color: red ;font-size : 13px', JSON.stringify(this.filingData))

        }
      })
  }

}
