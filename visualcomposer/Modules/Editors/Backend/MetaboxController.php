<?php

namespace VisualComposer\Modules\Editors\Backend;

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Helpers\Traits\WpFiltersActions;
use VisualComposer\Helpers\Request;
use VisualComposer\Helpers\Url;

class MetaboxController extends Container implements Module
{
    use WpFiltersActions;

    /**
     * @var \VisualComposer\Helpers\Request
     */
    protected $request;

    /**
     * @var \VisualComposer\Helpers\Url
     */
    protected $url;

    public function __construct(Request $request, Url $url)
    {
        $this->request = $request;
        $this->url = $url;

        /** @see \VisualComposer\Modules\Editors\Backend\MetaboxController::initializeMetabox */
        $this->wpAddAction('admin_init', 'initializeMetabox');
    }

    public function render()
    {
        $this->url->redirectIfUnauthorized();
        $sourceId = (int)$this->request->input('post');
        vchelper('PostType')->setupPost($sourceId);
        $frontendHelper = vchelper('Frontend');
        echo vcview(
            'editor/backend/content.php',
            [
                'editableLink' => $frontendHelper->getEditableUrl($sourceId),
                'frontendEditorLink' => $frontendHelper->getFrontendUrl($sourceId),
            ]
        );
    }

    protected function initializeMetabox()
    {
        $toggleFeatureBackend = true;
        if ($toggleFeatureBackend && vcfilter('vcv:editors:backend:addMetabox', true)) {
            /** @see \VisualComposer\Modules\Editors\Backend\MetaboxController::addMetaBox */
            $this->wpAddAction('add_meta_boxes', 'addMetaBox');
        }
    }

    protected function addMetaBox($postType)
    {
        // TODO:
        // 0. Check part enabled post type and etc
        // 1. Check access
        // 2.
        // meta box to render
        add_meta_box(
            'vcwb_visual_composer',
            __('Visual Composer', 'vc5'),
            [
                $this,
                'render',
            ],
            $postType,
            'normal',
            'high'
        );
    }
}
