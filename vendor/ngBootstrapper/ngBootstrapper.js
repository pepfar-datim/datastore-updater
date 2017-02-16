/* global toastr */
(function (window, angular) {

    /**
     * Constructs a new instance of the bootstrapper
     *
     * @param {String} appName Name of the app module that needs to be bootstrapped
     * @param {DomNode} element The element that the module needs to be attached to
     * @constructor
     */
    function NgBootstrapper(appName, element) {
        if (!appName || typeof appName !== 'string') {
            throw 'App name should be a string';
        }

        //Will throw an error if the module does not exist
        angular.module(appName);

        if (element === window.document) {
            this.element = document.body;
        } else {
            this.element = element;
        }

        this.appName = appName;
        this.remoteInjectableConfigs = [];

        //Create a new injector for this bootstrapper
        this.injector = angular.injector(window.getBootstrapper.$inject);

        this.injectables = {};
        this.runFunctions = [];
        this.modules = [];
        this.scripts = [];
        this.stylesheets = [];
        this.basePathResolver = function (url) {
            return url;
        };

        //Defer the bootstrapping by setting the name flag
        window.name = 'NG_DEFER_BOOTSTRAP!';

        angular.bootstrap(element, [this.appName]);

        //Reset the bootstrapping defer
        window.name = undefined;
    }

    /**
     * Specify a remote source by setting the name and the location.
     * The sources will be loaded when the bootstrap method is called.
     *
     * @param {String} name The name this data will be known by, the injectable name
     * @param {String} url The url where the data is located
     *
     * @returns {NgBootstrapper} Returns itself for chaining purposes
     */
    NgBootstrapper.prototype.addInjectableFromRemoteLocation = function (name, url) {
        if (typeof name !== 'string') {
            throw 'name should be a string';
        }

        if (typeof url !== 'string') {
            throw 'url should be a string';
        }

        this.remoteInjectableConfigs.push({
            name: name,
            remoteUrl: url
        });

        return this;
    };

    /**
     * Load an external script into the document
     * The urlModifier can be used to get a hold of remoteinjectables that might influence
     * the url of the file, like a base path definition.
     *
     * @param {String} scriptUrl The url of the script to be loaded
     * @param {Function} urlModifier Url modifier to modify the url path based on earlier resolved dependencies
     *
     * @returns {NgBootstrapper} Returns itself for chaining
     */
    NgBootstrapper.prototype.loadScript = function (scriptUrl, urlModifier) {
        if (typeof scriptUrl === 'string') {
            this.scripts.push({
                url: scriptUrl,
                resolve: urlModifier
            });
        }
        return this;
    };

    NgBootstrapper.prototype.loadModule = function (scriptUrl, moduleName, urlModifier) {
        if (typeof scriptUrl === 'string' && typeof moduleName === 'string') {
            this.loadScript(scriptUrl, urlModifier);
            this.modules.push(moduleName);
        }
        return this;
    };

    NgBootstrapper.prototype.execute = function (executeFunction) {
        if (typeof executeFunction === 'function' && executeFunction.call) {
            this.runFunctions.push(executeFunction);
        }
        return this;
    };

    /**
     * Load an external stylesheet and add it to the document head
     * Adds href for the provided url and sets rel to stylesheet and type to text/css.
     * The urlModifier can be used to get a hold of remoteinjectables that might influence
     * the url of the file, like a base path definition.
     *
     * @param {String} stylesheetUrl The url of the stylesheet to be loaded
     * @param {Function} urlModifier Url modifier to modify the url path based on earlier resolved dependencies
     *
     * @returns {NgBootstrapper} Returns itself for chaining
     */
    NgBootstrapper.prototype.loadStylesheet = function (stylesheetUrl, urlModifier) {
        if (typeof stylesheetUrl === 'string') {
            this.stylesheets.push({
                url: stylesheetUrl,
                resolve: urlModifier
            });
        }
        return this;
    };

    /**
     * Execute the ajax calls for the dependencies that are set using one of the add methods
     *
     * @returns {Array} Returns an array of promises that represent the requests
     */
    NgBootstrapper.prototype.executeRemoteCalls = function () {
        var promises = [];
        var $http = this.injector.get('$http');
        var $log = this.injector.get('$log');
        var $q = this.injector.get('$q');

        this.remoteInjectableConfigs.forEach(function (remoteInjectableConfig) {
            var promise = $http.get(remoteInjectableConfig.remoteUrl).then(function (response) {
                return {
                    name: remoteInjectableConfig.name,
                    data: response.data
                };
            }, function (error) {
                $log.error(error);
                return $q.reject(error);
            });
            promises.push(promise);
        });
        return promises;
    };

    /**
     * Creates the factories on the module that will be injected with the external results.
     * It adds a factory to the module that returns the data on the response.
     * It looks for a data property on each of the responses.
     *
     * @param {Object} module Angular module that should be injected into the app
     * @param {Array} responses Array of responses that have been received from the ajax calls.
     */
    NgBootstrapper.prototype.createFactories = function (module, responses) {
        var injectables = this.injectables;
        angular.forEach(responses, function (response) {
            injectables[response.name] = response.data;
            module.factory(response.name, function () {
                return response.data;
            });
        });
    };

    /**
     * Perform the actual bootstrapping. It executes the remote calls and when all of
     * them are successful will create the injectables and bootstrap the app.
     *
     * @returns {NgBootstrapper} Returns itself for chaining purposes
     */
    NgBootstrapper.prototype.bootstrap = function () {
        //Create an injectables module
        var module = this.module = angular.module(this.appName + '.injectables', this.modules);

        var self = this;
        var $q = this.injector.get('$q');
        var scripts = this.scripts;
        var stylesheets = this.stylesheets;
        var element = this.element;
        var injectables = this.injectables;
        var basePathResolver = this.basePathResolver;

        if (this.remoteInjectableConfigs.length > 0) {
            $q.all(this.executeRemoteCalls())
                .then(function (responses) {
                    self.createFactories(module, responses);
                    self.runFunctions.forEach(function (runFunction) {
                        runFunction.call(self, injectables);
                    });
                })
                .then(function () {
                    function getBasePath(urlDef) {
                        var resolverFunction = urlDef.resolve || basePathResolver;
                        return resolverFunction.call(null, urlDef.url, injectables);
                    }

                    addStylesheets(stylesheets.map(getBasePath));
                    addScripts.bind(element)(scripts.map(getBasePath));

                    setIsLoadedFlag();
                })
                .then(function () {
                    resumeBootstrapWhenLoaded.bind(self)();
                });
        } else {
            resumeBootstrapWhenLoaded.bind(self)();
        }

        function setIsLoadedFlag() {
            var loadedElement = document.createElement('script');
            loadedElement.textContent = 'window.ngBootstrapperScriptFilesLoaded = true;';
            element.appendChild(loadedElement);
        }

        function resumeBootstrapWhenLoaded() {
            var limit = 2000;
            try {
                this.modules.forEach(function (moduleName) {
                    angular.module(moduleName);
                });
                angular.resumeBootstrap([self.appName + '.injectables']);
            } catch (e) {
                if (window.console && window.console.info && resumeBootstrapWhenLoaded.attempts < limit) {
                    resumeBootstrapWhenLoaded.attempts += 1;
                    window.console.info('Waiting for scripts to be loaded! Re-attempting bootstrap in 10 miliseconds');
                    window.setTimeout(resumeBootstrapWhenLoaded.bind(this), 10);
                } else {
                    if (toastr) {
                        toastr.error('Gave up to load module after ' + limit + ' attempts: ' + extractMessageFromAngularError(e), undefined, {
                            positionClass: 'toast-top-right',
                            timeOut: 0,
                            extendedTimeOut: 0,
                            closeButton: true,
                            tapToDismiss: false
                        });
                    }
                }
            }

            function extractMessageFromAngularError(e) {
                var regExp = /Module '\w+' is not available!/;
                if (angular.isString(e.message) && regExp.test(e.message)) {
                    return e.message.match(regExp)[0];
                }
                return 'A required module could not be found';
            }
        }
        resumeBootstrapWhenLoaded.attempts = 0;

        return this;
    };

    NgBootstrapper.prototype.setBasePathResolver = function (resolverFunction) {
        if (typeof resolverFunction === 'function') {
            this.basePathResolver = resolverFunction;
        }
        return this;
    };

    function addScripts(scriptUrls) {
        scriptUrls.forEach(function (scriptUrl) {
            var scriptElement = document.createElement('script');

            scriptElement.setAttribute('src', scriptUrl);
            this.appendChild(scriptElement);
        }, this);
    }

    function addStylesheets(stylesheetUrls) {
        stylesheetUrls.forEach(function (stylesheetUrl) {
            var stylesheetElement = document.createElement('link');
            stylesheetElement.setAttribute('href', stylesheetUrl);
            stylesheetElement.setAttribute('rel', 'stylesheet');
            stylesheetElement.setAttribute('type', 'text/css');

            document.head.appendChild(stylesheetElement);
        }, this);
    }

    /**
     * Exposed method on the window to get a new bootstrapper.
     *
     * @param {String} appName Name of the app module that needs to be bootstrapped.
     * @param {DomNode} element Dom element that the app will be attached to.
     * @returns {NgBootstrapper} Returns the instance of the bootstrapper.
     */
    window.getBootstrapper = function (appName, element) {
        //Defer the bootstrapping of any apps

        return new NgBootstrapper(appName, element);
    };
    window.getBootstrapper.$inject = ['ng'];
}(window, angular));
