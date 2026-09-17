import { gql } from '@apollo/client'

export const ADD_MARQUEE = gql`
 mutation AddMarquee($input: oAddMarqueeInput) {
  addMarquee(input: $input) {
    sMessage
  }
}`
