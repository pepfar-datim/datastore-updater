angular.module('PEPFAR.datastore').controller('EditController', EditController);

function EditController(dataStore, dataStoreEntry, notify, $scope, Restangular, $location) {
    var vm = this;

    vm.updateInProgress = false;
    vm.dataStoreEntry = {
        namespace: dataStoreEntry.namespace,
        key: dataStoreEntry.key,
        value: JSON.stringify(dataStoreEntry.value, undefined, 2)
    };

    vm.isValueValidJSON = isValueValidJSON;
    vm.isUpdating = isUpdating;
    vm.updateValueToDataStore = updateValueToDataStore;

    function isUpdating() {
        return vm.updateInProgress;
    }

    function isValueValidJSON() {
        try {
            JSON.parse(vm.dataStoreEntry.value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function updateValueToDataStore() {
        vm.updateInProgress = true;

        dataStore.updateValueToDataStore(vm.dataStoreEntry.namespace, vm.dataStoreEntry.key, JSON.parse(vm.dataStoreEntry.value))
            .then(function () {
                notify.success('Updated ' + vm.dataStoreEntry.key + ' in ' + vm.dataStoreEntry.namespace);
            })
            .catch(function () {
                notify.error('Could not update ' + vm.dataStoreEntry.key + ' in ' + vm.dataStoreEntry.namespace);
            })
            .then(function () {
                $location.path('/list');
            })
            .then(function () {
                vm.updateInProgress = false;
            });

        $scope.dataStoreEntry = {
            namespace: dataStoreEntry.namespace,
            key: dataStoreEntry.key,
            value: JSON.stringify(dataStoreEntry.value, undefined, 2)
        };
        var url = 'dataStore/' + 'datastoreRestore/' + $scope.dataStoreEntry.namespace + '|' + $scope.dataStoreEntry.key + '/';
        Restangular.all(url).customPUT($scope.dataStoreEntry.value);
    }

    angular.element(document).ready(function () {
        $scope.dataStoreEntry = {
            namespace: dataStoreEntry.namespace,
            key: dataStoreEntry.key,
            value: JSON.stringify(dataStoreEntry.value, undefined, 2)
        };
        var url = 'dataStore/' + 'datastoreRestore/' + $scope.dataStoreEntry.namespace + '|' + $scope.dataStoreEntry.key + '/';
        Restangular.all(url).post($scope.dataStoreEntry.value);
    });
}
