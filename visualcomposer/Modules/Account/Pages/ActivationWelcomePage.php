<?php

namespace VisualComposer\Modules\Account\Pages;

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Modules\Settings\Traits\Page;

class ActivationWelcomePage extends Container implements Module
{
    use Page;
    use EventsFilters;

    /**
     * @var string
     */
    protected $slug = 'vcv-activation';

    /**
     * @var string
     */
    protected $templatePath = 'account/pages/activation-1';

    public function __construct()
    {
        /** @see \VisualComposer\Modules\Account\Pages\ActivationWelcomePage::addPage */
        $this->addFilter(
            'vcv:settings:getPages',
            'addPage',
            40
        );
    }

    protected function beforeRender()
    {
        wp_enqueue_script('vcv:settings:script');
        wp_enqueue_style('vcv:settings:style');
    }

    /**
     * @param array $pages
     *
     * @return array
     */
    private function addPage($pages)
    {
        $pages[] = [
            'slug' => $this->getSlug(),
            'title' => __('Activation', 'vc5'),
            'controller' => $this,
        ];

        return $pages;
    }
}
