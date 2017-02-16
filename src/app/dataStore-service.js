angular.module('PEPFAR.datastore').factory('dataStore', dataStore);

function dataStore(Restangular, $q) {
    var dataStoreEndPoint = Restangular.all('dataStore');

    function plain(response) {
        return response.plain();
    }

    function getNameSpaces() {
        return dataStoreEndPoint.getList().then(plain);
    }

    function getKeysInNamespace(namespace) {
        return dataStoreEndPoint.all(namespace).getList().then(plain);
    }

    function getValueForKeyInNamespace(namespace, key) {
        return dataStoreEndPoint.all(namespace).get(key).then(plain);
    }

    function getValuesForAllKeysInNameSpace(namespace) {
        return dataStoreEndPoint
            .all(namespace)
            .getList()
            .then(plain)
            .then(function (keys) {
                var keyRequests = keys.map(function (key) {
                    return getValueForKeyInNamespace(namespace, key)
                        .then(function (value) {
                            return {
                                namespace: namespace,
                                key: key,
                                value: value
                            };
                        });
                });

                return $q.all(keyRequests);
            });
    }

    function updateValueToDataStore(namespace, key, value) {
        return dataStoreEndPoint
            .all(namespace)
            .all(key)
            .doPUT(value);
    }

    function getRestoreValueForKeyInNamespace(namespace, key) {
        return dataStoreEndPoint.all('datastoreRestore').get(namespace + '|' + key).then(plain);
    }

    function getRestoreValuesForAllKeysInNameSpace(namespace) {
        return dataStoreEndPoint
            .all(namespace)
            .getList()
            .then(plain)
            .then(function (keys) {
                var keyRequests = keys.map(function (key) {
                    return getRestoreValueForKeyInNamespace(namespace, key)
                        .then(function (value, restorevalue) {
                            return {
                                namespace: namespace,
                                key: key,
                                value: value,
                                restorevalue: restorevalue
                            };
                        });
                });

                return $q.all(keyRequests);
            });
    }

    function updateRestoreValueToDataStore(namespace, key, restorevalue) {
        return dataStoreEndPoint
            .all(namespace)
            .all(key)
            .doPUT(restorevalue);
    }

    function deleteValueToDataStore(namespace, key, value) {
        return dataStoreEndPoint
            .all(namespace)
            .all(key)
            .remove(value);
    }

    return {
        getNameSpaces: getNameSpaces,
        getKeysInNamespace: getKeysInNamespace,
        getValueForKeyInNamespace: getValueForKeyInNamespace,
        getRestoreValueForKeyInNamespace: getRestoreValueForKeyInNamespace,
        getRestoreValuesForAllKeysInNameSpace: getRestoreValuesForAllKeysInNameSpace,
        updateRestoreValueToDataStore: updateRestoreValueToDataStore,
        getValuesForAllKeysInNameSpace: getValuesForAllKeysInNameSpace,
        updateValueToDataStore: updateValueToDataStore,
        deleteValueToDataStore: deleteValueToDataStore
    };
}
