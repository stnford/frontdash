How to connect Docker and mySQL workbench

- Install Docker Desktop: https://www.docker.com/get-started
- cd into db
- start database: docker compose up (do sudo if needed)

- use mySQL workbench and establish connection with credentials found in compose.yml

- if not using mySQL workbench:
    - docker exec -it frontdash_db mysql -u frontdash_user -p frontdash
