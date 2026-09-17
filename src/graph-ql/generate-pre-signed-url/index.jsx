import gql from 'graphql-tag'

export const GENERATE_PRE_SIGNED = gql`
  mutation GeneratePreSignedUrlMutation($generatePreSignedUrlInput: [generatePreSignedUrl]) {
    generatePreSignedUrl(input: $generatePreSignedUrlInput) {
      sS3Url
      sType
      sUploadUrl
    }
  }
`
