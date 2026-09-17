import { gql } from '@apollo/client'

export const GET_CONTACTS_LIST = gql`
 query GetContacts($input: getContactInput!) {
  getContacts(input: $input) {
    nTotal
    aResults {
      _id
      sFullName
      sEmail
      sCompanyName
      sPhoneNumber
      sDiscussionTopic
      sMessage
      dCreated
      dUpdated
      eStatus
      bMarketingOpt
      sUrl
    }
  }
}
`

export const GET_CONTACT_BY_ID = gql`
query GetContactById($input: getContactById) {
  getContactById(input: $input) {
    _id
    sFullName
    sEmail
    sCompanyName
    sPhoneNumber
    sDiscussionTopic
    sMessage
    dCreated
    dUpdated
    eStatus
    bMarketingOpt
    sUrl
  }
}
`

export const DELETE_CONTACT = gql`
  mutation DeleteContact($input: deleteContact) {
    deleteContact(input: $input) {
      sMessage
    }
  }
`

export const BULK_CONTACT_DELETE = gql`
  mutation BulkContactDelete($input: bulkContactActionInput) {
    bulkContactDelete(input: $input) {
      sMessage
    }
  }
`
