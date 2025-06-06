# embeddable-dashboard-example

## Overview

This repository demonstrates how to securely embed a Last9 dashboard in your web
application. It includes:

- **embedded-dashboard-client**: Sample HTML/JS client for embedding the
  dashboard.
- **embedded-dashboard-client-react**: React app example for embedding the
  dashboard.
- **embedded-dashboard-token-server**: Go server to securely generate embed
  tokens for the dashboard.

---

## 1. Prerequisites

- Access to your Last9 dashboard and data source UUIDs.
- **API Refresh Token**: Obtain your API refresh token from the
  [API Access page](https://app.last9.io/settings/api-access) on Last9. Use the
  **read refresh token** for embedding dashboards.  
  _Reference:
  [https://app.last9.io/settings/api-access](https://app.last9.io/settings/api-access)_
- **Dashboard ID**: You can find your dashboard ID in the dashboard URL. It is
  the part after `/dashboards/` and before the `?` (query parameters). For
  example, in the URL:

  `https://app.last9.io/v2/organizations/{org}/dashboards/{dashboard_id}?cluster=...`

  The dashboard ID is `{dashboard_id}`.

  \_Reference:
  [Dashboard URL Example](https://app.last9.io/v2/organizations/{org}/dashboards/{dashboard_id}?cluster=...)

- Node.js (for running the client or React app).
- Go (for running the token server).

---

## 2. Setting Up the Token Server

The token server securely generates short-lived tokens for embedding the
dashboard.

### a. Configure the server

Edit `embedded-dashboard-token-server/config.json`:

```json
{
  "org": "your-org-name",
  "refresh_token": "your-last9-read-refresh-token"
}
```

- The `refresh_token` should be the **read refresh token** from your
  [API Access page](https://app.last9.io/settings/api-access).

### b. Build and run the server

```sh
cd embedded-dashboard-token-server
go build
./embedded-dashboard-token-server
```

The server will listen on `http://localhost:8080`.

### c. Test the server

Edit `request.json` with your dashboard and datasource IDs:

```json
{
  "dashboard_id": "your-dashboard-uuid",
  "datasource_id": "your-datasource-uuid",
  "variables": {
    "service": ["your-service"],
    "latency": [0.5]
  }
}
```

- The `dashboard_id` can be copied from your dashboard URL as described above.

Test with:

```sh
curl -X POST http://localhost:8080/embed-token \
  -H "Content-Type: application/json" \
  -d @request.json
```

You should receive a JSON response with an access token.

---

## 3. Embedding in a Plain HTML/JS App

### a. Configure the client

Edit `embedded-dashboard-client/index.html`:

- Set your `dashboard_id`, `datasource_id`, and `variables` in the `getToken`
  function's `data` object.
- Set your org name in the `initialize` call.

### b. Serve the client

```sh
cd embedded-dashboard-client
npm install -g http-server
http-server . -a localhost -p 8081 --cors
```

Visit [http://localhost:8081](http://localhost:8081) in your browser.

---

## 4. Embedding in a React App

### a. Configure the React client

Edit `embedded-dashboard-client-react/src/EmbeddedDashboardApp.tsx`:

- Set your `dashboard_id`, `datasource_id`, and `variables` in the
  `accessTokenReqData` object.
- Set your org name in the `initialize` call.

### b. Run the React app

```sh
cd embedded-dashboard-client-react
yarn install
yarn start
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 5. Production Deployment

- **Token Server**: Deploy the Go token server to a secure backend (do not
  expose your refresh token to the client).
- **Client**: Deploy your HTML/JS or React app as you would any web application.
- **CORS**: Ensure your token server allows requests from your production
  domain.

---

## 6. Sequence Diagram

See `sequence-diagram.png` in the root for a visual overview of the embedding
flow.

---

## 7. Example Files

- `embedded-dashboard-token-server/request.json`: Example request for token
  generation.
- `embedded-dashboard-client/index.html`: Example HTML/JS integration.
- `embedded-dashboard-client-react/src/EmbeddedDashboardApp.tsx`: Example React
  integration.

---

## 8. Quick Reference: Steps

1. **Configure and run the token server** with your org and refresh token.
2. **Edit the client** (HTML or React) to use your dashboard/datasource IDs and
   org.
3. **Serve the client** (locally or in production).
4. **Ensure the client fetches tokens from your backend** (never expose your
   refresh token to the browser).

---

For more details, see the README files in each subdirectory.
