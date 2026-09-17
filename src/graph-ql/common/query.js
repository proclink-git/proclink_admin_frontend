export const GET_SERVER_URL = `
  query GetFrontUrlData($input: getFrontUrlDataInput) {
    getFrontUrlData(input: $input) {
      oData
      sMessage
    }
  }
`
