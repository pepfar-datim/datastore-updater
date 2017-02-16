angular.module('PEPFAR.datastore').controller('DeleteController', DeleteController);

function DeleteController(dataStore, dataStoreEntry, notify, $location, $scope, Restangular) {
    var vm = this;

    vm.deleteInProgress = false;
    vm.dataStoreEntry = {
        namespace: dataStoreEntry.namespace,
        key: dataStoreEntry.key,
        value: JSON.stringify(dataStoreEntry.value, undefined, 2)
    };

    vm.isValueValidJSON = isValueValidJSON;
    vm.isUpdating = isDeleting;
    vm.deleteValueToDataStore = deleteValueToDataStore;

    function isDeleting() {
        return vm.deleteInProgress;
    }

    function isValueValidJSON() {
        try {
            JSON.parse(vm.dataStoreEntry.value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function deleteValueToDataStore() {
        vm.deleteInProgress = true;

        dataStore.deleteValueToDataStore(vm.dataStoreEntry.namespace, vm.dataStoreEntry.key, JSON.parse(vm.dataStoreEntry.value))
            .then(function () {
                notify.success('Deleted ' + vm.dataStoreEntry.key + ' in ' + vm.dataStoreEntry.namespace);
            })
            .catch(function () {
                notify.error('Could not delete ' + vm.dataStoreEntry.key + ' in ' + vm.dataStoreEntry.namespace);
            })
            .then(function () {
                $location.path('/list');
            })
            .then(function () {
                vm.deleteInProgress = false;
            });

        $scope.dataStoreEntry = {
            namespace: dataStoreEntry.namespace,
            key: dataStoreEntry.key,
            value: JSON.stringify(dataStoreEntry.value, undefined, 2)
        };
        var url = 'dataStore/' + 'datastoreRestore/' + $scope.dataStoreEntry.namespace + '|' + $scope.dataStoreEntry.key + '/';
        Restangular.all(url).remove($scope.dataStoreEntry.value);
    }
}
