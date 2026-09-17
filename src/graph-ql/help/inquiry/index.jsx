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
      sJobTitle
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
    sJobTitle
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

export const DELETE_INQUIRY = gql`
  mutation DeleteInquiry($input: deleteInquiry) {
    deleteInquiry(input: $input) {
      sMessage
    }
  }
`

export const BULK_INQUIRY_DELETE = gql`
  mutation BulkInquiryDelete($input: bulkInquiryActionInput) {
    bulkInquiryDelete(input: $input) {
      sMessage
    }
  }
`
