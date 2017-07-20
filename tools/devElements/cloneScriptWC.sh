#!/bin/bash

echo "My script is running."

declare -a arr=(
'row'
'column'
'textBlock'
'singleImage'
'basicButton'
'featureSection'
'flickrImage'
'googleFontsHeading'
'googleMaps'
'googlePlusButton'
'heroSection'
'icon'
'imageGallery'
'imageMasonryGallery'
'instagramImage'
'outlineButton'
'pinterestPinit'
'rawHtml'
'facebookLike'
'feature'
'rawJs'
'separator'
'shortcode'
'twitterButton'
'twitterGrid'
'twitterTimeline'
'twitterTweet'
'vimeoPlayer'
'wpWidgetsCustom'
'wpWidgetsDefault'
'youtubePlayer'
'faqToggle'
'postsGridItemPostDescription'
'postsGridDataSourcePost'
'postsGridDataSourcePage'
'postsGridDataSourceCustomPostType'
'postsGrid'
'woocommerceTopRatedProducts'
'woocommerceSaleProducts'
'woocommerceRelatedProducts'
'woocommerceRecentProducts'
'woocommerceProducts'
'woocommerceProductPage'
'woocommerceProductCategory'
'woocommerceProductCategories'
'woocommerceProductAttribute'
'woocommerceProduct'
'woocommerceOrderTracking'
'woocommerceMyAccount'
'woocommerceFeaturedProducts'
'woocommerceCheckout'
'woocommerceCart'
'woocommerceBestSellingProducts'
'woocommerceAddToCart'
)

EXECDIR=`pwd`

for i in "${arr[@]}"
do
   if cd $EXECDIR/devElements/$i; then cd $EXECDIR/devElements/$i && git pull; else git clone git@gitlab.com:visualcomposer-hub/$i.git $EXECDIR/devElements/$i; fi
done

echo "Done!"