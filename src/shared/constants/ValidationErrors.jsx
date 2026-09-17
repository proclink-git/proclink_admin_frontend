/* eslint-disable react/display-name */
/* eslint-disable react/jsx-no-undef */

import { FormattedMessage, useIntl } from 'react-intl'

/* eslint-disable react/react-in-jsx-scope */
export const validationErrors = {
  // required: <FormattedMessage id="required" />,
  required: 'This field is required',
  email: <FormattedMessage id="validEmail" />,
  url: <FormattedMessage id="validUrl" />,
  date: <FormattedMessage id="validDate" />,
  number: <FormattedMessage id="validNumber" />,
  IFSCCode: <FormattedMessage id="validIfscCode" />,
  accountNumber: <FormattedMessage id="validAccountNumber" />,
  digit: <FormattedMessage id="pleaseEnterOnlyDigits" />,
  // maxLength: (length) => `Please enter a value less than or equal to ${length}.`,
  minLength: (length) => `${useIntl().formatMessage({ id: 'enterGreater' })} ${length}.`,
  // rangeLength: (min, max) => {
  //   <FormattedMessage
  //     id="rangeLength"
  //     values={{
  //       min: min,
  //       max: max
  //     }}
  //   />
  // },
  rangeLength: (min, max) =>
    `${useIntl().formatMessage({ id: 'rangeLength' })} ${min} ${useIntl().formatMessage({ id: 'and' })} ${max} ${useIntl().formatMessage({
      id: 'charLong'
    })}`,
  maxLength: (length) => `${useIntl().formatMessage({ id: 'enterLess' })} ${length}.`,
  passwordRegEx: <FormattedMessage id="passwordRegEx" />,
  passwordNotMatch: <FormattedMessage id="passwordNotMatch" />,
  selectOnePermission: <FormattedMessage id="selectOnePermission" />,
  noSPace: <FormattedMessage id="noSPace" />,
  customURL: <FormattedMessage id="customURL" />,
  customURLWithSlash: <FormattedMessage id="customURLWithSlash" />,
  notAvailable: <FormattedMessage id="notAvailable" />,
  category: <FormattedMessage id="category" />,
  captain: <FormattedMessage id="captainRequired" />,
  viceCaptain: <FormattedMessage id="viceCaptainRequired" />,
  oldAndNewUrlCanNotBeSame: <FormattedMessage id="oldAndNewUrlCanNotBeSame" />,
  wicketKeeper: <FormattedMessage id="wicketKeeperRequired" />,
  selectElevenPlayersOnly: <FormattedMessage id="selectElevenPlayersOnly" />,
  thirdPlayer: <FormattedMessage id="thirdPlayerRequired" />,
  selectRoleAndPermission: <FormattedMessage id="selectRoleAndPermission" />,
  noSpecialCharacters: <FormattedMessage id="noSpecialCharacters" />,
  selectCorrectAnswer: <FormattedMessage id="selectCorrectAnswer" />,
  noNegative: <FormattedMessage id="noNegative" />,
  commonRange: (min = 5, max = 1000) =>
    `${useIntl().formatMessage({ id: 'rangeLength' })} ${min} ${useIntl().formatMessage({ id: 'and' })} ${max} ${useIntl().formatMessage({
      id: 'charLong'
    })}`,
  underscoreAndDot: <FormattedMessage id="underscoreAndDot" />,
  youtubeURL: 'PLease add valid youtube URL'
}
