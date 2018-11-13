<?php

namespace VisualComposer\Modules\Hub\Addons;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Request;
use VisualComposer\Helpers\Token;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Modules\Hub\Elements\ElementDownloadController;

class AddonDownloadController extends ElementDownloadController implements Module
{
    use EventsFilters;

    public function __construct()
    {
        $this->addFilter('vcv:ajax:hub:download:addon:adminNonce', 'ajaxDownloadAddon');
    }

    protected function ajaxDownloadAddon($response, $payload, Request $requestHelper, Token $tokenHelper)
    {
        if (empty($response)) {
            $response = [
                'status' => true,
            ];
        }
        if (!vcIsBadResponse($response)) {
            $bundle = $requestHelper->input('vcv-bundle');
            $token = $tokenHelper->createToken();
            if (!$token) {
                return false;
            }

            $json = $this->sendRequestJson($bundle, $token);
            if (!vcIsBadResponse($json)) {
                // fire the download process
                if (isset($json['actions'])) {
                    foreach ($json['actions'] as $action) {
                        $requestHelper->setData(
                            [
                                'vcv-hub-action' => $action,
                            ]
                        );
                        $response = vcfilter('vcv:ajax:hub:action:adminNonce', $response);
                    }
                }
                $response = $this->initializeElementsAndAddons($response);
                $response = vcfilter('vcv:hub:addonDownloadController:download:response', $response);
            } else {
                return $json;
            }
        }

        return $response;
    }

    protected function sendRequestJson($bundle, $token)
    {
        $hubBundleHelper = vchelper('HubBundle');
        $url = $hubBundleHelper->getAddonDownloadUrl(['token' => $token, 'bundle' => $bundle]);
        $response = wp_remote_get(
            $url,
            [
                'timeout' => 30,
            ]
        );
        $response = $this->checkResponse($response);

        return $response;
    }

    /**
     * @param $response
     *
     * @return array|\WP_Error
     */
    protected function checkResponse($response)
    {
        $loggerHelper = vchelper('Logger');
        $optionsHelper = vchelper('Options');
        $downloadHelper = vchelper('HubDownload');
        if (!vcIsBadResponse($response)) {
            $actions = json_decode($response['body'], true);
            if (isset($actions['actions'])) {
                $response['status'] = true;
                foreach ($actions['actions'] as $action) {
                    if (!empty($action)) {
                        $optionNameKey = $action['action'] . $action['version'];
                        // Saving in database the downloading information
                        $optionsHelper->set('hubA:d:' . md5($optionNameKey), $action);
                        $actionData = [
                            'action' => $action['action'],
                            'key' => $optionNameKey,
                            'name' => isset($action['name']) && !empty($action['name']) ? $action['name']
                                : $downloadHelper->getActionName($action['name']),
                        ];
                        if (!isset($response['actions']) || !is_array($response['actions'])) {
                            $response['actions'] = [];
                        }
                        $response['actions'][] = $actionData;
                    }
                }
            }
        }

        return $response;
    }

    /**
     * @param $response
     *
     * @return mixed
     */
    protected function initializeElementsAndAddons($response)
    {
        if (isset($response['variables'])) {
            $response['variables'] = [];
        }
        if (isset($response['addons'])) {
            foreach ($response['addons'] as $addon) {
                vcevent('vcv:hub:addons:autoload', ['addon' => $addon]);
                $response['variables'] = vcfilter(
                    'vcv:editor:variables/' . $addon['tag'],
                    $response['variables']
                );
            }
        }
        if (isset($response['elements'])) {
            foreach ($response['elements'] as $element) {
                // Try to initialize PHP in element via autoloader
                vcevent('vcv:hub:elements:autoload', ['element' => $element]);
                $response['variables'] = vcfilter(
                    'vcv:editor:variables/' . $element['tag'],
                    $response['variables']
                );
            }
        }

        return $response;
    }
}
