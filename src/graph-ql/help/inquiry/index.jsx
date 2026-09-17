import { gql } from '@apollo/client'

export const GET_INQUIRY_LIST = gql`
query ListInquiry($input: ListInquiryInput!) {
  ListInquiry(input: $input) {
    nTotal
    aResults {
      _id
      sFullName
      sEmail
      sCompanyName
      sCountry
      eHeaderCategoryType
      sUrl
      bChecked
      eStatus
      dCreated
      dUpdated
    }
  }
}

`

export const GET_INQUIRY_BY_ID = gql`
query GetInquiryById($input: GetInquiryById) {
  getInquiryById(input: $input) {
    _id
    sFullName
    sEmail
    sCompanyName
    sCountry
    eHeaderCategoryType
    sUrl
    bChecked
    eStatus
    dCreated
    dUpdated
  }
}
`
