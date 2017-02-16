angular.module('PEPFAR.datastore').controller('ListController', ListController);

function ListController(dataStore, $scope) {
    var vm = this;

    vm.namespaces = [];
    vm.currentNamespace = null;
    vm.dataStoreItems = [];

    vm.onSelectNamespace = onSelectNamespace;
    vm.hasCurrentNameSpace = hasCurrentNameSpace;

    function onSelectNamespace(selectedNamespace) {
        vm.currentNamespace = selectedNamespace;
    }

    function hasCurrentNameSpace() {
        return Boolean(vm.currentNamespace);
    }

    // Load the namespaces from the dataStore
    dataStore.getNameSpaces()
        .then(function (namespaces) {
            vm.namespaces = namespaces;
        });

    // Watch for the ui-select box to select a namespace
    $scope.$watch(
        function () { return vm.currentNamespace;},
        function (newValue, oldValue) {
            $scope.$emit('LOAD');
            if (oldValue !== newValue) {
                dataStore
                    .getValuesForAllKeysInNameSpace(newValue)
                    .then(function (dataStoreItems) {
                        window.console.log(dataStoreItems);
                        vm.dataStoreItems = dataStoreItems;
                        $scope.$emit('UNLOAD');
                    });
            }
        }
    );
}
