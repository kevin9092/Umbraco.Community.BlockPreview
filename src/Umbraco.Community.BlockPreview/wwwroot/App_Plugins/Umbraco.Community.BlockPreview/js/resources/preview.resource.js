(function () {
    'use strict';

    function previewResource($http, umbRequestHelper) {

        var apiUrl = Umbraco.Sys.ServerVariables.UmbracoCommunityBlockPreview.PreviewApi;

        var resource = {
            getPreview: getPreview,
        };

        return resource;

        function getPreview(blockData, documentTypeKey, blockEditorAlias, contentUdi, settingsUdi, isGrid, isList, isRte, culture) {
            culture = culture || '';
            isGrid = isGrid || false;
            isList = isList || false;
            isRte = isRte || false

            return umbRequestHelper.resourcePromise(
                $http.post(`${apiUrl}?documentTypeKey=${documentTypeKey}&blockEditorAlias=${blockEditorAlias}&contentUdi=${contentUdi}&settingsUdi=${settingsUdi}&isGrid=${isGrid}&isRte=${isRte}&isRte=${isList}&culture=${culture}`, blockData),
                'Failed getting block preview markup'
            );
        };
    }

    angular.module('umbraco.resources').factory('Umbraco.Community.BlockPreview.Resources.PreviewResource', previewResource);

})();
