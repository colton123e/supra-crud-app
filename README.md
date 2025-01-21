# supra-crud-app

## Technology Stack

---

- **Front-End**: React
- **Back-End** Express.js
- **Database** SQLite
- **Communication** RESTful APIs

## Automatic Startup - Dev (Local)

---

Start by cloning the git reop with `git clone`

To start the app automatically in a dev environment, run the `run.sh` script using either of the following commands:

`./run.sh`
or
`bash run.sh`

This script executes the manual startup steps (outlined below) and runs `node server.js`
and `npm run dev` in the background.

One line command:
`git clone https://github.com/colton123e/supra-crud-app.git; cd supra-crud-app; bash run.sh`

## Manual Startup - Dev (Local)

---

1. Navigate to both the **client** and **server** directories and run:
   `npm install`

2. Start the back-end by running:
   `node server.js`

3. Start the front-end by running:
   `npm run dev`
   (in the **client** folder).

## Deployment Startup

To deploy the app on a webserver with nginx:
Edit the `deploy.sh` script to add your domain and email at the top.
Then run the `deploy.sh` script with `bash deploy.sh`
One line command to get to `deploy.sh` edit:
`git clone https://github.com/colton123e/supra-crud-app.git; cd supra-crud-app; nano deploy.sh`

## Server ENV Configuration

---

The `.env` file is automatically generated when starting the server but
there are currently 2 options configurable in a `.env` file located in the **server** folder:

**JWT_SECRET=** Should be a long random string, it is recommended to leave this blank and let the
script automatically generate a value.

**API_BASE_URL=** Should be in the format "http://{hostname or IP}:{PORT}
The API_BASE_URL will be automatically generated on server startup based on the detected hostname.
If using WSL, it may be necessary to manually set the hostname to `localhost` or the IP address from
`ip addr show eth0` command.

## Features

---

- Basic Create, Read, Update, and Delete (CRUD) operations
- SQLite database integration

## Additional Notes

---

- Docker elements are included in the repository. However, deploying the app via Docker
  in its current configuration does not work for deployment on external servers.
