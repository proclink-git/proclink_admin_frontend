import { gql } from '@apollo/client'

export const GET_CHATBOT_INPUT_META = gql`
query GetChatBotInputMeta($input: getChatBotInputMetaInput!) {
  getChatBotInputMeta(input: $input) {
    oData {
      _id
      eType
      aMessage {
        sMessage
        eEvent
      }
      aData
    }
    sMessage
  }
}
`

export const LIST_CHATBOT_RESPONSE = gql`
query ListChatBotResponse($input: listChatBotResponseInput) {
  listChatBotResponse(input: $input) {
    nTotal
    sMessage
    aResults {
      _id
      dCreated
      sEmail
      sIndustry
      sName
      sPhoneNumber
      sService
    }
  }
}
`
