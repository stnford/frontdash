
  # FrontDash startup instructions

  Make sure you have node installed from [nodejs.org](https://nodejs.org/en) first.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  Then you should be good to go :)

  ## Quick start commands
  - Backend (terminal 1):
    - `cd backend`
    - `./mvnw spring-boot:run`
  - Frontend (terminal 2):
    - Copy `.env.local.example` to `.env.local` (already set to http://localhost:8080)
    - `npm install` (first time)
    - `npm run dev` (if you hit EPERM binding the port, rerun with `sudo npm run dev -- --host 127.0.0.1 --port 5173`)

  ## Demo logins (after loading Demo2/import_testdata.sql)

  - Admin/Staff (all use password `pw`):
    - richard01
    - cox02
    - deckon03
    - cox04
    - mullard05
  - Restaurant owners (password `pw`):
    - owner_chicken
    - owner_pizza
    - owner_burger

  ## To edit code

  Make sure you have react dependencies installed.
  
  Run `npm install react react-dom` to add React and ReactDOM as dependencies
  Run `npm install -D @types/react @types/react-dom` to install type definitions.

  # note:

  Be sure to check the README.md file in the db folder when working with backend
  # FrontDashFinal
