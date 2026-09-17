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
