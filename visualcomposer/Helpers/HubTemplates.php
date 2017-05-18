<?php

namespace VisualComposer\Helpers;

use VisualComposer\Framework\Illuminate\Support\Helper;

class HubTemplates implements Helper
{
    public function requestBundleDownload($requestedData = [])
    {
        $urlHelper = vchelper('Url');
        $fileHelper = vchelper('File');
        $downloadUrl = $urlHelper->query(sprintf('%s/download/templates-bundle/lite', VCV_ACCOUNT_URL), $requestedData);
        $downloadedArchive = $fileHelper->download($downloadUrl);

        return $downloadedArchive;
    }

    public function unzipDownloadedBundle($bundle)
    {
        $fileHelper = vchelper('File');
        $result = $fileHelper->unzip($bundle, $this->getBundleFolder(), true);

        return $result;
    }

    public function getBundleFolder($path = '')
    {
        $bundleFolder = WP_CONTENT_DIR . '/' . VCV_PLUGIN_ASSETS_DIRNAME . '/templates-temp-bundle';
        if ($path) {
            $bundleFolder .= '/' . ltrim($path, '\//');
        }

        return $bundleFolder;
    }

    public function readBundleJson($bundleJsonPath)
    {
        $fileHelper = vchelper('File');
        $content = $fileHelper->getContents($bundleJsonPath);

        return json_decode($content, true);
    }

    public function removeBundleFolder()
    {
        $folder = $this->getBundleFolder();
        $fileHelper = vchelper('File');

        return $fileHelper->removeDirectory($folder);
    }
}