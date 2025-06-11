const { Given, When, Then } = require('@wdio/cucumber-framework');
const android = require('../PageObjects/androidDemo');
const ElementUtil = require('../../CommonUtils/ElementUtil');
const data = require('../TestData/androidData.json')

Given(/^I am on the start page of android mobile app$/, async() => {
	console.log('Android App is launched');
	const startScreen = new android;
    expect(startScreen.lnkMenu).toExist();
});


Given(/^I click login button in the menu of android app$/, async() => {
	const login = new android;
    await login.selectMenu();
    await login.selectLoginPage();
});


When(/^I enter the username and password and click login in the android app$/, async() => {
	const credentials = new android;
    await credentials.enterUsername();
    await credentials.enterPassword();
    await credentials.clickLogin();
});


Then(/^I ensure the user is successfully logged into the android app$/, async() => {
	const home = new android;
    expect(home.txtProducts).toExist();
});


When(/^I enter the unregistered username and password and click login in the android app$/, async() => {
	const credentials = new android;
    await credentials.wrongUsername();
    await credentials.wrongPassword();
    await credentials.clickLogin();
});


Then(/^I ensure the user is not successfully logged into the android app$/, async() => {
	const home = new android;
    expect(home.txtProducts).not.toExist();
    expect(home.txtAlertNoRegisteredUser).toExist();
});


Then(/^I verify the products listing$/, async() => {
	const home = new android;
    expect(home.txtProducts).toExist();
});


When(/^I logout from the app$/, async() => {
	const login = new android;
    await login.selectMenu();
    await login.selectLogout();
});


Then(/^I ensure the user is logged out successfully$/, async() => {
	const home = new android;
    let alertTitle = await ElementUtil.getText(home.txtAlertTitle, "Alert text")
    expect(alertTitle).toEqual(data.Logout.LogoutConfirmationMessage)
    await ElementUtil.click(home.btnConfirmLogout, "OK button")
});

