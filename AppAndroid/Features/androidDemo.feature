
Feature: Testing the functionality of android mobile app

    Background: Launching android App
        Given I am on the start page of android mobile app


    Scenario: Validating the login functionality in the android app
        Given I click login button in the menu of android app
        When I enter the username and password and click login in the android app
        Then I ensure the user is successfully logged into the android app
        And I verify the products listing
        When I logout from the app
        Then I ensure the user is logged out successfully
    
    Scenario: Validating the login functionality in the android app with wrong credentials
        Given I click login button in the menu of android app
        When I enter the unregistered username and password and click login in the android app
        Then I ensure the user is not successfully logged into the android app
