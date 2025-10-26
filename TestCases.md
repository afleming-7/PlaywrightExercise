# Assignment 3 – Manual Test Cases

These test cases are **not covered** by the automated Playwright tests.  
They aim to ensure the correctness, usability, and stability of the web application.

---

## 🔹 1. Home Page (`/home`)

### UI & Navigation

| ID    | Test Case                                          | Steps                                  | Expected Result                                      |
| ----- | -------------------------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| HP-01 | Verify the Home page loads successfully            | Navigate to `/home`                    | Page loads without errors                            |
| HP-02 | Validate the company logo is visible and clickable | Observe logo in header, click it       | Logo visible, redirects to home                      |
| HP-03 | Verify top navigation links are displayed          | Inspect header                         | Links like “Login”, “Data Transfer” visible          |
| HP-04 | Verify footer links work                           | Scroll to footer and click any link    | Opens correct destination page                       |
| HP-05 | Check responsiveness                               | Resize browser to mobile/tablet widths | Layout adjusts correctly without overlapping content |

### Content & Performance

| ID    | Test Case                                  | Steps                                | Expected Result                                        |
| ----- | ------------------------------------------ | ------------------------------------ | ------------------------------------------------------ |
| HP-06 | Verify the page title and meta description | View browser tab title and HTML meta | Matches specification (e.g. “LBL Data Transfer”)       |
| HP-07 | Validate that all images load properly     | Observe all displayed images         | No broken image icons                                  |
| HP-08 | Check page loading time                    | Measure initial load                 | Page loads within acceptable performance limits (< 3s) |

---

## 🔹 2. Login Page (`/login`)

### Functional Tests

| ID    | Test Case                                         | Steps                                    | Expected Result                                  |
| ----- | ------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| LP-01 | Validate mandatory fields                         | Leave email or password blank and submit | Proper validation error shown                    |
| LP-02 | Verify invalid email format                       | Enter “user@invalid”                     | Shows “Invalid email format” error               |
| LP-03 | Check “Enter” key triggers login                  | Fill form and press Enter                | Login attempt triggered                          |
| LP-04 | Validate password masking                         | Type password                            | Characters hidden behind dots                    |
| LP-05 | Test case-insensitivity of email                  | Enter email in different case            | Login still succeeds                             |
| LP-06 | Check session persistence                         | Login, refresh page                      | User stays logged in                             |
| LP-07 | Validate logout functionality                     | Click logout button                      | User redirected to login screen, session cleared |
| LP-08 | Verify error handling for locked/disabled account | Try invalid or disabled account          | Proper error message displayed                   |

### Security Tests

| ID    | Test Case                               | Steps                         | Expected Result                          |
| ----- | --------------------------------------- | ----------------------------- | ---------------------------------------- |
| LP-09 | Verify password not visible in DOM      | Inspect page elements         | Password not exposed in plain text       |
| LP-10 | Check login over HTTPS                  | Observe network connection    | Only secure (HTTPS) connections used     |
| LP-11 | Test invalid credentials multiple times | Enter wrong password 3+ times | Account lockout or rate-limiting applied |

---

## 🔹 3. Data Transfer Page (`/data/datatransfer`)

### File Management

| ID    | Test Case                                 | Steps                                           | Expected Result                                            |
| ----- | ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| DT-01 | Verify folder structure loads             | Open “DropBox Customer 1 / Folder 1 → Opdracht” | Correct folders visible                                    |
| DT-02 | Verify file upload with no description    | Try uploading file without filling description  | Validation error appears                                   |
| DT-03 | Upload large file                         | Upload file >10MB                               | Upload should fail or show error message                   |
| DT-04 | Upload same file twice                    | Upload `File1.txt` twice                        | System prevents duplicates or overwrites with confirmation |
| DT-05 | Verify file names are displayed correctly | Upload file with long name                      | Name is truncated gracefully                               |
| DT-06 | Cancel upload mid-process                 | Start upload and cancel                         | Upload is aborted without saving                           |
| DT-07 | Verify file download integrity            | Download a file and compare with local copy     | File content matches original                              |
| DT-08 | Delete non-existent file                  | Try deleting already removed file               | Error handled gracefully                                   |

### UI & Accessibility

| ID    | Test Case                                | Steps                               | Expected Result                                |
| ----- | ---------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| DT-09 | Verify buttons have accessible labels    | Inspect via accessibility tree      | All buttons labeled correctly                  |
| DT-10 | Keyboard navigation                      | Use only Tab/Enter keys to navigate | All actions possible without mouse             |
| DT-11 | Verify progress indicators during upload | Start upload                        | Progress bar or spinner appears until complete |

---

## ✅ Notes

- All pages should be tested on **multiple browsers** (Chrome, Edge, Firefox).
- Cross-check UI alignment and language localization (if supported).
- Ensure proper **error messages** and **logging** for all failed operations.
