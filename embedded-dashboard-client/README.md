# embedded-dashboard-client

## Steps to integrate Last9 Embedded Dashboard in your web application

### 1. Goto client application directory

`cd embedded-dashboard-client`

### 2. In index.html, update the request data to generate token with appropriate values

`dashboard_id`: UUID of the Last9 dashboard

`datasource_id`: UUID of the data source

`variables`: Values of variables to be replaced in promQL.

### 3. In index.html, update the parameters passed to initialize

`containerId`: id of the container element in which embedded dashboard should be rendered

`org`: name of the org

`getToken`: A callback function to fetch the token from API

`onError`: An error callback function to handle errors thrown from embedded dashboard

### 4. Install web server

`npm install -g http-server`

### 5. Run the local web server

`http-server . -a localhost -p 8081 --cors`

### 6. App can be accessed via URL

http://localhost:8081
