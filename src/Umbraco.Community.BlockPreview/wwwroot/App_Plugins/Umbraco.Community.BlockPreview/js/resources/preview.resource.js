(function () {
    'use strict';

    function previewResource($http, umbRequestHelper) {

        var apiGridUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewGridApi;
        var apiListUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewListApi;
        var apiRichTextUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewRichTextApi;

        var resource = {
            getGridPreview: getGridPreview,
            getListPreview: getListPreview,
            getRichTextPreview: getRichTextPreview,
        };

        return resource;

        function getGridPreview(blockData, blockEditorAlias, contentElementAlias, culture, documentTypeKey, contentUdi, settingsUdi) {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiGridUrl}?blockEditorAlias=${blockEditorAlias}&contentElementAlias=${contentElementAlias}&documentTypeKey=${documentTypeKey}&contentUdi=${contentUdi}&settingsUdi=${settingsUdi}&culture=${culture}`, blockData),
                'Failed getting block preview markup'
            );
        };

        function getListPreview(blockData, blockEditorAlias, contentElementAlias, culture) {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiListUrl}?blockEditorAlias=${blockEditorAlias}&contentElementAlias=${contentElementAlias}&culture=${culture}`, blockData),
                'Failed getting block preview markup'
            );
        };

        function getRichTextPreview(blockData, blockEditorAlias, contentElementAlias, culture) {
            culture = culture || '';

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiRichTextUrl}?blockEditorAlias=${blockEditorAlias}&contentElementAlias=${contentElementAlias}&culture=${culture}`, blockData),
                'Failed getting block preview markup'
            );
        };
    }

    angular.module('umbraco.resources').factory('Umbraco.Community.BlockPreview.Resources.PreviewResource', previewResource);

})();
