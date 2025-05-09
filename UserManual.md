
# User Manual

## Table of Contents
1. [Installation Instructions](#installation-instructions)
2. [System Usage Guide](#system-usage-guide)
3. [Troubleshooting](#troubleshooting)
4. [FAQs](#faqs)

## Installation Instructions

### System Requirements
- Node.js 16.x or higher
- NPM 8.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup Steps
1. Clone the repository to your local machine
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Supabase connection
   - Ensure your Supabase project ID and anon key are properly set in the application
   - The connection is pre-configured in `src/integrations/supabase/client.ts`

4. Start the development server
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000` in your web browser

### Production Deployment
1. Build the application
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` folder to your web server

## System Usage Guide

### Authentication
1. **Sign Up**: Create a new account using email and password
2. **Sign In**: Log in with your credentials
3. **Access Control**: Features are restricted based on user roles (Admin, Editor, Viewer)

### Managing Departments
1. Navigate to the Departments section
2. View existing departments in the table display
3. **Add Department**: 
   - Click "Add New Department" 
   - Enter department code and name
   - Submit the form
4. **Edit Department**: 
   - Click the edit icon next to a department
   - Modify department information
   - Save changes
5. **Delete Department**: 
   - Click the delete icon next to a department
   - Confirm deletion in the dialog

### Managing Jobs
1. Navigate to the Jobs section
2. View existing jobs in the table display
3. **Add Job**: 
   - Click "Add New Job" 
   - Enter job code and description
   - Submit the form
4. **Edit Job**: 
   - Click the edit icon next to a job
   - Modify job information
   - Save changes
5. **Delete Job**: 
   - Click the delete icon next to a job
   - Confirm deletion in the dialog

### Managing Employees
1. Navigate to the Employees section
2. View existing employees in the table display
3. **Add Employee**: 
   - Click "Add New Employee" 
   - Fill in employee details
   - Submit the form
4. **Edit Employee**: 
   - Click the edit icon next to an employee
   - Modify employee information
   - Save changes
5. **Delete Employee**: 
   - Click the delete icon next to an employee
   - Confirm deletion in the dialog

### Managing Job History
1. Access job history records from:
   - The dedicated Job History section
   - The "View Employees" button in Departments or Jobs sections
2. **Add Job History Entry**: 
   - Click "Add New Job History" 
   - Select employee, job, department and other details
   - Submit the form
3. **Edit Job History Entry**: 
   - Click the edit icon next to a job history entry
   - Modify job history information
   - Save changes
4. **Delete Job History Entry**: 
   - Click the delete icon next to a job history entry
   - Confirm deletion in the dialog

### Data Viewing Modes
- **Standard Mode**: Full access to add, edit, and delete records (for authorized users)
- **Read-Only Mode**: View-only access to records without edit capabilities

## Troubleshooting

### Common Issues and Solutions

#### Application Not Loading
- **Issue**: Blank screen or loading errors
- **Solution**: 
  - Check internet connection
  - Clear browser cache and cookies
  - Ensure you're using a supported browser
  - Check browser console for specific errors

#### Authentication Problems
- **Issue**: Unable to log in
- **Solution**:
  - Verify email and password
  - Reset password if forgotten
  - Check if your account is active
  - Contact administrator if access is denied

#### Data Not Displaying
- **Issue**: Tables show "No data found" or loading indefinitely
- **Solution**:
  - Check network connection
  - Verify you have proper permissions
  - Refresh the page
  - Log out and log back in

#### Changes Not Saving
- **Issue**: Edits to records not persisting
- **Solution**:
  - Check for validation errors in the form
  - Ensure you have edit permissions
  - Verify network connection
  - Try refreshing and making changes again

#### Form Submission Errors
- **Issue**: Unable to submit forms
- **Solution**:
  - Look for validation messages on the form
  - Ensure all required fields are filled
  - Check for format errors in specialized fields (dates, numbers)

### Error Messages

| Error Message | Potential Cause | Solution |
|---------------|-----------------|----------|
| "Network Error" | Connection issues | Check internet connectivity |
| "Unauthorized" | Invalid credentials/permissions | Verify login or request access |
| "Invalid Input" | Form validation failure | Check form fields for errors |
| "Duplicate Entry" | Record with same key exists | Use different key values |
| "Server Error" | Backend processing issue | Try again later or contact support |

## FAQs

### General Questions

**Q: How do I reset my password?**  
A: Use the "Forgot Password" link on the login page to receive password reset instructions via email.

**Q: Can I use this system on mobile devices?**  
A: Yes, the interface is responsive and works on modern mobile browsers, though desktop provides the best experience.

**Q: How secure is my data?**  
A: The system uses secure authentication and database access controls. All communications are encrypted.

### Data Management

**Q: Can I export data to Excel or CSV?**  
A: Currently, data export functionality is not available in the application.

**Q: What happens if I delete a department or job?**  
A: Deleting these records might affect related job history entries. Consider updating instead of deleting.

**Q: Is there a limit to how many records I can create?**  
A: There are no hard limits within the application, but system performance may be affected by very large datasets.

### User Access

**Q: How do I get additional permissions?**  
A: Contact your system administrator to request role changes or additional access.

**Q: Can multiple users edit data simultaneously?**  
A: Yes, the system supports concurrent users, but be aware of potential conflicts when editing the same records.

**Q: How do I add new users to the system?**  
A: User management is handled by administrators through the User Management section.

### Technical Support

**Q: Who do I contact for technical issues?**  
A: Contact your system administrator or IT support team for assistance.

**Q: Is there an API available for integration with other systems?**  
A: The system is built on Supabase which provides API access. Contact your administrator for integration options.

**Q: How often is the system updated?**  
A: Updates are deployed periodically to add features and fix issues. Users will be notified of significant updates.
