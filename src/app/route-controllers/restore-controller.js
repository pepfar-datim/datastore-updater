angular.module('PEPFAR.datastore').controller('RestoreController', RestoreController);

function RestoreController(dataStore, dataStoreEntry, notify, $scope, Restangular, dataStoreEntryPrevious, $location) {
    var vm = this;

    vm.updateInProgress = false;
    vm.dataStoreEntryPrevious = {
        namespace: dataStoreEntryPrevious.namespace,
        key: dataStoreEntryPrevious.key,
        value: JSON.stringify(dataStoreEntry.value, undefined, 2),
        restorevalue: JSON.stringify(dataStoreEntryPrevious.restorevalue, undefined, 2)
    };
    vm.dataStoreEntry = {
        namespace: dataStoreEntry.namespace,
        key: dataStoreEntry.key,
        value: JSON.stringify(dataStoreEntry.value, undefined, 2)
    };

    vm.isValueValidJSON = isValueValidJSON;
    vm.isUpdating = isUpdating;
    vm.updateRestoreValueToDataStore = updateRestoreValueToDataStore;

    function isUpdating() {
        return vm.updateInProgress;
    }

    function isValueValidJSON() {
        try {
            JSON.parse(vm.dataStoreEntryPrevious.value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function updateRestoreValueToDataStore() {
        vm.updateInProgress = true;

        dataStore.updateRestoreValueToDataStore(vm.dataStoreEntryPrevious.namespace, vm.dataStoreEntryPrevious.key, JSON.parse(vm.dataStoreEntryPrevious.restorevalue))
            .then(function () {
                notify.success('Restored ' + vm.dataStoreEntryPrevious.key + ' in ' + vm.dataStoreEntryPrevious.namespace);
            })
            .catch(function () {
                notify.error('Could not Restore ' + vm.dataStoreEntryPrevious.key + ' in ' + vm.dataStoreEntryPrevious.namespace);
            })
            .then(function () {
                $location.path('/list');
            })
            .then(function () {
                vm.updateInProgress = false;
            });

        $scope.dataStoreEntryPrevious = {
            namespace: dataStoreEntryPrevious.namespace,
            key: dataStoreEntryPrevious.key,
            restorevalue: JSON.stringify(dataStoreEntryPrevious.restorevalue, undefined, 2)
        };
        var url = 'dataStore/' + 'datastoreRestore/' + $scope.dataStoreEntryPrevious.namespace + '|' + $scope.dataStoreEntryPrevious.key + '/';
        Restangular.all(url).customPUT($scope.dataStoreEntryPrevious.restorevalue);

        // $scope.dataStoreEntry = {
        //     namespace: dataStoreEntry.namespace,
        //     key: dataStoreEntry.key,
        //     value: JSON.stringify(dataStoreEntry.value, undefined, 2)
        // };
        // Restangular.one('dataStore/', $scope.dataStoreEntry.namespace).all($scope.dataStoreEntry.key).customPUT($scope.dataStoreEntry.value);
        // var url = 'dataStore/' + $scope.dataStoreEntry.namespace + '/' + $scope.dataStoreEntry.key + '/';
        // Restangular.all(url).customPUT($scope.dataStoreEntry.value);
    }
}
