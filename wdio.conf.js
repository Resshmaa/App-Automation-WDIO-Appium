// Core Node and third-party module imports
const fs = require('fs');
const path = require('path');
const { removeSync } = require('fs-extra');
const argv = require('yargs').argv; // For CLI argument handling
const wdioParallel = require('wdio-cucumber-parallel-execution'); // For splitting feature files during parallel runs
const reporter = require('cucumber-html-reporter'); // To generate cucumber HTML reports
const cucumberJson = require('wdio-cucumberjs-json-reporter'); // JSON reporter for cucumber
const runConfig = require('./run.config.json'); // Runner configs

// Custom utility imports
const Log = require('./CommonUtils/Log');
const DateUtil = require('./CommonUtils/DateUtil');
const AppUtil = require('./CommonUtils/AppUtil')
const { hostname } = require('os');
const App = require('./CommonUtils/AppUtil');

// -------------------- Logging & Environment Setup --------------------

// Set log level from CLI or default to DEBUG
const logLevelSettings = argv.log || "debug";
Log.setLogLevel(logLevelSettings);

// Override runOn from CLI argument --env, fallback to JSON config or default 'local'
const runOn = argv.env || runConfig.runOn || "local";
console.log(`Running tests on environment: ${runOn}`);

// --------- ENV & PATH SETUP ---------

// Generate timestamp for report file naming
const currentTime = DateUtil.getDateISOString().replace(/:/g, "-");

const squad = runConfig.squad || 'AppAndroid'; // Default to AppAndroid if not specified
Log.audit('Current Squad: ' + squad);

const isBrowserStack = runConfig.runOn === 'browserstack'; // Pass RUN_ON=browserstack to trigger BS

let appID;
if (squad === 'AppAndroid') {
    appID = runConfig.appPackageAndroidSauceLabs;
}
else {
    appID = runConfig.bundleID;
}

// Set a global download directory (optional utility)
global.downloadDir = path.join(__dirname, 'tempDownloads');

// Define report directories
const jsonTmpDirectory = './reports/json/tmp/';
const junitReportDirectory = './reports/junit/';

// Define default feature file location
const sourceSpecDirectory = `./${squad}/Features`;
let featureFilePath = `${sourceSpecDirectory}/*.feature`;

// -------------------- Parallel Execution Handling --------------------

// If parallel execution is set to true, then split the feature files and store them in a tmp spec directory (created inside the source spec directory)
if (argv.parallel === 'true') {
    const tmpSpecDirectory = `${sourceSpecDirectory}/tmp`;
    wdioParallel.performSetup({
        sourceSpecDirectory,
        tmpSpecDirectory,
        cleanTmpSpecDirectory: true
    });
    featureFilePath = `${tmpSpecDirectory}/*.feature`;
}

// -------------------- Headless Mode Setup --------------------

// Define Chrome launch arguments
let chromeArgs = [];
if (argv.headless) {
    // If --headless flag is passed, configure browser to run headlessly
    Log.audit('Screen mode: Headless');
    chromeArgs = [
        '--headless',
        '--disable-gpu',
        '--window-size=1600,900',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-features=UserAgentClientHint'
    ];
} else {
    // Otherwise, run browser in headed mode
    Log.audit('Screen mode: On Screen');
}


// --------- CAPABILITIES ---------
function getCapabilities() {
    if (squad === "AppAndroid") {
        if (isBrowserStack) {
            // --- BrowserStack Android capability ---
            return [{
                deviceName: 'Samsung Galaxy S22 Ultra',
                platformVersion: '12.0',
                platformName: 'android',
                app: runConfig.browserstack.androidAppUrl,
                "browserstack.debug": true,         // for screenshots, logs, etc.
                "browserstack.video": true,         // enables video recording
                "browserstack.networkLogs": true,   // capture network logs
            }];
        } else {
            // --- Local Android Emulator capability ---
            return [{
                platformName: "Android",
                maxInstances: 1,
                'appium:deviceName': "Pixel_7", // Replace with actual device/emulator
                'appium:platformVersion': "16.0",
                'appium:automationName': "UiAutomator2", // Automation engine
                'appium:app': "./AppAndroid/Configs/apps/Android-MyDemoAppRN.1.3.0.build-244.apk",
                'appium:autoGrantPermissions': true
            }];
        }
    }

    if (squad === "AppiOS") {
        if (isBrowserStack) {
            // --- BrowserStack iOS capability ---
            return [{
                deviceName: 'iPhone 14 Pro Max',
                platformVersion: '16',
                platformName: 'ios',
                app: runConfig.browserstack.iOSAppUrl,
                "browserstack.debug": true,         // for screenshots, logs, etc.
                "browserstack.video": true,         // enables video recording
                "browserstack.networkLogs": true,   // capture network logs
            }];
        } else {
            // --- Local iOS Simulator capability ---
            return [{
                platformName: "iOS", 
                maxInstances: 1,
                'appium:deviceName': "iPhone 14", // Replace with actual device/emulator
                'appium:platformVersion': "16.0",
                'appium:automationName': "XCUITest", // Automation engine
                'appium:app': "./AppiOS/Configs/apps/iOS-Real-Device-MyRNDemoApp.1.3.0-162.ipa",
                'appium:autoAcceptAlerts': true
            }];
        }
    }

    throw new Error(`Unsupported squad: ${squad}`);
}


// --------- SERVICES ---------
function getServices() {
    // Use BrowserStack service if specified
    if (isBrowserStack) {
        return [
            ['browserstack', {
                testObservability: true,
                testObservabilityOptions: {
                    projectName: 'Demo App Automation',
                    buildName: `WebdriverIO-${runConfig.squad}-Test`,
                    buildTag: 'Tag1',
                    accessibility: false
                }
            }]
        ];
    }

    if (squad === "AppAndroid") {
        return [
        ['appium', {
            command: 'appium',
            args: {
            address: '127.0.0.1',
            port: 4723,
            log: './appium.log',
            basePath: '/wd/hub',
            }
        }]
        ]
    }

    // For local iOS execution
    if (squad === "AppiOS") {
        return [
            ['appium', {
            command: 'appium',
            args: {
                address: '127.0.0.1',
                port: 4723,
                log: './appium.log',
                basePath: '/wd/hub',
            },
            waitStartTimeout: 60000
        }]];
    }

}


// -------------------- WebdriverIO Configuration --------------------

exports.config = {

    // BrowserStack credentials (only loaded if RUN_ON=browserstack)
    user: runConfig.browserstack.username,
    key: runConfig.browserstack.accessKey,
    hostname: runConfig.browserstack.hub,

    //
    // ====================
    // Runner Configuration
    // ====================
    // WebdriverIO supports running e2e tests as well as unit and component tests.

    // runner: 'local', // Local test runner
    // hostname: '127.0.0.1',
    // port: 4723, // Default Appium port
    // path: '/wd/hub',

    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory of the configuration file being run.
    //
    // The specs are defined as an array of spec files (optionally using wildcards that will be expanded). The test for each spec file will be run in a separate worker process. 
    // In order to have a group of spec files run in the same worker process simply enclose them in an array within the specs array.
    //
    // The path of the spec files will be resolved relative from the directory of the config file unless it's absolute.
    //
    specs: [featureFilePath], // Feature files to run

    // Patterns to exclude.
    exclude: [], // Any specs to exclude

    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same time. Depending on the number of capabilities, WebdriverIO launches several test sessions. 
    // Within your capabilities you can overwrite the spec and exclude options in order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. 
    // Let's say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have set maxInstances to 1; wdio will spawn 3 processes. 
    // Therefore, if you have 10 spec files and you set maxInstances to 10, all spec files will get tested at the same time and 30 processes will get spawned. 
    // The property handles how many capabilities from the same test should run tests.
    //

    maxInstances: 10, // Max parallel test instances

    //
    // If you have trouble getting all important capabilities together, check out the Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://saucelabs.com/platform/platform-configurator
    //

    // capabilities for local Appium web tests on an Android Emulator
    capabilities: getCapabilities(),

    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'warn', // Logs only warnings and errors
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/browserstack-service, @wdio/lighthouse-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/appium-service': 'info'
    // },

    //
    // If you only want to run your tests until a specific amount of tests have failed use bail (default is 0 - don't bail, run all tests).
    bail: 0, // Do not bail on first failure

    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url gets prepended directly.
    // baseUrl: 'http://localhost:8080',

    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000, // Default wait timeout (10s)

    //
    // Default timeout in milliseconds for request if browser driver or grid doesn't send response
    connectionRetryTimeout: 120000, // Timeout for retrying connection

    //
    // Default request retries count
    connectionRetryCount: 3, // Retry connection attempts

    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance your test setup with almost no effort. 
    // Unlike plugins, they don't add new commands. Instead, they hook themselves up into the test process.
    services: getServices(),

    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks
    //
    // Make sure you have the wdio adapter package for the specific framework installed before running any tests.
    framework: 'cucumber', // Test framework

    //
    // The number of times to retry the entire specfile when it fails as a whole
    // specFileRetries: 1,
    //
    // Delay in seconds between the spec file retry attempts
    // specFileRetriesDelay: 0,
    //
    // Whether or not retried spec files should be retried immediately or deferred to the end of the queue
    // specFileRetriesDeferred: false,

    // -------------------- Reporters --------------------
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter
    reporters: [
        ['cucumberjs-json', {
            jsonFolder: jsonTmpDirectory, // Where to store JSON reports
            language: 'en',
        }]
    ],

    // -------------------- Cucumber Options --------------------
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        // <string[]> (file/dir) require files before executing features
        require: [`./${squad}/StepDefs/*.js`], // Step definition files
        // <boolean> show full backtrace for errors
        backtrace: false,
        // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
        requireModule: [],
        // <boolean> invoke formatters without executing steps
        dryRun: false, // Set true to validate steps without running
        // <boolean> abort the run on first failure
        failFast: false,
        // <string[]> Only execute the scenarios with name matching the expression (repeatable).
        name: [],
        // <boolean> hide step definition snippets for pending steps
        snippets: true,
        // <boolean> hide source uris
        source: true,
        // <boolean> fail if there are any undefined or pending steps
        strict: false,
        // <string> (expression) only execute the features or scenarios with tags matching the expression
        tagExpression: '', // Run specific tags via CLI --cucumberOpts.tagExpression="@tag"
        // <number> timeout for step definitions
        timeout: 60000, // Step timeout (60s)
        // <boolean> Enable this config to treat undefined definitions as warnings.
        ignoreUndefinedDefinitions: false
    },

    // -------------------- Hooks --------------------
    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    // onPrepare: function (config, capabilities) {
    // },
    // Before the test suite starts

    onPrepare: () => {

        // Remove the 'reports/json' folder that holds the Cucumber JSON files
        removeSync(jsonTmpDirectory);
        if (!fs.existsSync(jsonTmpDirectory)) {
            fs.mkdirSync(jsonTmpDirectory);
        }

        // Remove the 'reports/junit' folder that holds the JUnit reports
        // No need to recreate it manually, the reporter will do it automatically
        removeSync(junitReportDirectory);

        // Remove and recreate the download directory for file downloads
        removeSync(downloadDir);
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }
    },


    // onPrepare: () => {

    // console.log("Preparing tests...");
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //         console.log("Waited 30 seconds before starting tests.");
    //         resolve();
    //         }, 30000);
        

    // // Remove the 'reports/json' folder that holds the Cucumber JSON files
    // removeSync(jsonTmpDirectory);
    //     if (!fs.existsSync(jsonTmpDirectory)) {
    //         fs.mkdirSync(jsonTmpDirectory);
    //     }

    //     // Remove the 'reports/junit' folder that holds the JUnit reports
    //     // No need to recreate it manually, the reporter will do it automatically
    //     removeSync(junitReportDirectory);

    //     // Remove and recreate the download directory for file downloads
    //     removeSync(downloadDir);
    //     if (!fs.existsSync(downloadDir)) {
    //         fs.mkdirSync(downloadDir);
    //     }
    // },

    /**
     * Gets executed before a worker process is spawned and can be used to initialize specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {string} cid      capability id (e.g 0-0)
     * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {object} specs    specs to be run in the worker process
     * @param  {object} args     object that will be merged with the main configuration once worker is initialized
     * @param  {object} execArgv list of string arguments passed to the worker process
     */
    // onWorkerStart: function (cid, caps, specs, args, execArgv) {
    // },
    /**
     * Gets executed just after a worker process has exited.
     * @param  {string} cid      capability id (e.g 0-0)
     * @param  {number} exitCode 0 - success, 1 - fail
     * @param  {object} specs    specs to be run in the worker process
     * @param  {number} retries  number of retries used
     */
    // onWorkerEnd: function (cid, exitCode, specs, retries) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     * @param {string} cid worker id (e.g. 0-0)
     */
    // beforeSession: function (config, capabilities, specs, cid) {
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     * @param {object}         browser      instance of created browser/device session
     */
    // before: function (capabilities, specs) {
    // },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {string} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Cucumber Hooks
     *
     * Runs before a Cucumber Feature.
     * @param {string}                   uri      path to feature file
     * @param {GherkinDocument.IFeature} feature  Cucumber feature object
     */
    // beforeFeature: function (uri, feature) {
    // },

    beforeFeature: function (uri, feature) {
        Log.audit("======================================================================")
        Log.audit("FEATURE to be executed is: " + feature.name);
    },

    /**
     *
     * Runs before a Cucumber Scenario.
     * @param {ITestCaseHookParameter} world    world object containing information on pickle and test step
     * @param {object}                 context  Cucumber World object
     */
    // beforeScenario: function (world, context) {
    // },

    beforeScenario: function (world, context) {
        Log.audit("-----------------------------------------------------------------------")
        Log.audit("SCENARIO to be executed is: " + world.pickle.name);
    },

    /**
     *
     * Runs before a Cucumber Step.
     * @param {Pickle.IPickleStep} step     step data
     * @param {IPickle}            scenario scenario pickle
     * @param {object}             context  Cucumber World object
     */
    // beforeStep: function (step, scenario, context) {
    // },
    /**
     *
     * Runs after a Cucumber Step.
     * @param {Pickle.IPickleStep} step             step data
     * @param {IPickle}            scenario         scenario pickle
     * @param {object}             result           results object containing scenario results
     * @param {boolean}            result.passed    true if scenario has passed
     * @param {string}             result.error     error stack if scenario failed
     * @param {number}             result.duration  duration of scenario in milliseconds
     * @param {object}             context          Cucumber World object
     */
    // afterStep: function (step, scenario, result, context) {
    // },

    afterStep: async function (step, scenario, result, context) {
        //take and attached screenshots in cucumber json
        if (!result.passed) {
            cucumberJson.attach(await browser.takeScreenshot(), 'image/png');
        }
    },

    /**
     *
     * Runs after a Cucumber Scenario.
     * @param {ITestCaseHookParameter} world            world object containing information on pickle and test step
     * @param {object}                 result           results object containing scenario results
     * @param {boolean}                result.passed    true if scenario has passed
     * @param {string}                 result.error     error stack if scenario failed
     * @param {number}                 result.duration  duration of scenario in milliseconds
     * @param {object}                 context          Cucumber World object
     */
    // afterScenario: function (world, result, context) {
    // },

    afterScenario: async function (world, result, context) {
        var executionDuration = DateUtil.formatDuration(world.result.duration.nanos)
        Log.audit("SCENARIO: " + world.pickle.name + ", STATUS: " + world.result.status + ", EXECUTION DURATION: " + executionDuration);
        Log.audit("-----------------------------------------------------------------------")

        await AppUtil.resetMobileApp(appID);
    },

    /**
     *
     * Runs after a Cucumber Feature.
     * @param {string}                   uri      path to feature file
     * @param {GherkinDocument.IFeature} feature  Cucumber feature object
     */
    // afterFeature: function (uri, feature) {
    // },

    /**
     * Runs after a WebdriverIO command gets executed
     * @param {string} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {number} result 0 - command success, 1 - command error
     * @param {object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {object} exitCode 0 - success, 1 - fail
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    // onComplete: function(exitCode, config, capabilities, results) {
    // },

    // After the test suite ends
    // onComplete: async() => {
    
        onComplete: () => {
    // await AppUtil.uninstallApp(appID)
        
    let reportName;
        if (argv.suite) {
            reportName = `reports/html/${argv.suite}-${currentTime}.html`;
        } else {
            reportName = `reports/html/${currentTime}.html`;
        }

        try {
            // Step 1: Consolidate all JSON reports
            const consolidatedJsonArray = wdioParallel.getConsolidatedData({
                parallelExecutionReportDirectory: jsonTmpDirectory
            });

            const jsonFile = path.join(jsonTmpDirectory, 'report.json');
            fs.writeFileSync(jsonFile, JSON.stringify(consolidatedJsonArray, null, 2));

            // Step 2: Read and deduplicate scenarios
            let content = JSON.parse(fs.readFileSync(jsonFile));

            content.forEach(feature => {
                const uniqueElements = [];
                const seenNames = new Set();

                feature.elements.forEach(element => {
                    if (!seenNames.has(element.name)) {
                        seenNames.add(element.name);
                        uniqueElements.push(element);
                    }
                });

                feature.elements = uniqueElements;
            });

            fs.writeFileSync(jsonFile, JSON.stringify(content, null, 2));

            // Step 3: Generate HTML report
            const options = {
                theme: 'bootstrap',
                jsonFile: jsonFile,
                output: reportName,
                reportSuiteAsScenarios: false,
                scenarioTimestamp: true,
                launchReport: true,
                ignoreBadJsonFile: true,
                screenshotsDirectory: 'reports/html/screenshots/',
                storeScreenshots: false,
                brandTitle: 'Appium-WDIO-CucumberJS Tests',
                metadata: {
                    'App Version': 'Version xxxxxx',
                    'Test Environment': runOn,
                    'Parallel': 'Scenarios',
                    'Executed': 'Remote'
                }
            };

            reporter.generate(options);
        } catch (err) {
            console.error('[ERROR][onComplete] Report Generation Failed:', err);
        }
    }

    /**
    * Gets executed when a refresh happens.
    * @param {string} oldSessionId session ID of the old session
    * @param {string} newSessionId session ID of the new session
    */
    // onReload: function(oldSessionId, newSessionId) {
    // }
    /**
    * Hook that gets executed before a WebdriverIO assertion happens.
    * @param {object} params information about the assertion to be executed
    */
    // beforeAssertion: function(params) {
    // }
    /**
    * Hook that gets executed after a WebdriverIO assertion happened.
    * @param {object} params information about the assertion that was executed, including its results
    */
    // afterAssertion: function(params) {
    // }
};
