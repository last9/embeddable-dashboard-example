### How to run

1. Update `config.json` with POST refresh token from `app.last9.io` and your organization name.
2. Run `go build`. This will build the go binary.
3. Run `./embedded-dashboard-token-server`.
4. Run the following cURL:

```
curl -X POST http://localhost:8080/embed-token \
-H "Content-Type: application/json" \
-d @request.json
```

This should call app.last9.io and return an embedded access token.
