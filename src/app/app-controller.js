angular.module('PEPFAR.datastore').controller('appController', appController, saveAsFile);

function appController($scope, dataStore) {
    $scope.pageSize = 10;
    $scope.dataStoreItem = [];
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.maxSize = 10;

    $scope.$on('LOAD', function () {
        $scope.loading = true;
    });

    $scope.$on('UNLOAD', function () {
        $scope.loading = false;
    });

    // $scope.pageChanged = function () {
    //     $scope.$emit('LOAD');
    // };

    dataStore.getNameSpaces()
        .then(function (data) {
            $scope.namespace = data;
        });

    dataStore.getRestoreValueForKeyInNamespace('datastoreRestore', 'restore')
        .then(function (data) {
            $scope.restorevalue = data;
        });
}

function saveAsFile(link) {
    var blob = new Blob([document.getElementById('datadown').innerText], {type: 'text/json'});
    var url = URL.createObjectURL(blob);
    var a = link;
    a.download = 'datastore-settings.json';
    a.href = url;
}
