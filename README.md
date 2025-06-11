# App-Automation-WDIO-Appium

App Automation Framework with WebdriverIO + Appium + CucumberJS

A modular and scalable mobile automation test framework supporting **Android and iOS** platforms using **WebdriverIO**, **Appium**, and **CucumberJS** with support for **local & cloud runs (BrowserStack)**, and a **squad-based folder structure**.

---

## 📁 Project Structure

```
├── AppAndroid/                  # Android-specific automation code
│   ├── Configs/
│   ├── Features/
│   ├── PageObjects/
│   ├── StepDefs/
│   └── TestData/
│
├── AppiOS/                      # iOS-specific automation code
│   ├── Configs/
│   ├── Features/
│   ├── PageObjects/
│   ├── StepDefs/
│   └── TestData/
│
├── CommonUtils/                # Shared utility functions (logger, date utils, etc.)
├── reports/                    # JSON, JUnit, and HTML reports
├── tempDownloads/             # Folder to handle file downloads
├── run.config.json            # Environment and app configuration
├── wdio.conf.js               # Main WebdriverIO config file
├── package.json               # Project metadata and dependencies
└── README.md

````

---

## Key Concepts

### Squad-Based Architecture
- `squad` defines the active platform folder: `AppAndroid` or `AppiOS`.
- Automatically switches feature files, step definitions, capabilities, and configs based on the `squad` defined in `run.config.json` or CLI.

### Cloud & Local Execution
- Supports local execution using **Android Studio emulator** or **iOS Simulator**.
- Easily switch to **BrowserStack** by setting `runOn: "browserstack"` in `run.config.json`.

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
````

### 2. 🔧 Configure `run.config.json`

```json
{
  "runOn": "local",                 // or "browserstack"
  "squad": "AppAndroid",           // or "AppiOS"
  "appPackageAndroidSauceLabs": "<appID-of-AndroidApp>",
  "bundleID": "<bundleID-of-iOSApp",
  "browserstack": {
    "username": "<your-username>",
    "accessKey": "<your-access-key>",
    "hub": "hub.browserstack.com",
    "androidAppUrl": "bs://<app-id>",
    "iOSAppUrl": "bs://<app-id>"
  }
}
```

### 3. Run Tests

#### Local Execution

```bash
npm run test:local
```

#### BrowserStack Execution

```bash
npm run test:bs
```

#### Headless / Parallel Mode

```bash
npm run test:local -- --parallel=true --headless=true
```

---

## Reports & Logs

* **Cucumber JSON Reports:** `reports/json/tmp/`
* **HTML Reports:** `reports/html/`
* **Screenshots on Failure:** auto-attached in JSON
* **Console Logging:** customizable via CLI: `--log=info | debug | error`

---

## Tools & Frameworks Used

* [WebdriverIO v9](https://webdriver.io/)
* [Appium v2](https://appium.io/)
* [CucumberJS](https://cucumber.io/)
* [BrowserStack](https://www.browserstack.com/)
* [cucumber-html-reporter](https://www.npmjs.com/package/cucumber-html-reporter)
* [wdio-cucumber-parallel-execution](https://www.npmjs.com/package/wdio-cucumber-parallel-execution)

---

## Notes

* Android execution was tested using **Android Studio** Emulator and **Appium Inspector**.
* iOS execution is **configured but untested**, as Mac environment was not available at the time.
