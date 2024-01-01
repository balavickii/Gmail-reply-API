# Send Reply Using Gmail API



## Prerequisites

Before running the script, make sure you have the following:

- **Node.js:** Install Node.js from [https://nodejs.org/](https://nodejs.org/)

- **Google API Credentials:**
  - Create a project on the [Google Cloud Console](https://console.developers.google.com/).
  - Enable the Gmail API for your project.
  - Create OAuth 2.0 credentials and download the client secret JSON file.
  - Obtain the refresh token using the OAuth 2.0 Playground or another method.

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/send-reply-using-gmail-api.git
   cd send-reply-using-gmail-api

   
  1. **Install dependencies**
     ```bash
       npm install


**Areas to be improved**

   1.User-specific configuration: Making the code more flexible by allowing users to provide their own
     configuration options, such as email    filters or customized reply messages.
     These are some areas where the code can be improved, but overall, it provides implementation of
     auto-reply functionality using the Gmail API.

   2.Time Monitoring: The code currently use randominterval function to generate seconds and in this code can be improved by adding cron jobs package to schedule 
    email tasks


