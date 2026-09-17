import { gql } from '@apollo/client'

export const GET_MARQUEE = gql`
 query GetMarquee {
  getMarquee {
    sMessage
    oData {
      aMarquee
      {
        sTitle
        sUrl
      }
    }
  }
}`
