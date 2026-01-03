HR Management Web App
A complete Human Resource Management System built with Node.js, Express, and MongoDB for managing employee information, attendance, leave, and payroll.

Features
Employee Management - Add, edit, and view employee profiles

Attendance Tracking - Daily check-in/check-out system

Leave Management - Apply and approve leave requests

Dashboard - Overview for employees and admins

Authentication - Secure login with role-based access

Document Management - Store employee documents securely

Quick Start
1. Clone the Repository
text
git clone <your-repo-url>
cd hr-management-web-app
2. Install Dependencies
text
npm install
3. Setup Environment Variables
Create a .env file in the root directory:

text
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hr_management
JWT_SECRET=your_secret_key_here
NODE_ENV=development
4. Start the Application
text
# Development mode
npm run dev

# Production mode
npm start
5. Access the Application
Open your browser and go to: http://localhost:3000

Project Structure
text
hr-management-web-app/
├── app/                 # Application entry point
├── controllers/         # Route controllers
├── models/             # MongoDB schemas
├── views/              # EJS templates
├── routes/             # API routes
├── middleware/         # Custom middleware
├── public/             # Static assets
├── lib/                # Utility functions
└── .env                # Environment variables
Default Login Credentials
Admin User:

Email: admin@company.com

Password: admin123

Employee User:

Email: employee@company.com

Password: employee123

Database Models
Employee Model
Personal Information (Name, DOB, Address, etc.)

Job Details (Position, Department, Manager, etc.)

Salary Structure (Basic, HRA, Allowances, Deductions)

Documents (Aadhar, PAN, Bank Passbook)

User Model
Authentication credentials

Role (Admin/Employee)

Profile information

Attendance Model
Check-in/Check-out timestamps

Attendance status

Date tracking

Leave Model
Leave applications

Approval workflow

Leave history

Deployment
Deploy to Heroku
text
# 1. Create Heroku app
heroku create hr-management-app

# 2. Add MongoDB (MongoDB Atlas)
heroku addons:create mongolab

# 3. Set environment variables
heroku config:set JWT_SECRET=your_production_secret

# 4. Deploy
git push heroku main
Deploy to Railway/Render
Connect your GitHub repository

Add MongoDB connection string

Set environment variables

Deploy automatically

API Endpoints
Method	Endpoint	Description	Auth Required
GET	/	Home page	No
GET	/login	Login page	No
POST	/auth/login	Authenticate user	No
GET	/dashboard	User dashboard	Yes
GET	/employees	List all employees	Yes (Admin)
POST	/employees	Create employee	Yes (Admin)
GET	/attendance	View attendance	Yes
POST	/attendance/checkin	Check in	Yes (Employee)
GET	/leave	View leave requests	Yes
POST	/leave/apply	Apply for leave	Yes (Employee)
Security Features
Password hashing with bcrypt

JWT token authentication

Session management

Input validation

XSS protection

CSRF protection

Rate limiting

Technologies Used
Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Authentication: JWT, bcrypt

Template Engine: EJS

Styling: CSS, Tailwind CSS

File Upload: Multer

Deployment: Ready for Heroku/Railway/Render

Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

License
This project is licensed under the MIT License.

Support
For support, email support@hrmanagement.com or open an issue in the GitHub repository.