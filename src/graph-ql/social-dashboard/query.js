import { gql } from '@apollo/client'

export const GET_SOCIAL_MEDIA_DASHBOARD = gql`
query GetSocialMediaDashboardData($input: getSocialMediaInput!) {
  getSocialMediaDashboardData(input: $input) {
    sMessage
    oData {
      _id
      dUpdated
      oTwitter {
        nFollowersCount
        nFollowingCount
        nLikeCount
        nListedCount
        nTweetCount
        sName
        sProfileImageUrl
        sTwitterId
        sUserName
      }
      oInstagram {
        nFollowersCount
        nFollowingCount
        nMediaCount
        sUserName
      }
      oFacebook {
        aPages {
          nFollowersCount
          nFanCount
          sName
          aPageImpressions {
            end_time
            value
          }
        }
      }
      oLinkedIn {
        nFollowersCount
        nImpressionCount
        nLikeCount
        sName
      }
    }
  }
}
`

export const GET_SOCIAL_MEDIA_DASHBOARD_V2 = gql`
query GetSocialDashboardCountV2($input: getSocialDashboardCount) {
  getSocialDashboardCountV2(input: $input) {
    sMessage
    oData {
      oInstaGramCount {
        sUserName
        nFollowersCount
        nFollowingCount
        nMediaCount
      }
      oFacebookCount {
        sUserName
        nFollowersCount
        nPageImpressions
        nFanCount
      }
    }
  }
}
`
