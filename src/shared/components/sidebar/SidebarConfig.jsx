import { HEADER_CATEGORY_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'

const PRODUCT_LIST_PERMISSIONS = ['LIST_PRODUCT', 'LIST_SERVICE', 'LIST_INDUSTRY']
const MEDIA_GALLERY_LIST_PERMISSIONS = ['LIST_MEDIA_GALLERY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_SETTING_PERMISSIONS = ['SETTING_MEDIA_GALLERY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_CATEGORY_PERMISSIONS = ['LIST_MEDIA_GALLERY_CATEGORY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_SECTION_PERMISSIONS = [
  ...MEDIA_GALLERY_LIST_PERMISSIONS,
  ...MEDIA_GALLERY_SETTING_PERMISSIONS,
  ...MEDIA_GALLERY_CATEGORY_PERMISSIONS
]

export const sidebarConfig = (permission) => {
  const hasAnyPermission = (permissions = []) => permissions.some((allowedPermission) => permission?.includes(allowedPermission))

  function getBlogURL() {
    if (permission?.includes('LIST_BLOG')) return allRoutes.blogList(HEADER_CATEGORY_TYPE.blog)
    else if (permission?.includes('SETTING_BLOG')) return allRoutes.headerBlogCategory(HEADER_CATEGORY_TYPE.blog)
    else if (permission?.includes('LIST_BLOG_CATEGORY')) return allRoutes.blogCategory(HEADER_CATEGORY_TYPE.blog)
    else if (permission?.includes('LIST_BLOG_AUTHOR')) return allRoutes.authorsList(HEADER_CATEGORY_TYPE.blog)
  }

  function getWebinarURL() {
    if (permission?.includes('LIST_WEBINAR')) return allRoutes.webinarList(HEADER_CATEGORY_TYPE.webinar)
    else if (permission?.includes('SETTING_WEBINAR')) return allRoutes.headerWebinarCategory(HEADER_CATEGORY_TYPE.webinar)
    else if (permission?.includes('LIST_WEBINAR_CATEGORY')) return allRoutes.webinarCategory(HEADER_CATEGORY_TYPE.webinar)
  }

  function getPodcastURL() {
    if (permission?.includes('LIST_PODCAST')) return allRoutes.podcastList(HEADER_CATEGORY_TYPE.podcast)
    else if (permission?.includes('SETTING_PODCAST')) return allRoutes.headerPodcastCategory(HEADER_CATEGORY_TYPE.podcast)
    else if (permission?.includes('LIST_PODCAST_CATEGORY')) return allRoutes.podcastCategory(HEADER_CATEGORY_TYPE.podcast)
  }

  function getWhitePaperURL() {
    if (permission?.includes('LIST_WHITEPAPER')) return allRoutes.whitePaperList(HEADER_CATEGORY_TYPE['white-papers'])
    else if (permission?.includes('SETTING_WHITEPAPER')) return allRoutes.headerWhitepaperCategory(HEADER_CATEGORY_TYPE['white-papers'])
    else if (permission?.includes('LIST_WHITEPAPER_CATEGORY')) return allRoutes.whitePaperCategory(HEADER_CATEGORY_TYPE['white-papers'])
  }

  function getResearchReportURL() {
    if (hasAnyPermission(['LIST_RESEARCH_REPORT', 'LIST_WHITEPAPER'])) return allRoutes.researchReportList(HEADER_CATEGORY_TYPE['research-reports'])
    else if (hasAnyPermission(['SETTING_RESEARCH_REPORT', 'SETTING_WHITEPAPER'])) {
      return allRoutes.headerResearchReportCategory(HEADER_CATEGORY_TYPE['research-reports'])
    } else if (hasAnyPermission(['LIST_RESEARCH_REPORT_CATEGORY', 'LIST_WHITEPAPER_CATEGORY'])) {
      return allRoutes.researchReportCategory(HEADER_CATEGORY_TYPE['research-reports'])
    }
  }

  function getVideoListingURL() {
    if (hasAnyPermission(['LIST_VIDEO_LISTING', 'LIST_WEBINAR'])) return allRoutes.videoListingList(HEADER_CATEGORY_TYPE['video-listing'])
    else if (hasAnyPermission(['SETTING_VIDEO_LISTING', 'SETTING_WEBINAR'])) {
      return allRoutes.headerVideoListingCategory(HEADER_CATEGORY_TYPE['video-listing'])
    } else if (hasAnyPermission(['LIST_VIDEO_LISTING_CATEGORY', 'LIST_WEBINAR_CATEGORY'])) {
      return allRoutes.videoListingCategory(HEADER_CATEGORY_TYPE['video-listing'])
    }
  }

  function getCaseStudyURL() {
    if (permission?.includes('LIST_CASE_STUDY')) return allRoutes.caseStudyList(HEADER_CATEGORY_TYPE['case-studies'])
    else if (permission?.includes('SETTING_CASE_STUDY')) return allRoutes.headerCaseStudyCategory(HEADER_CATEGORY_TYPE['case-studies'])
    else if (permission?.includes('LIST_CASE_STUDY_CATEGORY')) return allRoutes.caseStudyCategory(HEADER_CATEGORY_TYPE['case-studies'])
  }

  function getNewsAndEventURL() {
    if (permission?.includes('LIST_NEWS_EVENTS')) return allRoutes.newsAndEventList(HEADER_CATEGORY_TYPE['company-updates'])
    else if (permission?.includes('SETTING_NEWS_EVENTS')) return allRoutes.headerNewsCategory(HEADER_CATEGORY_TYPE['company-updates'])
    else if (permission?.includes('LIST_NEWS_EVENTS_CATEGORY')) {
      return allRoutes.newsAndEventCategory(HEADER_CATEGORY_TYPE['company-updates'])
    }
  }

  function getMediaGalleryURL() {
    if (hasAnyPermission(MEDIA_GALLERY_LIST_PERMISSIONS)) return allRoutes.mediaGalleryList(HEADER_CATEGORY_TYPE['media-gallery'])
    else if (hasAnyPermission(MEDIA_GALLERY_SETTING_PERMISSIONS)) {
      return allRoutes.headerMediaGalleryCategory(HEADER_CATEGORY_TYPE['media-gallery'])
    } else if (hasAnyPermission(MEDIA_GALLERY_CATEGORY_PERMISSIONS)) {
      return allRoutes.mediaGalleryCategory(HEADER_CATEGORY_TYPE['media-gallery'])
    }

    return allRoutes.media
  }

  function getSolutionsURL() {
    if (permission?.includes('LIST_SERVICE')) return allRoutes.services
    else if (permission?.includes('LIST_INDUSTRY')) return allRoutes.industries
    else if (permission?.includes('LIST_PRODUCT')) return allRoutes.products
  }

  return [
    {
      path: allRoutes.dashboard,
      icon: 'icon-home',
      title: 'Home',
      children: [
        { path: allRoutes.dashboard, title: 'Dashboard' }
        // { path: allRoutes.socialDashboard, title: 'Social Dashboard' }
      ]
    },
    {
      path: getBlogURL(),
      icon: 'icon-feed',
      title: 'Blog',
      isArray: true,
      isAllowedTo: ['LIST_BLOG', 'LIST_BLOG_CATEGORY', 'LIST_BLOG_AUTHOR', 'SETTING_BLOG'],
      children: [
        { path: allRoutes.headerBlogCategory(HEADER_CATEGORY_TYPE.blog), title: 'Blog Setting', isAllowedTo: 'SETTING_BLOG' },
        { path: allRoutes.blogList(HEADER_CATEGORY_TYPE.blog), title: 'Blogs', isAllowedTo: 'LIST_BLOG' },
        { path: allRoutes.blogCategory(HEADER_CATEGORY_TYPE.blog), title: 'Categories', isAllowedTo: 'LIST_BLOG_CATEGORY' },
        { path: allRoutes.authorsList(HEADER_CATEGORY_TYPE.blog), title: 'Authors', isAllowedTo: 'LIST_BLOG_AUTHOR' }
      ]
    },
    {
      path: getWebinarURL(),
      icon: 'icon-video-quiz',
      title: 'Webinar',
      isArray: true,
      isAllowedTo: ['LIST_WEBINAR', 'LIST_WEBINAR_CATEGORY', 'SETTING_WEBINAR'],
      children: [
        { path: allRoutes.headerWebinarCategory(HEADER_CATEGORY_TYPE.webinar), title: 'Webinar Setting', isAllowedTo: 'SETTING_WEBINAR' },
        { path: allRoutes.webinarList(HEADER_CATEGORY_TYPE.webinar), title: 'Webinar', isAllowedTo: 'LIST_WEBINAR' },
        { path: allRoutes.webinarCategory(HEADER_CATEGORY_TYPE.webinar), title: 'Categories', isAllowedTo: 'LIST_WEBINAR_CATEGORY' }
      ]
    },
    {
      path: getPodcastURL(),
      icon: 'icon-podcast',
      title: 'Podcast',
      isArray: true,
      isAllowedTo: ['LIST_PODCAST', 'LIST_PODCAST_CATEGORY', 'SETTING_PODCAST'],
      children: [
        { path: allRoutes.headerPodcastCategory(HEADER_CATEGORY_TYPE.podcast), title: 'Podcast Setting', isAllowedTo: 'SETTING_PODCAST' },
        { path: allRoutes.podcastList(HEADER_CATEGORY_TYPE.podcast), title: 'Podcast', isAllowedTo: 'LIST_PODCAST' },
        { path: allRoutes.podcastCategory(HEADER_CATEGORY_TYPE.podcast), title: 'Categories', isAllowedTo: 'LIST_PODCAST_CATEGORY' }
      ]
    },
    {
      path: getWhitePaperURL(),
      icon: 'icon-white-paper-icon',
      title: 'White Papers',
      isArray: true,
      isAllowedTo: ['LIST_WHITEPAPER', 'LIST_WHITEPAPER_CATEGORY', 'SETTING_WHITEPAPER'],
      children: [
        {
          path: allRoutes.headerWhitepaperCategory(HEADER_CATEGORY_TYPE['white-papers']),
          title: 'White paper Setting',
          isAllowedTo: 'SETTING_WHITEPAPER'
        },
        { path: allRoutes.whitePaperList(HEADER_CATEGORY_TYPE['white-papers']), title: 'White Papers', isAllowedTo: 'LIST_WHITEPAPER' },
        {
          path: allRoutes.whitePaperCategory(HEADER_CATEGORY_TYPE['white-papers']),
          title: 'Categories',
          isAllowedTo: 'LIST_WHITEPAPER_CATEGORY'
        }
      ]
    },
    {
      path: getResearchReportURL(),
      icon: 'icon-white-paper-icon',
      title: 'Research Reports',
      isArray: true,
      isAllowedTo: [
        'LIST_RESEARCH_REPORT',
        'LIST_RESEARCH_REPORT_CATEGORY',
        'SETTING_RESEARCH_REPORT',
        'LIST_WHITEPAPER',
        'LIST_WHITEPAPER_CATEGORY',
        'SETTING_WHITEPAPER'
      ],
      children: [
        {
          path: allRoutes.headerResearchReportCategory(HEADER_CATEGORY_TYPE['research-reports']),
          title: 'Research Reports Setting',
          isAllowedTo: ['SETTING_RESEARCH_REPORT', 'SETTING_WHITEPAPER'],
          isArray: true
        },
        {
          path: allRoutes.researchReportList(HEADER_CATEGORY_TYPE['research-reports']),
          title: 'Research Reports',
          isAllowedTo: ['LIST_RESEARCH_REPORT', 'LIST_WHITEPAPER'],
          isArray: true
        },
        {
          path: allRoutes.researchReportCategory(HEADER_CATEGORY_TYPE['research-reports']),
          title: 'Categories',
          isAllowedTo: ['LIST_RESEARCH_REPORT_CATEGORY', 'LIST_WHITEPAPER_CATEGORY'],
          isArray: true
        }
      ]
    },
    {
      path: getVideoListingURL(),
      icon: 'icon-video-quiz',
      title: 'Video Listing',
      isArray: true,
      isAllowedTo: [
        'LIST_VIDEO_LISTING',
        'LIST_VIDEO_LISTING_CATEGORY',
        'SETTING_VIDEO_LISTING',
        'LIST_WEBINAR',
        'LIST_WEBINAR_CATEGORY',
        'SETTING_WEBINAR'
      ],
      children: [
        {
          path: allRoutes.headerVideoListingCategory(HEADER_CATEGORY_TYPE['video-listing']),
          title: 'Video Listing Setting',
          isAllowedTo: ['SETTING_VIDEO_LISTING', 'SETTING_WEBINAR'],
          isArray: true
        },
        {
          path: allRoutes.videoListingList(HEADER_CATEGORY_TYPE['video-listing']),
          title: 'Video Listing',
          isAllowedTo: ['LIST_VIDEO_LISTING', 'LIST_WEBINAR'],
          isArray: true
        },
        {
          path: allRoutes.videoListingCategory(HEADER_CATEGORY_TYPE['video-listing']),
          title: 'Categories',
          isAllowedTo: ['LIST_VIDEO_LISTING_CATEGORY', 'LIST_WEBINAR_CATEGORY'],
          isArray: true
        }
      ]
    },
    {
      path: getCaseStudyURL(),
      icon: 'icon-feed',
      title: 'Case Studies',
      isArray: true,
      isAllowedTo: ['LIST_CASE_STUDY', 'LIST_CASE_STUDY_CATEGORY', 'SETTING_CASE_STUDY'],
      children: [
        {
          path: allRoutes.headerCaseStudyCategory(HEADER_CATEGORY_TYPE['case-studies']),
          title: 'Case Studies Setting',
          isAllowedTo: 'SETTING_CASE_STUDY'
        },
        { path: allRoutes.caseStudyList(HEADER_CATEGORY_TYPE['case-studies']), title: 'Case Studies', isAllowedTo: 'LIST_CASE_STUDY' },
        {
          path: allRoutes.caseStudyCategory(HEADER_CATEGORY_TYPE['case-studies']),
          title: 'Categories',
          isAllowedTo: 'LIST_CASE_STUDY_CATEGORY'
        }
      ]
    },
    {
      path: getNewsAndEventURL(),
      icon: 'icon-news-icon',
      title: 'Company Updates',
      isArray: true,
      isAllowedTo: ['LIST_NEWS_EVENTS', 'LIST_NEWS_EVENTS_CATEGORY', 'SETTING_NEWS_EVENTS'],
      children: [
        {
          path: allRoutes.headerNewsCategory(HEADER_CATEGORY_TYPE['company-updates']),
          title: 'Company Updates Setting',
          isAllowedTo: 'SETTING_NEWS_EVENTS'
        },
        {
          path: allRoutes.newsAndEventList(HEADER_CATEGORY_TYPE['company-updates']),
          title: 'Company Updates',
          isAllowedTo: 'LIST_NEWS_EVENTS'
        },
        {
          path: allRoutes.newsAndEventCategory(HEADER_CATEGORY_TYPE['company-updates']),
          title: 'Categories',
          isAllowedTo: 'LIST_NEWS_EVENTS_CATEGORY'
        }
      ]
    },
    {
      path: getSolutionsURL(),
      icon: 'icon-language',
      title: 'Solutions',
      isArray: true,
      isAllowedTo: PRODUCT_LIST_PERMISSIONS,
      children: [
        { path: allRoutes.services, title: 'Services', isAllowedTo: 'LIST_SERVICE' },
        { path: allRoutes.industries, title: 'Industries', isAllowedTo: 'LIST_INDUSTRY' },
        { path: allRoutes.products, title: 'Products', isAllowedTo: PRODUCT_LIST_PERMISSIONS, isArray: true }
      ]
    },
    {
      path: allRoutes.careers,
      icon: 'icon-feed',
      title: 'Careers',
      children: [
        { path: allRoutes.headerCareerCategory(HEADER_CATEGORY_TYPE.careers), title: 'Career Setting' },
        { path: allRoutes.careers, title: 'Career Openings' },
        { path: allRoutes.careerLocations, title: 'Locations' }
      ]
    },
    {
      path: getMediaGalleryURL(),
      icon: 'icon-image',
      title: 'Media Gallery',
      isArray: true,
      isAllowedTo: MEDIA_GALLERY_SECTION_PERMISSIONS,
      children: [
        {
          path: allRoutes.headerMediaGalleryCategory(HEADER_CATEGORY_TYPE['media-gallery']),
          title: 'Media Gallery Setting',
          isAllowedTo: MEDIA_GALLERY_SETTING_PERMISSIONS,
          isArray: true
        },
        {
          path: allRoutes.mediaGalleryList(HEADER_CATEGORY_TYPE['media-gallery']),
          title: 'Media Gallery',
          isAllowedTo: MEDIA_GALLERY_LIST_PERMISSIONS,
          isArray: true
        },
        {
          path: allRoutes.mediaGalleryCategory(HEADER_CATEGORY_TYPE['media-gallery']),
          title: 'Categories',
          isAllowedTo: MEDIA_GALLERY_CATEGORY_PERMISSIONS,
          isArray: true
        },
        { path: allRoutes.media, title: 'Media Library', isAllowedTo: 'VIEW_MEDIA_GALLERY', isArray: true, exact: true }
      ]
    },
    {
      path: allRoutes.roles,
      icon: 'icon-settings',
      title: 'Settings',
      isArray: true,
      isAllowedTo: [
        'LIST_ROLE',
        'LIST_USER',
        'VIEW_CURRENT_SERIES',
        'LIST_USER',
        'LIST_MIGRATION_TAG',
        'LIST_PLAYLIST',
        'LIST_SEO_REDIRECT',
        'LIST_SEO',
        'LIST_JOB',
        'LIST_ENQUIRY',
        'LIST_CMS_PAGE',
        'UPDATE_ICC_RANKINGS',
        'VIEW_ADS_TXT',
        'VIEW_MENU_ARRANGEMENT',
        'VIEW_HOME_PAGE_ARTICLE',
        'VIEW_MINISCORECARD_PRIO',
        'LIST_PAGE',
        'LIST_AUTHOR'
      ],
      children: [
        { path: allRoutes.roles, title: 'Role', isAllowedTo: 'LIST_ROLE' },
        { path: allRoutes.subAdmins, title: 'Users', isAllowedTo: 'LIST_USER' },
        // { path: allRoutes.endUsers, title: 'End Users', isAllowedTo: 'LIST_USER' },
        // { path: allRoutes.tagMigrationManagement, title: 'Tag Migration Management', isAllowedTo: 'LIST_MIGRATION_TAG' },
        // { path: allRoutes.youtubeVideo, title: 'Youtube Video', isAllowedTo: 'LIST_PLAYLIST' },
        { path: allRoutes.seoRedirects, title: 'SEO Redirects', isAllowedTo: 'LIST_SEO_REDIRECT' },
        { path: allRoutes.seo, title: 'SEO', isAllowedTo: 'LIST_SEO' },
        // { path: allRoutes.jobPost, title: 'Job Post', isArray: true, isAllowedTo: ['LIST_ENQUIRY', 'LIST_JOB'] },
        { path: allRoutes.cms, title: 'CMS Pages', isAllowedTo: 'LIST_CMS_PAGE' },
        // { path: allRoutes.syncStats, title: 'Sync Stats', isAllowedTo: 'UPDATE_ICC_RANKINGS' },
        // { path: allRoutes.ads, title: 'Ads.txt', isAllowedTo: 'VIEW_ADS_TXT' },
        { path: allRoutes.arrangeMenu, title: 'Arrange Menu', isAllowedTo: 'VIEW_MENU_ARRANGEMENT' },
        { path: allRoutes.listPage, title: 'Pages', isAllowedTo: 'LIST_PAGE' },
        // { path: allRoutes.miniScorecardPriority, title: 'Mini Scorecard Priority', isAllowedTo: 'VIEW_MINISCORECARD_PRIO' },
        // { path: allRoutes.feed, title: 'Feed' }
        // { path: allRoutes.marquee, title: 'Marquee' },
        { path: allRoutes.projectConfig, title: 'Project Config' }
      ]
    },
    {
      path: allRoutes.pageComponents,
      icon: 'icon-widget',
      title: 'Components',
      isAllowedTo: 'LIST_COMPONENT'
    },
    // {
    //   path: allRoutes.popupList,
    //   icon: 'icon-mediaPoll',
    //   title: 'Popups',
    //   isAllowedTo: 'LIST_POPUP'
    // },
    // {
    //   path: allRoutes.poll,
    //   icon: 'icon-poll',
    //   title: 'Poll',
    //   isArray: true,
    //   isAllowedTo: ['VIEW_POLL', 'LIST_QUIZ'],
    //   children: [
    //     // { path: allRoutes.poll, title: 'Poll', isAllowedTo: 'VIEW_POLL' },
    //     { path: allRoutes.quizList, title: 'Quiz', isAllowedTo: 'LIST_QUIZ' }
    //   ]
    // },
    // {
    //   path: allRoutes.articleComments,
    //   icon: 'icon-comment-rounded',
    //   title: 'Comments',
    //   isAllowedTo: ['LIST_COMMENT'],
    //   isArray: true,
    //   children: [
    //     { path: allRoutes.articleComments, title: 'Article Comments', isAllowedTo: 'LIST_COMMENT' },
    //     { path: allRoutes.fantasyArticleComments, title: 'Fantasy Article Comments', isAllowedTo: 'LIST_COMMENT' }
    //   ]
    // }
    // {
    //   path: allRoutes.testimonials,
    //   icon: 'icon-comment-rounded',
    //   title: 'Testimonial',
    //   isAllowedTo: 'LIST_TESTIMONIAL'
    // },
    {
      path: allRoutes.inquiry,
      icon: 'icon-help',
      title: 'Lead Management',
      isAllowedTo: ['LIST_INQUIRY', 'LIST_CONTACT'],
      isArray: true,
      children: [
        { path: allRoutes.inquiry, title: 'Inquiry', isAllowedTo: 'LIST_INQUIRY' },
        { path: allRoutes.contacts, title: 'Contacts', isAllowedTo: 'LIST_CONTACT' }
      ]
    }
  ]
}
