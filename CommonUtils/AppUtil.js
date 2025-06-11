/**
 * Utility class for interacting with app using WebdriverIO
 */

class App {

    /**
     * Resets the mobile app by terminating and relaunching it.
     * Uses platform-specific commands:
     * - Android: activateApp
     * - iOS: launchApp
     * 
     * @param {string} appID - The app package name (Android) or bundle ID (iOS)
     * @returns {Promise<void>}
     */
    static async resetMobileApp(driver, appID) {

        if (driver.isAndroid) {
            await driver.terminateApp(appID);
            await driver.activateApp(appID);
        }

        else {
            await driver.terminateApp(appID);
            await driver.launchApp(appID)
        }
    }

    /**
     * Removes the mobile app by uninstalling it.
     * 
     * @param {string} appID - The app package name (Android) or bundle ID (iOS)
     * @returns {Promise<void>}
     */
    static async uninstallApp(driver, appID) {
        await driver.execute('mobile: removeApp', { appID })
    }

}

module.exports = App;