/* global require, console */
module.exports = {
    checkForDHIS2ConfigFile: checkForDHIS2ConfigFile,
    runKarma: runKarma
};

function runKarma(watch) {
    var karma = require('gulp-karma');
    var config = {
        configFile: 'test/karma.conf.js'
    };

    if (!watch) {
        watch = false;
    }

    if (watch === true) {
        config.action = 'watch';
    }

    return karma(config);
}

/**
 * Checks if the dhis.json file is present in the root of the project. This will be required for
 * tasks that interact with a running dhis2 instance (for example to circumvent the install process)
 */
function checkForDHIS2ConfigFile() {
    var dhisConfig;
    var path = require('path');
    try {
        dhisConfig = require(path.resolve('./dhis.json'));
    } catch (e) {
        console.log('DHIS 2 config file not found. Deploying dhis using gulp will not work.');
        return {};
    }

    if (!dhisConfig.dhisDeployDirectory) {
        console.log('');
        console.log('Dhis 2 deploy directory not set, please add a dhis.json to your project that looks like');
        console.log(JSON.stringify({ dhisDeployDirectory: '<YOUR DHIS2 DIRECTORY>' }, undefined, 2));
        console.log('');
        throw new Error('DHIS deploy location not found');
    }

    return dhisConfig;
}