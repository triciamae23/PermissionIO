# Automation Tests for Login and Form Submission

This repository contains Playwright-based automated tests for testing the login and form submission functionalities of the [search.permission.io](http://search.permission.io) application. It includes tests for valid and invalid scenarios, as well as handling ReCaptcha challenges.

## Prerequisites

Before running the tests, ensure the following are set up:

1. **Node.js**: Install Node.js (v16 or above).
2. **Playwright**: Install Playwright by running:
   ``bash
   npm install @playwright/test
   ``
3. **Environment Variables**: Create a `.env` file in the root directory and set the following variables:
   ``env
   EMAIL=your_valid_email
   PASSWORD=your_valid_password
   WRONGEMAIL=your_invalid_email
   WRONGPASSWORD=your_invalid_password
   TWOCAPTCHA_API_KEY=your_2captcha_api_key
   ``

## Directory Structure

``
.
.github/
node_modules/
playwright-report/
test-results/
tests/
├── formSubmission.js
├── login.test.js
tests-examples/
utils/
    └── recaptchaHandler.js
.gitignore
package-lock.json
package.json
playwright.config.js
process.env
README.md

``

### Key Files

#### 1. **tests/formSubmission.test.js**

Tests for validating the form submission process.

- **Scenarios Covered:**
  - Login button is disabled if only the password or email is filled.
  - Error message appears if ReCaptcha is skipped.
  - Successful form submission navigates to the dashboard and allows logout.

#### 2. **tests/login.test.js**

Tests for the login functionality.

- **Scenarios Covered:**
  - Valid login.
  - Invalid login.
  - Account lockout after multiple failed attempts.
  - Forgot password flow after account lockout.

#### 3. **utils/recaptchaHandler.js**

Handles ReCaptcha automation using the 2Captcha service. Falls back to manual solving if the API key is invalid or the account has insufficient balance.

## Running the Tests

1. **Install Dependencies**:
   ``bash
   npm install
   ``
2. **Run Tests**:
   ``bash
   npx playwright test
   ``
   - To run a specific test file:
     ``bash
     npx playwright test tests/<file_name>.test.js
     ``
   - For a specific test:
     ``bash
     npx playwright test --grep "<test name>"
     ``

## Configuration

- Modify `playwright.config.js` to set test timeouts, browser configurations, or base URLs as needed.

## Test Output

After running tests, a summary will be displayed in the terminal. For detailed reports, refer to the `playwright-report` directory generated post-test execution.

## Error Handling

- If ReCaptcha handling fails, the fallback mechanism allows for manual solving.
- Ensure that the `TWOCAPTCHA_API_KEY` is valid to avoid manual intervention.

## Troubleshooting

1. **Timeout Issues**:

   - Increase the timeout value in `playwright.config.js` or specific test cases using `test.setTimeout()`.

2. **ReCaptcha Failures**:

   - Verify your 2Captcha API key and account balance.

3. **Environment Variables Not Loaded**:

   - Confirm `.env` file exists in the root directory and all variables are correctly set.

## Contributing

Contributions are welcome! Feel free to raise issues or submit pull requests.
