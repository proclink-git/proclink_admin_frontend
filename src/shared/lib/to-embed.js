/* eslint-disable no-useless-escape */
import { GET_SERVER_URL } from 'graph-ql/common/query'
import { graphQlToRest } from 'shared/utils'

export const convertUrlToEmbed = async (url) => {
  const youtubeURL = 'https://www.youtube.com/embed/'
  const vimeoURL = 'https://player.vimeo.com/video/'
  const twitterURL = 'https://publish.twitter.com/oembed?url='
  const instagramURL = 'https://i.instagram.com/api/v1/oembed/?url='
  let embedUrl = {}
  if (!url) {
    return
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    url = url.trim()
    const youtubeRegEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const youtubeURLMatch = url.match(youtubeRegEx)

    if (youtubeURLMatch && youtubeURLMatch[2].length === 11) {
      embedUrl = youtubeURL + youtubeURLMatch[2]
      return `<iframe class="youtube-ifm mceNonEditable" src="${embedUrl}" loading="lazy" />`
    } else {
      return url
    }
  } else if (url.includes('vimeo.com')) {
    url = url.trim()
    const vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i
    const vimeoURLMatch = url.match(vimeoRegex)

    if (vimeoURLMatch && vimeoURLMatch[1]) {
      embedUrl = vimeoURL + vimeoURLMatch[1]
      return `<iframe class="vimeo-ifm" src="${embedUrl}" loading="lazy" />`
    } else {
      return url
    }
  } else if (url.includes('twitter.com')) {
    url = url.trim()?.split('?')[0]
    const twitterRegex = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/
    const twitterURLMatch = url.match(twitterRegex)
    if (twitterURLMatch) {
      const { html } = await graphQlToRest(GET_SERVER_URL, { sUrl: twitterURL + url }, 'getFrontUrlData')
      return `<div class="ct-twitter mceNonEditable" data-post-url="${url}" data-post-id="${twitterURLMatch[3]}">${html}</div>` || ''
    } else {
      return url
    }
  } else if (url.includes('instagram.com')) {
    url = url.trim()?.split('?')[0]
    const instaRegex = /\/(?:p|reel|tv)\/([^\s\/?]+)/
    // const instaRegex = /((?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)).*/g
    const instaURLMatch = url.match(instaRegex)
    if (instaURLMatch) {
      const { html } = await graphQlToRest(GET_SERVER_URL, { sUrl: instagramURL + url }, 'getFrontUrlData')
      return `<div class="ct-insta mceNonEditable" data-post-url="${url}" data-post-id="${instaURLMatch[1]}">${html}</div>` || ''
    } else {
      return url
    }
  } else {
    return url
  }
}

// console.log('in')
// const response = await fetch(API_URL, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     query: `query GetFrontUrlData($input: getFrontUrlDataInput) {
//       getFrontUrlData(input: $input) {
//         oData
//         sMessage
//       }
//     }`,
//     variables: { input: { sUrl: 'https://publish.twitter.com/oembed?url=https://twitter.com/gujarat_titans/status/1495364665425412101' } }
//   })
// })
// const { data } = await response.json()
// console.log(data)

// Old
// const id = Date.now()
// https://platform.twitter.com/embed/Tweet.html?id=1498969055708942336
// return `
//     <div class="twitter_frame">
//       <iframe style="margin-top: -18px;" class="${id}" width="100%" id="${id}" src="https://twitframe.com/show?url=${url}"></iframe>
//     </div>
//     <script type="text/javascript">
//     const tweet_${id} = document.getElementById("${id}");
//     tweet_${id}.onload = function(e) {
//       tweet_${id}?.contentWindow?.postMessage({ element: tweet_${id}.id, query: "height" }, "https://twitframe.com")
//     }
//     window.addEventListener("message", (e) => {
//       if (e?.data?.element === tweet_${id}?.id) {
//         tweet_${id}.style.height = e.data.height + "px";
//       }
//     }, false);
//     </script>
//   `
