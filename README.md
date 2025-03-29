Crime Mapping Application - Shadow Watch Program
Overview
This application is an interactive crime mapping tool that allows users to:

View reported crimes on a Google Map

Search and filter existing crime reports

Submit new crime reports with location details

View detailed information about specific crimes

Prerequisites
Before running the application, ensure you have the following installed:

Node.js (v14 or higher)

npm (v6 or higher) or yarn

Google Maps API key (see setup instructions below)

Setup Instructions
1. Get a Google Maps API Key
Go to the Google Cloud Console

Create a new project or select an existing one

Enable the "Maps JavaScript API" for your project

Create an API key in the "Credentials" section

Restrict the key to your domain if deploying publicly

2. Configure the Application
Clone this repository:

bash
Copy
git clone https://github.com/your-repository/crime-map-app.git
cd crime-map-app
Install dependencies:

bash
Copy
npm install
# or
yarn install
Create a .env file in the root directory and add your Google Maps API key:

env
Copy
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
Add your crime data to src/crimes.json (sample format included)

Running the Application

Development Mode

To run the application in development mode:

bash
Copy
npm start
# or
yarn start
This will start the development server and open the app in your default browser at http://localhost:3000.

Production Build

To create an optimized production build:

bash
Copy
npm run build
# or
yarn build
This will create a build folder with the production-ready files.

Features
Interactive Map: View all reported crimes on a dark-themed Google Map

Crime Reporting: Submit new crime reports with type, details, and location

Location Selection: Click on the map to select crime locations

Search Functionality: Filter crimes by type, date, or ID

Responsive Design: Works on desktop and mobile devices

File Structure

Copy
crime-map-app/
├── public/               # Static files
├── src/
│   ├── App.css           # Main styles
│   ├── App.js            # Main application component
│   ├── crimes.json       # Crime data
│   └── index.js          # Application entry point
├── .env                  # Environment variables
├── package.json          # Project dependencies
└── README.md             # This file

Troubleshooting

Map not loading: Verify your API key is correct and the Maps JavaScript API is enabled

Missing crime data: Ensure crimes.json exists in the src folder with valid data

Form submission issues: Check browser console for errors
