<?php

namespace VisualComposer\Modules\Assets;

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Options;
use VisualComposer\Helpers\Str;
use VisualComposer\Helpers\Traits\WpFiltersActions;

class EnqueueController extends Container implements Module
{
    use WpFiltersActions;

    public function __construct()
    {

        $this->wpAddAction('wp_enqueue_scripts', 'enqueueGlobalAssets');

        /** @see \VisualComposer\Modules\Assets\EnqueueController::enqueueAssets */
        $this->wpAddAction('wp_enqueue_scripts', 'enqueueAssets');

        $this->wpAddAction('wp_enqueue_scripts', 'enqueueSourceAssets');
    }

    /**
     * @param \VisualComposer\Helpers\Options $optionsHelper
     * @param \VisualComposer\Helpers\Str $strHelper
     */
    protected function enqueueGlobalAssets(Options $optionsHelper, Str $strHelper)
    {
        $bundleUrl = $optionsHelper->get('globalElementsCssFileUrl');
        if ($bundleUrl) {
            wp_enqueue_style('vcv:assets:global:styles:' . $strHelper->slugify($bundleUrl), $bundleUrl);
        }
    }

    /**
     * @param \VisualComposer\Helpers\Str $strHelper
     */
    protected function enqueueSourceAssets(Str $strHelper)
    {
        $sourceId = get_the_ID();
        $bundleUrl = get_post_meta($sourceId, 'vcvSourceCssFileUrl', true);
        if ($bundleUrl) {
            wp_enqueue_style('vcv:assets:source:main:styles:' . $strHelper->slugify($bundleUrl), $bundleUrl);
        }
    }

    /**
     * @param \VisualComposer\Helpers\Str $strHelper
     */
    protected function enqueueAssets(Str $strHelper)
    {
        $sourceId = get_the_ID();
        $assetsFiles = get_post_meta($sourceId, 'vcvSourceAssetsFiles', true);

        if (!is_array($assetsFiles)) {
            return;
        }

        if (isset($assetsFiles['cssBundles']) && is_array($assetsFiles['cssBundles'])) {
            foreach ($assetsFiles['cssBundles'] as $asset) {
                wp_enqueue_style('vcv:assets:source:styles:' . $strHelper->slugify($asset), $asset);
            }
            unset($asset);
        }

        if (isset($assetsFiles['jsBundles']) && is_array($assetsFiles['jsBundles'])) {
            foreach ($assetsFiles['jsBundles'] as $asset) {
                wp_enqueue_script('vcv:assets:source:scripts:' . $strHelper->slugify($asset), $asset);
            }
            unset($asset);
        }
    }
}