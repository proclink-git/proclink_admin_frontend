import { gql } from '@apollo/client'

export const EDIT_CHATBOT_INPUT = gql`
mutation EditChatBotInputMeta($input: editChatBotInputMetaInput!) {
  editChatBotInputMeta(input: $input) {
    oData {
      _id
      aData
      eType
      aMessage {
          sMessage
          eEvent
       }
    }
    sMessage
  }
}
`
