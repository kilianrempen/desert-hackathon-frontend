# Express and PostgresSQL Spin Up
This is a skeleton repository to help you add Express to your capstone.  Copy the files below into your capstone.

## Set Up
**The following files are required to add Express Prostgres and Redis to an existing application**
1. `.gitignore`
    * Updated .gitignore file for the project.
2. `project.env`
    * env file based off `/example.env`
    * Catastrophic failure if `/project.env` is pushed to github, get immediate instructor help.
3. `docker-compose.yml`
    * Orchestration file for docker containers.
3. `docker-compose.override.yml`
    * Override file for docker-compose. This file is used to override the default settings in `docker-compose.yml` for development purposes.
    * This file is not used in production.
4. `.dockerignore`
    * An ignore file for Docker. (Almost the same syntax as git ignore)
5. `backend/src/apis/index.controller.ts`
    * This file initiates a generic API controller that returns a string message when hit
6. `/backend/src/apis/index.route.ts`
    * This file initiates a generic API route to test the controller in index.controller
7. `backend/src/App.ts`
    * This file sets up the server to run on the provided port (4200 as set in index.ts) or defaults to 4200. It also sets up routing and the middleware for handling JSON responses.
8. `backend/src/utils/database.utils.ts`
    * This file sets up database connections.
9. `backend/src/utils/response.utils.ts`
    *  file that contains helper functions for formatting responses.
9. `backend/src/utils/auth.utils.ts`
    *  file that contains helper functions for authentication.
9. `backend/src/utils/interfaces/Status.ts`
    *  Interface for ddc-fullstack response objects
10. `backend/src/index.ts`
    * This file instantiates the app. This is the entry point of the application.
12. `backend/package.json`
    * package.json for the backend code base.
13. `backend/tsconfig.json`
    * Configuration file for Typescript.
13. `backend/resolve-extensions-loader.mjs`
    * This file is used to resolve the extensions for Typescript files so that file extensions dont have to be included in import statements.
14. `backend/Dockerfile`
    * File to create a custom node/express image.
15. `backend/README.md`
    * This file is a readme for the backend code base.
15. `documentation`
    * existing documentation directory from planning and data design sprint.
16. `sql/Dockerfile`
    * File to create a custom mysql image.
17. `sql/project.sql`
    * This file should be named after **your project**
    * File containing create table statements to initialize the database.

## Running the  Project For the First Time
1. create a project.env at `/project.env` based off `/example.env`
    * Catastrophic failure if `/project.env` is pushed to github, get immediate instructor help.
    * make sure to update the environment variables in `/project.env` to match your project
1. `cd` into `/backend`
2. Run `npm i`
    * This creates `/backend/package-lock.json` Which is necessary to start docker
3. create a deployment on your digital ocean droplet
4. preform a mass upload of the files in this repository to your droplet
5. ssh into your droplet and `cd` into the directory where you uploaded the project
6. Run `docker compose up -d` to start the application

## Running the Project After the First Time
1. ssh into your droplet and `cd` into the directory where you uploaded the project
2. Run `docker compose up -d` to start the application

## gaining access to development logs
1. ssh into your droplet and `cd` into the directory where you uploaded the project
2. Run `docker compose logs -f` to access console logs from the application

## Stopping the Project
1. ssh into your droplet and `cd` into the directory where you uploaded the project
2. Run `docker compose down` to stop the application



## Calling API (In Postman or Insomnia)
The routes are formed as follows:
http://`[ipaddress]`:`[port]`/api /`[entity]`/`[how we want to get it]`/`[param?]`