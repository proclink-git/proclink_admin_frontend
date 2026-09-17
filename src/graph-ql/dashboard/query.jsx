import { gql } from '@apollo/client'

export const DASHBOARD_ARTICLE = gql`
  query GetDashBoardArticle($input: getDashBoardArticleInput) {
    getDashBoardArticle(input: $input) {
      oCount {
        nPending
        nPublished
        nReview
        nWriting
      }
      oResult {
        aPending {
          _id
          sTitle
          dModifiedDate
          eHeaderCategoryType
          oAssignedTo {
            sFName
          }
        }
        aPublished {
          _id
          sTitle
          dPublishDate
          eHeaderCategoryType
          oAuthor {
            sFName
          }
        }
        aReview {
          sTitle
          _id
          dModifiedDate
          eHeaderCategoryType
          oAuthor {
            sFName
          }
        }
        aWriting {
          _id
          sTitle
          dModifiedDate
          eHeaderCategoryType
          oReviewer {
            sFName
          }
        }
      }
    }
  }
`

export const SUB_ADMINS_LIST = gql`
  query ListSubAdmins($input: subAdminInput) {
    listSubAdmins(input: $input) {
      aResults {
        _id
        sFName
      }
      nTotal
    }
  }
`

export const ARTICLE_DASHBOARD_COUNT = gql`
  query GetArticleDashboardCounts {
    getArticleDashboardCounts {
      aCounts {
        eType
        nPublished
        nPublishedCurrentMonth
        nPublishedToday
      }
    }
  }
`

export const USER_COUNT = gql`
  query GetUserDashboardCounts {
    getUserDashboardCounts {
      aCounts {
        eType
        nTodayTotalVisit
      }
    }
  }
`
