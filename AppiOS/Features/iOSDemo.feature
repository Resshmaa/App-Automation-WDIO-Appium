
Feature: Testing the functionality of iOS mobile app

    Background: Launching iOS App
        Given I am on the start page of iOS mobile app


    Scenario: Validating the login functionality in the iOS app
        Given I click login button in the menu of iOS app
        When I enter the username and password and click login in the iOS app
        Then I ensure the user is successfully logged into the iOS app
        And I verify the products listing
        When I logout from the app
        Then I ensure the user is logged out successfully
    
    Scenario: Validating the login functionality in the iOS app with wrong credentials
        Given I click login button in the menu of iOS app
        When I enter the unregistered username and password and click login in the iOS app
        Then I ensure the user is not successfully logged into the iOS app
