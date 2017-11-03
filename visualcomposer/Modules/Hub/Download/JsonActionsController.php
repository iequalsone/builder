<?php

namespace VisualComposer\Modules\Hub\Download;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Logger;
use VisualComposer\Helpers\Options;
use VisualComposer\Helpers\Request;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Helpers\Url;

class JsonActionsController extends Container implements Module
{
    use EventsFilters;

    public function __construct()
    {
        $this->addFilter('vcv:hub:download:json', 'ajaxGetRequiredActions');
        $this->addFilter('vcv:ajax:hub:action:adminNonce', 'ajaxProcessAction');
        $this->addEvent('vcv:system:factory:reset', 'unsetOptions');
    }

    protected function ajaxGetRequiredActions(
        $response,
        $payload,
        Logger $loggerHelper,
        Url $urlHelper
    ) {
        if (!vcIsBadResponse($response)) {
            if ($payload['json'] && !empty($payload['json']['actions'])) {
                $hubBundle = vchelper('HubBundle');
                $hubUpdateHelper = vchelper('HubUpdate');
                list($needUpdatePost, $requiredActions) = $hubBundle->loopActions($payload['json']);
                $reRenderPosts = array_unique($needUpdatePost);
                $response['actions'] = $requiredActions;
                if (count($reRenderPosts) > 0 && vcvenv('VCV_TF_POSTS_RERENDER', false)) {
                    $postsActions = $hubUpdateHelper->createPostUpdateObjects($reRenderPosts);
                    $response['actions'] = array_merge($response['actions'], $postsActions);
                }
            } else {
                $loggerHelper->log(
                    __('Failed to process required actions', 'vcwb'),
                    [
                        'payload' => $payload,
                        'response' => $response,
                    ]
                );
            }
        }

        return $response;
    }

    protected function ajaxProcessAction(
        $response,
        $payload,
        Request $requestHelper,
        Options $optionsHelper,
        Logger $loggerHelper
    ) {
        $response = [
            'status' => true,
        ];
        $optionsHelper->setTransient('vcv:activation:request', $requestHelper->input('vcv-time'), 60);
        $action = $requestHelper->input('vcv-hub-action');
        if (!isset($action['key']) && isset($action['data'])) {
            $savedAction = $action;
        } else {
            $savedAction = $optionsHelper->get('hubAction:download:' . $action['key'], false);
        }
        if (!$savedAction) {
            $loggerHelper->log('the update action does not exists');

            return ['status' => false];
        }

        $previousVersion = $optionsHelper->get('hubAction:' . $savedAction['action'], '0');
        if (isset($savedAction['version']) && version_compare($savedAction['version'], $previousVersion, '>')
            || !isset($savedAction['action'])
            || !$savedAction['version']) {
            $response = $this->processAction(
                $savedAction['action'],
                $savedAction['data'],
                $savedAction['version'],
                isset($savedAction['checksum']) ? $savedAction['checksum'] : '',
                $savedAction['name']
            );
        }

        return $response;
    }

    protected function processAction(
        $action,
        $data,
        $version,
        $checksum,
        $name
    ) {
        $response = [
            'status' => true,
        ];
        $optionsHelper = vchelper('Options');
        $actionResult = $this->triggerAction($action, $data, $version, $checksum);
        if (is_array($actionResult) && $actionResult['status']) {
            $optionsHelper->set('hubAction:' . $action, $version);
        } else {
            $loggerHelper = vchelper('Logger');
            $loggerHelper->log(
                sprintf(__('Failed to download %1$s', 'vcwb'), $name),
                [
                    'version' => $version,
                    'action' => $action,
                    'data' => $data,
                    'checksum' => $checksum,
                ]
            );

            return false;
        }

        return $response;
    }

    protected function triggerAction($action, $data, $version, $checksum)
    {
        $response = vcfilter(
            'vcv:hub:process:action:' . $action,
            ['status' => true],
            [
                'action' => $action,
                'data' => $data,
                'version' => $version,
                'checksum' => $checksum,
            ]
        );

        return $response;
    }

    protected function unsetOptions(Options $optionsHelper)
    {
        $optionsHelper
            ->deleteTransient('vcv:activation:request');
        global $wpdb;
        $wpdb->query(
            $wpdb->prepare(
                'DELETE FROM ' . $wpdb->options . ' WHERE option_name LIKE "%s"',
                VCV_PREFIX . 'hubAction:%'
            )
        );
    }
}
