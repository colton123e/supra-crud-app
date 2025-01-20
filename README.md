# supra-crud-app

## Technology Stack

---

- **Front-End**: React
- **Back-End** Express.js
- **Database** SQLite
- **Communication** RESTful APIs

## Automatic Startup

---

To start the app automatically, run the `run.sh` script using either of the following commands:

`./run.sh`
or
`bash run.sh`

This script executes the manual startup steps (outlined below) and runs `node server.js`
and `npm run dev` in the background.

## Manual Startup

---

1. Navigate to both the **client** and **server** directories and run:
   `npm install`

2. Start the back-end by running:
   `node server.js`

3. Start the front-end by running:
   `npm run dev`
   (in the **client** folder).

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
- A deploy script is included to facilitate app deployment on other servers, but it is also
  currently non-functional.
- Both issues are related to networking configuration problems and are not a reflection of the
  application itself. These features were added for personal education and experimentation.
