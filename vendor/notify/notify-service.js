angular.module('dhis2.notify', []).factory('notify', function () {
    var toastr;

    initialise();
    return {
        success: success,
        error: error,
        warning: warning
    };

    function initialise() {
        var toastrOptions;

        if (window.toastr) {
            toastr = window.toastr;
            toastrOptions = window.toastr.options;
            toastrOptions.positionClass = 'toast-top-right';
            toastrOptions.timeOut = 0;
            toastrOptions.extendedTimeOut = 0;
            toastrOptions.closeButton = true;
            toastrOptions.tapToDismiss = false;

            return window.toastr;
        }
        throw new Error('Toastr.js library does not seem to be loaded.');
    }

    function success(message) {
        toastr.success(message, undefined, {timeOut: 2500, extendedTimeOut: 2500});
    }

    function error(message) {
        toastr.error(message);
    }

    function warning(message) {
        toastr.warning(message, undefined, {timeOut: 2500, extendedTimeOut: 2500});
    }
});
