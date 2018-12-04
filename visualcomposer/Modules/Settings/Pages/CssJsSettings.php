<?php

namespace VisualComposer\Modules\Settings\Pages;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Options;
use VisualComposer\Helpers\Status;
use VisualComposer\Helpers\Traits\WpFiltersActions;
use VisualComposer\Modules\Settings\Traits\Page;
use VisualComposer\Modules\Settings\Traits\SubMenu;
use VisualComposer\Helpers\Traits\EventsFilters;

class CssJsSettings extends Container implements Module
{
    use Page;
    use SubMenu;
    use WpFiltersActions;
    use EventsFilters;

    /**
     * @var string
     */
    protected $slug = 'vcv-global-css-js';

    /*
     * @var string
     */
    protected $templatePath = 'settings/pages/index';

    public function __construct(Status $statusHelper, Options $optionsHelper)
    {
        if (!vcvenv('VCV_ENV_FT_GLOBAL_CSS_JS_SETTINGS')) {
            return;
        }

        $this->wpAddAction(
            'admin_menu',
            'addPage'
        );

        $this->wpAddFilter('submenu_file', 'subMenuHighlight');
    }

    protected function subMenuHighlight($submenuFile)
    {
        $screen = get_current_screen();
        if (strpos($screen->id, $this->slug)) {
            $submenuFile = 'vcv-settings';
        }

        return $submenuFile;
    }

    /*protected function getRenderArgs()
    {
        return [
            'refreshUrl' => $this->getRefreshUrl(),
            'phpVersion' => $this->getPhpVersionStatusForView(),
            'wpVersion' => $this->getWpVersionStatusForView(),
            'vcVersion' => $this->statusHelper->getVcvVersion(),
            'wpDebug' => $this->getWpDebugStatusForView(),
            'memoryLimit' => $this->getMemoryLimitStatusForView(),
            'timeout' => $this->getTimeoutStatusForView(),
            'fileUploadSize' => $this->getUploadMaxFileSizeStatusForView(),
            'uploadDirAccess' => $this->getUploadDirAccessStatusForView(),
            'fsMethod' => $this->getFileSystemStatusForView(),
            'zipExt' => $this->getZipStatusForView(),
            'curlExt' => $this->getCurlStatusForView(),
            'account' => $this->getAccountConnectionStatusForView(),
            'aws' => $this->getAwsConnectionStatusForView(),
        ];
    }*/

    /**
     *
     */
    protected function beforeRender()
    {
        $urlHelper = vchelper('Url');
        wp_register_style(
            'vcv:wpUpdateRedesign:style',
            $urlHelper->assetUrl('dist/wpUpdateRedesign.bundle.css'),
            [],
            VCV_VERSION
        );
        wp_enqueue_style('vcv:wpUpdateRedesign:style');

        wp_register_script(
            'vcv:wpVcSettings:script',
            $urlHelper->assetUrl('dist/wpVcSettings.bundle.js'),
            [],
            VCV_VERSION
        );
        wp_enqueue_script('vcv:wpVcSettings:script');
    }

    /**
     * @throws \Exception
     */
    protected function addPage()
    {
        $page = [
            'slug' => $this->getSlug(),
            'title' => __('CSS and JavaScript', 'vcwb'),
            'layout' => 'settings-standalone-with-tabs',
            'showTab' => false,
            'hidePage' => true,
            'controller' => $this,
        ];
        $this->addSubmenuPage($page);
    }
}
