How to connect Docker and mySQL workbench

- Install Docker Desktop: https://www.docker.com/get-started
    - note for linux: make sure to be in same file as deb when installing
- Install mySQL Workbench: https://www.mysql.com/products/workbench/
    - note for linux: make sure to be in same file as deb when doing command: sudo apt install ./filename.deb

- cd into db
- start database: docker compose up (do sudo if needed)

- use mySQL workbench and establish connection with credentials found in compose.yml
    - click the plus button to create a new connection
    - you can name the connection name however you like, I did "front-dash-container"
    - if you want you can rename hostname: to localhost
    - the port associated with that should be 3306 (mine was that at default)
    - enter in the username and password to match the ones found in compose.yml file
        - for password, you can just push "Store in Keychain..." and enter the password

- if not using mySQL workbench:
    - docker exec -it frontdash_db mysql -u frontdash_user -p frontdash
