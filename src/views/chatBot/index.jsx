import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { allRoutes } from 'shared/constants/AllRoutes'
import { useHistory, useLocation } from 'react-router-dom'
import KeyWordForm from 'shared/components/chat-bot-input-form/chat-bot-keywords'
import IndustryForm from 'shared/components/chat-bot-input-form/chat-bot-industries'
import ServiceForm from 'shared/components/chat-bot-input-form/chat-bot-services'
import MessageForm from 'shared/components/chat-bot-input-form/chat-bot-messages'

const ChatBot = () => {
  const location = useLocation()
  const history = useHistory()
  const tab = location?.state?.tab

  const handleTabs = () => {
    if (!tab) {
      return <KeyWordForm />
    } else if (tab === 'industry') {
      return <IndustryForm tab={tab} />
    } else if (tab === 'service') {
      return <ServiceForm />
    } else if (tab === 'message') {
      return <MessageForm />
    }
  }

  return (
    <>
      <Tab.Container>
        <Nav variant="tabs" className="common-tabs">
          <Nav.Item>
            <Nav.Link active={!tab} onClick={() => history.push({ pathname: allRoutes.chatBot })}>
              <FormattedMessage id="KeywordMenu" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={tab === 'industry'}
              onClick={() => history.push({ pathname: allRoutes.chatBot, search: '?tab=industry', state: { tab: 'industry' } })}
            >
              <FormattedMessage id="IndustryMenu" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={tab === 'service'}
              onClick={() => history.push({ pathname: allRoutes.chatBot, search: '?tab=service', state: { tab: 'service' } })}
            >
              <FormattedMessage id="ServiceMenu" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={tab === 'message'}
              onClick={() => history.push({ pathname: allRoutes.chatBot, search: '?tab=message', state: { tab: 'message' } })}
            >
              <FormattedMessage id="MessageMenu" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>{handleTabs()}</Tab.Content>
      </Tab.Container>
    </>
  )
}

export default ChatBot
