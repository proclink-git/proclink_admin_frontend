import React from 'react'
import { allRoutes } from 'shared/constants/AllRoutes'

const Login = React.lazy(() => import('views/auth/login'))
const ForgotPassword = React.lazy(() => import('views/auth/forgot-password'))
const ResetPassword = React.lazy(() => import('views/auth/reset-password'))

const Dashboard = React.lazy(() => import('views/dashboard'))
const ArrangeMenu = React.lazy(() => import('views/settings/arrange-menu'))
const SubAdmins = React.lazy(() => import('views/settings/sub-admins'))
const AddEditSubAdmin = React.lazy(() => import('views/settings/add-edit-sub-admins'))
const Roles = React.lazy(() => import('views/settings/roles'))
const AddEditRole = React.lazy(() => import('views/settings/roles/add-edit-role'))
const ArticleLIst = React.lazy(() => import('views/article/article-list'))
const AddEditArticle = React.lazy(() => import('views/article/add-edit-article'))
const Tags = React.lazy(() => import('views/management/tags'))
const AddTag = React.lazy(() => import('views/management/add-edit-tag'))
const Categories = React.lazy(() => import('views/management/categories'))
const AddCategory = React.lazy(() => import('views/management/add-edit-category'))
const EditProfile = React.lazy(() => import('views/profile'))
const Feedbacks = React.lazy(() => import('views/help/inquiry'))
const Contacts = React.lazy(() => import('views/help/contacts'))
const SeoRedirects = React.lazy(() => import('views/settings/seo-redirects'))
const Seo = React.lazy(() => import('views/settings/seo'))
const AddEditSeo = React.lazy(() => import('views/settings/add-edit-seo'))
const EndUsers = React.lazy(() => import('views/settings/end-user'))
const DetailEndUser = React.lazy(() => import('views/settings/detail-end-user'))
const Cms = React.lazy(() => import('views/settings/cms'))
const AddEditCms = React.lazy(() => import('views/settings/add-edit-cms'))
const MediaPlugin = React.lazy(() => import('views/media-plugin'))
const MediaGalleryItems = React.lazy(() => import('views/media-gallery'))
const ComponentsList = React.lazy(() => import('views/page-components/list'))
const PageComponentEdit = React.lazy(() => import('views/page-components/edit'))
const Services = React.lazy(() => import('views/services'))
const AddEditService = React.lazy(() => import('views/services/add-edit-service'))
const Products = React.lazy(() => import('views/products'))
const AddEditProduct = React.lazy(() => import('views/products/add-edit-product'))
const Careers = React.lazy(() => import('views/careers'))
const AddEditCareer = React.lazy(() => import('views/careers/add-edit-career'))
const CareerLocations = React.lazy(() => import('views/careers/locations'))
const Testimonial = React.lazy(() => import('views/testimonials'))
const AddEditTestimonial = React.lazy(() => import('views/testimonials/add-edit-testimonial'))
const ListPage = React.lazy(() => import('views/settings/web-page/list'))
const EditPage = React.lazy(() => import('views/settings/web-page/edit'))
const CustomPage = React.lazy(() => import('shared/components/web-pages/custom-page'))
const ListAuthors = React.lazy(() => import('views/settings/author'))
const AddEditAuthor = React.lazy(() => import('views/settings/author/add-edit-author'))
const HeaderCategoryEdit = React.lazy(() => import('views/management/header-category-edit'))
const Industries = React.lazy(() => import('views/industries'))
const AddEditIndustries = React.lazy(() => import('views/industries/add-edit-industries'))
const PopupManagement = React.lazy(() => import('views/popup-management'))
const AddEditPopup = React.lazy(() => import('views/popup-management/add-edit-popup'))
const Marquee = React.lazy(() => import('views/settings/marquee'))
const ChatBotInput = React.lazy(() => import('views/chatBot'))
const chatBotResponse = React.lazy(() => import('views/chatBotResponse'))
const ProjectConfig = React.lazy(() => import('views/settings/project-config'))
const SocialDashboard = React.lazy(() => import('views/dashboard/social-dashboard'))

const PRODUCT_LIST_PERMISSIONS = ['LIST_PRODUCT', 'LIST_SERVICE', 'LIST_INDUSTRY']
const PRODUCT_CREATE_PERMISSIONS = ['CREATE_PRODUCT', 'CREATE_SERVICE', 'ADD_INDUSTRY']
const PRODUCT_EDIT_PERMISSIONS = ['EDIT_PRODUCT', 'EDIT_SERVICE', 'EDIT_INDUSTRY']
const MEDIA_GALLERY_LIST_PERMISSIONS = ['LIST_MEDIA_GALLERY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_SETTING_PERMISSIONS = ['SETTING_MEDIA_GALLERY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_CATEGORY_PERMISSIONS = ['LIST_MEDIA_GALLERY_CATEGORY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_CATEGORY_CREATE_PERMISSIONS = ['ADD_MEDIA_GALLERY_CATEGORY', 'VIEW_MEDIA_GALLERY']
const MEDIA_GALLERY_CATEGORY_EDIT_PERMISSIONS = ['EDIT_MEDIA_GALLERY_CATEGORY', 'VIEW_MEDIA_GALLERY']
const ARTICLE_CATEGORY_TYPES = ['b', 'w', 'p', 'wp', 'rr', 'vl', 'cs', 'cu']
const CATEGORY_MANAGEMENT_TYPES = [...ARTICLE_CATEGORY_TYPES, 'mg']

const Router = [
  {
    path: '',
    isRequiredLoggedIn: false,
    children: [
      { path: allRoutes.login, component: Login, exact: true },
      { path: allRoutes.forgotPassword, component: ForgotPassword, exact: true },
      { path: allRoutes.resetPassword, component: ResetPassword, exact: true }
    ]
  },
  {
    path: '',
    isRequiredLoggedIn: true,
    children: [
      { path: allRoutes.dashboard, component: Dashboard, exact: true },
      { path: allRoutes.roles, component: Roles, exact: true, isAllowedTo: 'LIST_ROLE' },
      { path: allRoutes.roleAdd, component: AddEditRole, exact: true, isAllowedTo: 'CREATE_ROLE' },
      { path: allRoutes.roleEdit(':id'), component: AddEditRole, exact: true, isAllowedTo: 'EDIT_ROLE' },
      { path: allRoutes.subAdmins, component: SubAdmins, exact: true, isAllowedTo: 'LIST_USER' },
      { path: allRoutes.addSubAdmin, component: AddEditSubAdmin, exact: true, isAllowedTo: 'CREATE_USER' },
      { path: allRoutes.editSubAdmin(':id'), component: AddEditSubAdmin, exact: true, isAllowedTo: 'EDIT_USER' },

      { path: allRoutes.blogList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_BLOG'] },
      { path: allRoutes.webinarList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_WEBINAR'] },
      { path: allRoutes.podcastList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_PODCAST'] },
      { path: allRoutes.whitePaperList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_WHITEPAPER'] },
      { path: allRoutes.researchReportList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_RESEARCH_REPORT', 'LIST_WHITEPAPER'] },
      { path: allRoutes.videoListingList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_VIDEO_LISTING', 'LIST_WEBINAR'] },
      { path: allRoutes.caseStudyList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_CASE_STUDY'] },
      { path: allRoutes.newsAndEventList(':categoryType'), component: ArticleLIst, exact: true, isAllowedTo: ['LIST_NEWS_EVENTS'] },
      { path: allRoutes.mediaGalleryList(':categoryType'), component: MediaGalleryItems, exact: true, isAllowedTo: MEDIA_GALLERY_LIST_PERMISSIONS },

      { path: allRoutes.headerBlogCategory(':categoryType'), component: HeaderCategoryEdit, exact: true, isAllowedTo: ['SETTING_BLOG'] },
      {
        path: allRoutes.headerWebinarCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_WEBINAR']
      },
      {
        path: allRoutes.headerPodcastCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_PODCAST']
      },
      {
        path: allRoutes.headerWhitepaperCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_WHITEPAPER']
      },
      {
        path: allRoutes.headerResearchReportCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_RESEARCH_REPORT', 'SETTING_WHITEPAPER']
      },
      {
        path: allRoutes.headerVideoListingCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_VIDEO_LISTING', 'SETTING_WEBINAR']
      },
      {
        path: allRoutes.headerCaseStudyCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_CASE_STUDY']
      },
      {
        path: allRoutes.headerNewsCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: ['SETTING_NEWS_EVENTS']
      },
      {
        path: allRoutes.headerMediaGalleryCategory(':categoryType'),
        component: HeaderCategoryEdit,
        exact: true,
        isAllowedTo: MEDIA_GALLERY_SETTING_PERMISSIONS
      },

      {
        path: allRoutes.addPost(':categoryType', ':categorySlug'),
        component: AddEditArticle,
        exact: true,
        allowedCategoryTypes: ARTICLE_CATEGORY_TYPES,
        isAllowedTo: [
          'CREATE_BLOG',
          'CREATE_WEBINAR',
          'CREATE_PODCAST',
          'CREATE_WHITEPAPER',
          'CREATE_RESEARCH_REPORT',
          'CREATE_VIDEO_LISTING',
          'CREATE_CASE_STUDY',
          'CREATE_NEWS_EVENTS'
        ]
      },
      {
        path: allRoutes.editPost(':categoryType', ':id', ':categorySlug'),
        component: AddEditArticle,
        exact: true,
        allowedCategoryTypes: ARTICLE_CATEGORY_TYPES,
        isAllowedTo: [
          'EDIT_BLOG',
          'EDIT_WEBINAR',
          'EDIT_PODCAST',
          'EDIT_WHITEPAPER',
          'EDIT_RESEARCH_REPORT',
          'EDIT_VIDEO_LISTING',
          'EDIT_CASE_STUDY',
          'EDIT_NEWS_EVENTS'
        ]
      },

      { path: allRoutes.blogCategory(':categoryType'), component: Categories, exact: true, isAllowedTo: ['LIST_BLOG_CATEGORY'] },
      { path: allRoutes.webinarCategory(':categoryType'), component: Categories, exact: true, isAllowedTo: ['LIST_WEBINAR_CATEGORY'] },
      { path: allRoutes.podcastCategory(':categoryType'), component: Categories, exact: true, isAllowedTo: ['LIST_PODCAST_CATEGORY'] },
      {
        path: allRoutes.whitePaperCategory(':categoryType'),
        component: Categories,
        exact: true,
        isAllowedTo: ['LIST_WHITEPAPER_CATEGORY']
      },
      {
        path: allRoutes.researchReportCategory(':categoryType'),
        component: Categories,
        exact: true,
        isAllowedTo: ['LIST_RESEARCH_REPORT_CATEGORY', 'LIST_WHITEPAPER_CATEGORY']
      },
      {
        path: allRoutes.videoListingCategory(':categoryType'),
        component: Categories,
        exact: true,
        isAllowedTo: ['LIST_VIDEO_LISTING_CATEGORY', 'LIST_WEBINAR_CATEGORY']
      },
      {
        path: allRoutes.caseStudyCategory(':categoryType'),
        component: Categories,
        exact: true,
        isAllowedTo: ['LIST_CASE_STUDY_CATEGORY']
      },
      {
        path: allRoutes.newsAndEventCategory(':categoryType'),
        component: Categories,
        exact: true,
        isAllowedTo: ['LIST_NEWS_EVENTS_CATEGORY']
      },
      {
        path: allRoutes.mediaGalleryCategory(':categoryType'),
        component: Categories,
        exact: true,
        isAllowedTo: MEDIA_GALLERY_CATEGORY_PERMISSIONS
      },
      {
        path: allRoutes.addCategory(':categoryType', ':categorySlug'),
        component: AddCategory,
        exact: true,
        allowedCategoryTypes: CATEGORY_MANAGEMENT_TYPES,
        isAllowedTo: [
          'ADD_BLOG_CATEGORY',
          'ADD_WEBINAR_CATEGORY',
          'ADD_PODCAST_CATEGORY',
          'ADD_WHITEPAPER_CATEGORY',
          'ADD_RESEARCH_REPORT_CATEGORY',
          'ADD_VIDEO_LISTING_CATEGORY',
          'ADD_CASE_STUDY_CATEGORY',
          'ADD_NEWS_EVENTS_CATEGORY',
          ...MEDIA_GALLERY_CATEGORY_CREATE_PERMISSIONS
        ]
      },
      {
        path: allRoutes.editCategory(':categoryType', ':id', ':categorySlug'),
        component: AddCategory,
        exact: true,
        allowedCategoryTypes: CATEGORY_MANAGEMENT_TYPES,
        isAllowedTo: [
          'EDIT_BLOG_CATEGORY',
          'EDIT_WEBINAR_CATEGORY',
          'EDIT_PODCAST_CATEGORY',
          'EDIT_WHITEPAPER_CATEGORY',
          'EDIT_RESEARCH_REPORT_CATEGORY',
          'EDIT_VIDEO_LISTING_CATEGORY',
          'EDIT_CASE_STUDY_CATEGORY',
          'EDIT_NEWS_EVENTS_CATEGORY',
          ...MEDIA_GALLERY_CATEGORY_EDIT_PERMISSIONS
        ]
      },

      { path: allRoutes.authorsList(':categoryType'), component: ListAuthors, exact: true, isAllowedTo: ['LIST_BLOG_AUTHOR'] },
      { path: allRoutes.authorsCreate(':categoryType'), component: AddEditAuthor, exact: true, isAllowedTo: ['CREATE_BLOG_AUTHOR'] },
      { path: allRoutes.authorsEdit(':categoryType', ':id'), component: AddEditAuthor, exact: true, isAllowedTo: ['EDIT_BLOG_AUTHOR'] },
      { path: allRoutes.services, component: Services, exact: true, isAllowedTo: 'LIST_SERVICE' },
      { path: allRoutes.createService, component: AddEditService, exact: true, isAllowedTo: 'CREATE_SERVICE' },
      { path: allRoutes.servicesEdit(':id'), component: AddEditService, exact: true, isAllowedTo: 'EDIT_SERVICE' },
      { path: allRoutes.industries, component: Industries, exact: true, isAllowedTo: 'LIST_INDUSTRY' },
      { path: allRoutes.createIndustries, component: AddEditIndustries, exact: true, isAllowedTo: 'ADD_INDUSTRY' },
      { path: allRoutes.editIndustries(':id'), component: AddEditIndustries, exact: true, isAllowedTo: 'EDIT_INDUSTRY' },
      { path: allRoutes.products, component: Products, exact: true, isAllowedTo: PRODUCT_LIST_PERMISSIONS },
      { path: allRoutes.createProduct, component: AddEditProduct, exact: true, isAllowedTo: PRODUCT_CREATE_PERMISSIONS },
      { path: allRoutes.editProduct(':id'), component: AddEditProduct, exact: true, isAllowedTo: PRODUCT_EDIT_PERMISSIONS },
      { path: allRoutes.headerCareerCategory(':categoryType'), component: HeaderCategoryEdit, exact: true },
      { path: allRoutes.careers, component: Careers, exact: true },
      { path: allRoutes.addCareer, component: AddEditCareer, exact: true },
      { path: allRoutes.editCareer(':id'), component: AddEditCareer, exact: true },
      { path: allRoutes.careerLocations, component: CareerLocations, exact: true },
      { path: allRoutes.testimonials, component: Testimonial, exact: true, isAllowedTo: 'LIST_TESTIMONIAL' },
      { path: allRoutes.addTestimonial, component: AddEditTestimonial, exact: true, isAllowedTo: 'CREATE_TESTIMONIAL' },
      { path: allRoutes.editTestimonial(':id'), component: AddEditTestimonial, exact: true, isAllowedTo: 'EDIT_TESTIMONIAL' },
      { path: allRoutes.contacts, component: Contacts, exact: true, isAllowedTo: 'LIST_CONTACT' },
      { path: allRoutes.inquiry, component: Feedbacks, exact: true, isAllowedTo: 'LIST_INQUIRY' },
      { path: allRoutes.popupList, component: PopupManagement, exact: true, isAllowedTo: 'LIST_POPUP' },
      { path: allRoutes.popupAdd, component: AddEditPopup, exact: true, isAllowedTo: 'ADD_POPUP' },
      { path: allRoutes.popupEdit(':id'), component: AddEditPopup, exact: true, isAllowedTo: 'EDIT_POPUP' },

      { path: allRoutes.tags, component: Tags, exact: true, isAllowedTo: 'LIST_ACTIVE_TAG' },
      { path: allRoutes.addTag, component: AddTag, exact: true, isAllowedTo: 'CREATE_TAG' },
      { path: allRoutes.editTag(':id'), component: AddTag, exact: true, isAllowedTo: 'EDIT_ACTIVE_TAG' },
      { path: allRoutes.editProfile, component: EditProfile, exact: true },
      { path: allRoutes.seo, component: Seo, exact: true, isAllowedTo: 'LIST_SEO' },
      { path: allRoutes.addSeo, component: AddEditSeo, exact: true, isAllowedTo: 'ADD_SEO' },
      { path: allRoutes.editSeo(':type', ':id'), component: AddEditSeo, exact: true, isAllowedTo: 'EDIT_SEO' },
      { path: allRoutes.seoRedirects, component: SeoRedirects, exact: true, isAllowedTo: 'LIST_SEO_REDIRECT' },
      { path: allRoutes.endUsers, component: EndUsers, exact: true, isAllowedTo: 'LIST_USER' },
      { path: allRoutes.detailEndUser(':id'), component: DetailEndUser, exact: true, isAllowedTo: 'VIEW_USER' },
      { path: allRoutes.cms, component: Cms, exact: true, isAllowedTo: 'LIST_CMS_PAGE' },
      { path: allRoutes.addCms, component: AddEditCms, exact: true, isAllowedTo: 'CREATE_CMS_PAGE' },
      { path: allRoutes.editCms(':id'), component: AddEditCms, exact: true, isAllowedTo: 'EDIT_CMS_PAGE' },
      { path: allRoutes.media, component: MediaPlugin, exact: true, isAllowedTo: 'VIEW_MEDIA_GALLERY' },
      { path: allRoutes.arrangeMenu, component: ArrangeMenu, exact: true, isAllowedTo: 'VIEW_MENU_ARRANGEMENT' },
      { path: allRoutes.pageComponents, component: ComponentsList, exact: true, isAllowedTo: 'LIST_COMPONENT' },
      { path: allRoutes.pageComponentsEdit(':eType'), component: PageComponentEdit, exact: true, isAllowedTo: 'EDIT_COMPONENT' },
      { path: allRoutes.listPage, component: ListPage, exact: true, isAllowedTo: 'LIST_PAGE' },
      { path: allRoutes.createPage, component: CustomPage, exact: true, isAllowedTo: ['CREATE_PAGE', 'EDIT_PAGE'] },
      { path: allRoutes.editPage(':id', ':title'), component: EditPage, exact: true, isAllowedTo: 'EDIT_PAGE' },
      { path: allRoutes.marquee, component: Marquee, exact: true },
      { path: allRoutes.chatBot, component: ChatBotInput, exact: true, isAllowedTo: 'EDIT_CHATBOT_INPUT' },
      { path: allRoutes.chatBotResponse, component: chatBotResponse, exact: true, isAllowedTo: 'GET_CHATBOT_RESPONSE' },
      { path: allRoutes.projectConfig, component: ProjectConfig, exact: true },
      { path: allRoutes.socialDashboard, component: SocialDashboard, exact: true }
    ]
  }
]

export default Router
