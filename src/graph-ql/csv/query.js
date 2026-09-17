import { gql } from '@apollo/client'

export const GET_CONTACT_FOR_CSV = gql`
  query GetLeadInfo($input: getLeadInfoInput) {
    getLeadInfo(input: $input) {
      oData {
        aInquiry {
          dCreated
          sFullName
          sEmail
          sCountry
          sCompanyName
          sNumber
          sState
          sUrl
        }
        aContact {
          dCreated
          dUpdated
          sFullName
          sEmail
          sCompanyName
          sPhoneNumber
          sDiscussionTopic
          sMessage
          eStatus
          bMarketingOpt
          sUrl
        }
      }
    }
  }
`
