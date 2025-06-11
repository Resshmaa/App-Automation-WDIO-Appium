const ElementUtil = require('../../CommonUtils/ElementUtil');
const BrowserUtil = require('../../CommonUtils/BrowserUtil');
const data = require('../TestData/androidData.json')

class android {

    get lnkMenu() {
        return $('~open menu')
    }

    get lnkLoginMenu() {
        return $('~menu item log in')
    }

    get lnkLogout() {
        return $('//android.widget.TextView[@text="Log Out"]')
    }

    get btnConfirmLogout() {
        return $('//android.widget.Button[@resource-id="android:id/button1"]')
    }

    get txtAlertTitle() {
        return $('//android.widget.TextView[@resource-id="android:id/alertTitle"]')
    }

    get txtUsername() {
        return $('~Username input field')
    }

    get txtPassword() {
        return $('~Password input field')
    }

    get btnLogin() {
        return $('~Login button')
    }

    get txtProducts() {
        return $('//android.widget.TextView[@text="Products"]')
    }

    get txtAlertNoRegisteredUser() {
        return $('//android.widget.TextView[@text="Provided credentials do not match any user in this service."]')
    }


    async selectMenu() {
        await ElementUtil.click(this.lnkMenu, "Select Menu")
    }

    async selectLoginPage() {
        await ElementUtil.click(this.lnkLoginMenu, "Select Login Menu")
    }

    async enterUsername() {
        await ElementUtil.sendText(this.txtUsername, data.Login.Username, "Enter username")
    }

    async enterPassword() {
        await ElementUtil.sendText(this.txtPassword, data.Login.Password, "Enter password")
    }

    async clickLogin() {
        await ElementUtil.click(this.btnLogin, "login button")
    }

    async wrongUsername() {
        await ElementUtil.sendText(this.txtUsername, data.Login.WrongUsername, "Enter wrong username")
    }

    async wrongPassword() {
        await ElementUtil.sendText(this.txtPassword, data.Login.WrongPassword, "Enter wrong password")
    }

    async selectLogout() {
        await ElementUtil.click(this.lnkLogout, "logout button")
        await BrowserUtil.wait(3)
        await ElementUtil.click(this.btnConfirmLogout, "Confirm logout")
    }
}

module.exports = android;