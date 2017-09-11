<?php

namespace VisualComposer\Modules\Account;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Access\CurrentUser;
use VisualComposer\Helpers\License;
use VisualComposer\Helpers\Logger;
use VisualComposer\Helpers\Options;
use VisualComposer\Helpers\Request;
use VisualComposer\Helpers\Token;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Modules\Account\Pages\ActivationPage;
use VisualComposer\Modules\Settings\Traits\Page;

/**
 * Class LicenseController
 * @package VisualComposer\Modules\Account
 */
class LicenseController extends Container /*implements Module*/
{
    use Page;
    use EventsFilters;

    /**
     * @var string
     */
    protected $slug = 'vcv-update-to-premium';

    /**
     * LicenseController constructor.
     */
    public function __construct()
    {
        $this->addEvent('vcv:inited', 'redirectToAccount');
        $this->addEvent('vcv:admin:inited', 'getLicenseKey');
        // TODO: vcv:system:deactivation:hook
        $this->addEvent('vcv:system:factory:reset', 'unsetOptions');
    }

    /**
     * Redirect to account to select license
     *
     * @param \VisualComposer\Helpers\Request $requestHelper
     * @param \VisualComposer\Helpers\Access\CurrentUser $currentUserHelper
     * @param \VisualComposer\Helpers\License $licenseHelper
     * @param \VisualComposer\Modules\Account\Pages\ActivationPage $activationPageModule
     */
    protected function redirectToAccount(
        Request $requestHelper,
        CurrentUser $currentUserHelper,
        License $licenseHelper,
        ActivationPage $activationPageModule
    ) {
        if (!$currentUserHelper->wpAll('manage_options')->get()) {
            return;
        } elseif ($requestHelper->input('page') === $this->getSlug()) {
            wp_redirect(
                VCV_ACTIVATE_LICENSE_URL .
                '/?redirect=' . admin_url('admin.php?page=' . rawurlencode($activationPageModule->getSlug())) .
                '&token=' . rawurlencode($licenseHelper->newKeyToken()) .
                '&url=' . VCV_PLUGIN_URL
            );
            exit;
        }
    }

    /**
     * Receive licence key and store it in DB
     *
     * @param \VisualComposer\Helpers\Request $requestHelper
     * @param \VisualComposer\Helpers\Access\CurrentUser $currentUserHelper
     * @param \VisualComposer\Helpers\License $licenseHelper
     * @param \VisualComposer\Helpers\Token $tokenHelper
     * @param \VisualComposer\Helpers\Logger $loggerHelper
     * @param \VisualComposer\Helpers\Options $optionsHelper
     *
     * @return bool|void
     */
    protected function getLicenseKey(
        Request $requestHelper,
        CurrentUser $currentUserHelper,
        License $licenseHelper,
        Token $tokenHelper,
        Logger $loggerHelper,
        Options $optionsHelper
    ) {
        if (!$currentUserHelper->wpAll('manage_options')->get()) {
            return;
        } elseif ($requestHelper->input('activate')) {
            $token = $requestHelper->input('activate');

            if ($licenseHelper->isValidToken($token)) {
                $result = wp_remote_get(
                    VCV_ACTIVATE_LICENSE_FINISH_URL,
                    [
                        'timeout' => 10,
                        'body' => [
                            'token' => $licenseHelper->getKeyToken(),
                        ],
                    ]
                );

                if (!vcIsBadResponse($result)) {
                    $optionsHelper->deleteTransient('vcv_finish_activation_failed');
                    $result = json_decode($result['body'], true);
                    $licenseHelper->setKey($result['license_key']);
                    $tokenHelper->setIsSiteRegistered();

                    return true;
                } else {
                    $loggerHelper->log(
                        __('Failed to finish licence activation', 'vcwb'),
                        [
                            'response' => is_wp_error($result) ? $result->get_error_message()
                                : (is_array($result) ? $result['body'] : ''),
                        ]
                    );
                    $optionsHelper->setTransient('vcv_finish_activation_failed', 1, 60);
                }
            } else {
                $loggerHelper->log(
                    __('Invalid token', 'vcwb'),
                    [
                        'token' => $token,
                    ]
                );
                $optionsHelper->setTransient('vcv_finish_activation_failed', 1, 60);
            }
        }

        return false;
    }

    protected function unsetOptions(Options $optionsHelper)
    {
        $optionsHelper
            ->deleteTransient('vcv_finish_activation_failed')
            ->delete('license-key-token')
            ->delete('siteRegistered')
            ->delete('license-key');
    }
}