import { gql } from '@apollo/client'

export const GENERATE_SLUG = gql`
  query Query($sSlug: String!) {
    generateSlugs(input: { sSlug: $sSlug }) {
      oData {
        bIsExists
        sSlug
      }
      sMessage
    }
  }
`
