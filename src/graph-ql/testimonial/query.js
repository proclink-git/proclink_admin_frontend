import { gql } from '@apollo/client'

export const LIST_TESTIMONIAL = gql`
  query ListTestimonials($input: oListTestimonialInput!) {
    listTestimonials(input: $input) {
      aResults {
        _id
        dCreated
        sTitle
        sClientName
      }
      nTotal
    }
  }
`

export const LIST_TESTIMONIAL_WITHOUT_PERMISSION = gql`
  query AResults($input: oListTestimonialWithoutPermissionInput!) {
    listTestimonialWithoutPermissions(input: $input) {
      aResults {
        _id
        sTitle
      }
    }
  }
`
