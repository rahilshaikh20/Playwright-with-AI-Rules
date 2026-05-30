# Login Module — Manual Test Cases

Application: https://practicetestautomation.com/practice-test-login/

---

## TC-LOGIN-001

Test Case ID: TC-LOGIN-001
Module: Login
Title: Positive LogIn test
Priority: High
Preconditions: User is on the login page
Test Data: username=student, password=Password123
Steps:
1. Open login page
2. Type username into Username field
3. Type password into Password field
4. Click Submit button
Expected Result: Redirect to logged-in-successfully page; success message displayed; Log out button visible
Post Conditions: User is logged in
Automation Candidate: Yes

---

## TC-LOGIN-002

Test Case ID: TC-LOGIN-002
Module: Login
Title: Negative username test
Priority: High
Preconditions: User is on the login page
Test Data: username=incorrectUser, password=Password123
Steps:
1. Open login page
2. Type incorrect username into Username field
3. Type valid password into Password field
4. Click Submit button
Expected Result: Error message displayed with text "Your username is invalid!"
Post Conditions: User remains on login page
Automation Candidate: Yes

---

## TC-LOGIN-003

Test Case ID: TC-LOGIN-003
Module: Login
Title: Negative password test
Priority: High
Preconditions: User is on the login page
Test Data: username=student, password=incorrectPassword
Steps:
1. Open login page
2. Type valid username into Username field
3. Type incorrect password into Password field
4. Click Submit button
Expected Result: Error message displayed with text "Your password is invalid!"
Post Conditions: User remains on login page
Automation Candidate: Yes

---

## TC-LOGIN-004

Test Case ID: TC-LOGIN-004
Module: Login
Title: Empty credentials validation
Priority: Medium
Preconditions: User is on the login page
Test Data: username=empty, password=empty
Steps:
1. Open login page
2. Leave Username field empty
3. Leave Password field empty
4. Click Submit button
Expected Result: Error message displayed; user remains on login page
Post Conditions: User is not logged in
Automation Candidate: Yes

---

## TC-LOGIN-005

Test Case ID: TC-LOGIN-005
Module: Login
Title: Login page UI elements validation
Priority: Medium
Preconditions: User navigates to login page
Test Data: N/A
Steps:
1. Open login page
2. Verify Username label/field is visible
3. Verify Password label/field is visible
4. Verify Submit button is visible and enabled
Expected Result: All login form elements are displayed correctly
Post Conditions: N/A
Automation Candidate: Yes

---

## TC-LOGIN-006

Test Case ID: TC-LOGIN-006
Module: Login
Title: Log out after successful login
Priority: Medium
Preconditions: User logged in successfully
Test Data: username=student, password=Password123
Steps:
1. Login with valid credentials
2. Click Log out button
Expected Result: User is redirected to login page
Post Conditions: User session ended
Automation Candidate: Yes
