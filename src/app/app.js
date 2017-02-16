angular.module('PEPFAR.datastore', [
     'ngAnimate',
     'ngMessages',
     'restangular',
     'dhis2.notify',
     'ui.select',
     'ui.bootstrap.collapse',
     'ui.bootstrap.pagination',
     'ui.bootstrap.tpls',
     'ui.bootstrap',
     'ui.bootstrap.modal',
     'ui.router'
]);

function routerConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/list');

    $stateProvider
        .state('list', {
            url: '/list',
            templateUrl: 'views/list.html',
            controller: 'ListController as $listCtrl'
        })
        .state('edit', {
            url: '/edit/{namespace}/{key}',
            templateUrl: 'views/edit.html',
            controller: 'EditController as $editCtrl',
            resolve: {
                dataStoreEntry: function ($stateParams, dataStore) {
                    return dataStore.getValueForKeyInNamespace($stateParams.namespace, $stateParams.key)
                        .then(function (value) {
                            return {
                                namespace: $stateParams.namespace,
                                key: $stateParams.key,
                                value: value
                            };
                        });
                }
            }
        })
        .state('delete', {
            url: '/delete/{namespace}/{key}',
            templateUrl: 'views/delete.html',
            controller: 'DeleteController as $deleteCtrl',
            resolve: {
                dataStoreEntry: function ($stateParams, dataStore) {
                    return dataStore.getValueForKeyInNamespace($stateParams.namespace, $stateParams.key)
                        .then(function (value) {
                            return {
                                namespace: $stateParams.namespace,
                                key: $stateParams.key,
                                value: value
                            };
                        });
                }
            }
        })
        .state('restore', {
            url: '/restore/{namespace}/{key}',
            templateUrl: 'views/restore.html',
            controller: 'RestoreController as $restoreCtrl',
            resolve: {
                dataStoreEntryPrevious: function ($stateParams, dataStore) {
                    return dataStore.getRestoreValueForKeyInNamespace($stateParams.namespace, $stateParams.key)
                        .then(function (restorevalue) {
                            return {
                                namespace: $stateParams.namespace,
                                key: $stateParams.key,
                                restorevalue: restorevalue
                            };
                        });
                },
                dataStoreEntry: function ($stateParams, dataStore) {
                    return dataStore.getValueForKeyInNamespace($stateParams.namespace, $stateParams.key)
                        .then(function (value) {
                            return {
                                namespace: $stateParams.namespace,
                                key: $stateParams.key,
                                value: value
                            };
                        });
                }
            }
        })
        .state('add', {
            url: '/add',
            templateUrl: 'views/add.html',
            controller: addCtrl
        });
}

function addCtrl($scope, $location, Restangular, notify) {
    $scope.isValueValidJSON = function () {
        try {
            JSON.parse($scope.dataStoreEntry.value);
            return true;
        } catch (e) {
            return false;
        }
    };
    $scope.save = function () {
        var url = 'dataStore/' + $scope.dataStoreEntry.namespace + '/' + $scope.dataStoreEntry.key + '/';
        Restangular.all(url).post($scope.dataStoreEntry.value)
        .then(function () {
            $location.path('/list');
        })
        .then(function () {
            notify.success('New Data Store Entry for ' + $scope.dataStoreEntry.key + ' Added in ' + $scope.dataStoreEntry.namespace);
        })
        .catch(function () {
            notify.error('Could NOT Add New Data Store Entry ' + $scope.dataStoreEntry.key + ' in ' + $scope.dataStoreEntry.namespace);
        });
    };
}

angular.module('PEPFAR.datastore')
    .config(routerConfig)
    .filter('startFrom', function () {
            return function (data, start) {
                return data.slice(start);
            };
        })
    .run(function (Restangular, webappManifest) {
        if (webappManifest.activities.dhis.href === '*') {
            Restangular.setBaseUrl('/api');
        } else {
            Restangular.setBaseUrl([webappManifest.activities.dhis.href, 'api'].join('/'));
        }
    });

//==================================================================================
// Bootstrap the app manually
//
window.getBootstrapper('PEPFAR.datastore', document)
    .addInjectableFromRemoteLocation('webappManifest', 'manifest.webapp')
    .execute(function () {
        window.dhis2 = window.dhis2 || {};
        window.dhis2.settings = window.dhis2.settings || {};
        window.dhis2.settings.baseUrl = '/';
        //window.dhis2.settings.baseUrl = injectables.webappManifest.activities.dhis.href.replace(window.location.origin, '').replace(/^\//, '');
    })
    .loadStylesheet('/dhis-web-commons/css/menu.css')
    .loadScript('/dhis-web-commons/javascripts/dhis2/dhis2.util.js')
    .loadScript('/dhis-web-commons/javascripts/dhis2/dhis2.translate.js')
    .loadModule('/dhis-web-commons/javascripts/dhis2/dhis2.menu.js', 'd2HeaderBar')
    .loadScript('/dhis-web-commons/javascripts/dhis2/dhis2.menu.ui.js')
    .bootstrap();
