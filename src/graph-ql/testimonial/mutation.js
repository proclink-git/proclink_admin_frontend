import { gql } from '@apollo/client'

export const ADD_TESTIMONIAL = gql`
  mutation AddTestimonial($input: addTestimonialInput!) {
    addTestimonial(input: $input) {
      sMessage
    }
  }
`

export const EDIT_TESTIMONIAL = gql`
  mutation EditTestimonial($input: editTestimonialInput!) {
    editTestimonial(input: $input) {
      sMessage
    }
  }
`

export const GET_TESTIMONIAL_BY_ID = gql`
  query GetTestimonial($input: oGetTestimonialInput!) {
    getTestimonial(input: $input) {
      sMessage
      oTestimonial {
        oImg {
          sAttribute
          sCaption
          sText
          sUrl
        }
        oVideo {
          sUrl
        }
        sClientName
        sDescription
        sTitle
      }
    }
  }
`

export const BULK_TESTIMONIAL_UPDATE = gql`
mutation BulkTestimonialUpdate($input: bulkTestimonialUpdateInput) {
  bulkTestimonialUpdate(input: $input) {
    sMessage
  }
}
`
