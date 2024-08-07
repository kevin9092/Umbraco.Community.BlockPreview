(function () {
    'use strict';

    function previewResource($http, umbRequestHelper) {

        var apiUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewApi;

        var resource = {
            getPreview: getPreview,
        };

        return resource;

        function getPreview(data, pageId, blockEditorAlias, isGrid, isRte, culture) {
            culture = culture || '';
            isGrid = isGrid || false;
            isRte = isRte || false

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiUrl}?pageId=${pageId}&blockEditorAlias=${blockEditorAlias}&isGrid=${isGrid}&isRte=${isRte}&culture=${culture}`, data),
                'Failed getting block preview markup'
            );
        };
    }

    angular.module('umbraco.resources').factory('Umbraco.Community.BlockPreview.Resources.PreviewResource', previewResource);

})();
