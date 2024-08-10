angular.module('umbraco').controller('Umbraco.Community.BlockPreview.Controllers.BlockPreviewController',
    ['$scope', '$sce', '$timeout', 'editorState', 'Umbraco.Community.BlockPreview.Resources.PreviewResource',
        function ($scope, $sce, $timeout, editorState, previewResource) {
            var current = editorState.getCurrent()
            var active = current.variants.find(function (v) {
                return v.active;
            });

            if (active !== null) {
                if (active.language !== null) {
                    $scope.language = active.language.culture;
                }
            }

            $scope.cacheBuster = Umbraco.Sys.ServerVariables.application.cacheBuster;

            debugger;
            $scope.documentTypeKey = current.documentType.key;
            $scope.loading = true;
            $scope.markup = $sce.trustAsHtml('<div class="preview-alert preview-alert-info">Loading preview</div>');

            // There must be a better way to do this...
            $scope.blockEditorAlias = '';
            var parent = $scope.$parent;

            $scope.isGrid = false;
            $scope.isList = false;
            $scope.isRte = false;
            
            $scope.contentUdi = $scope.block.content.udi;
            $scope.settingsUdi = $scope.block.settingsData?.udi || '';

            while (parent.$parent) {
                if (parent.vm) {
                    if (parent.vm.constructor.name == 'BlockGridController') {
                        $scope.blockEditorAlias = parent.vm.model.alias;
                        $scope.modelValue = parent.vm.model.value;
                        $scope.isGrid = true;
                        break;
                    }

                    if (parent.vm.constructor.name == 'BlockListController') {
                        $scope.blockEditorAlias = parent.vm.model.alias;
                        $scope.modelValue = parent.vm.model.value;
                        $scope.isList = true;
                        break;
                    }
                }

                if (parent.model) {
                    if (parent.model.constructor.name == 'umbRteBlockController') {
                        $scope.isRte = true;
                        break;
                    }
                }

                parent = parent.$parent;
            }

            function loadPreview(content, settings) {
                $scope.markup = $sce.trustAsHtml('<div class="preview-alert preview-alert-info">Loading preview</div>');
                $scope.loading = true;
                
                previewResource.getPreview($scope.modelValue, $scope.documentTypeKey, $scope.blockEditorAlias, $scope.contentUdi, $scope.settingsUdi, $scope.isGrid, $scope.isList, $scope.isRte, $scope.language).then(function (data) {
                    $scope.markup = $sce.trustAsHtml(data);
                    $scope.loading = false;
                });
            }
            
            loadPreview($scope.block.data, $scope.block.settingsData);

            var timeoutPromise;

            $scope.$watch('block.data', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {   //Set timeout
                        loadPreview(newValue, null);
                    }, 500);
                }
            }, true);

            $scope.$watch('block.settingsData', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $timeout.cancel(timeoutPromise);

                    timeoutPromise = $timeout(function () {   //Set timeout
                        loadPreview(null, newValue);
                    }, 500);
                }
            }, true);

            $scope.editBlock = function ($event, block) {
                var target = $event.target;
                var blockActions = target.closest('.umb-block-grid__block--actions');
                var areaCreate = target.closest('.umb-block-grid__create-button');
                var blockCreateButton = target.closest('.umb-block-grid__block--inline-create-button');
                var blockCreateButtonLast = target.closest('.umb-block-grid__block--last-inline-create-button');
                var blockScaling = target.closest('.umb-block-grid__scale-handler') || target.closest('.--scale-mode');

                if (!blockActions && !areaCreate && !blockCreateButton && !blockCreateButtonLast && !blockScaling) {
                    block.edit();
                    $event.preventDefault();
                    $event.stopPropagation();
                    $event.stopImmediatePropagation();
                    $event.cancelBubble = true;
                    return;
                }
            }
        }
    ]);
