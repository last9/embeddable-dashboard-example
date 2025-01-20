### How to run

1. Update `config.json` with POST refresh token from alpha last9.
2. Run `go build`. This will build the go binary.
3. Run `./backend-app`.
4. Run the following cURL:
```
curl -X POST http://localhost:8080/embed-token \
-H "Content-Type: application/json" \
-d @request.json
```

This should call alpha last9 and return an embeddable access token.