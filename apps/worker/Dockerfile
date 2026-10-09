# ── builder ──────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /template-slim/apps/worker

COPY apps/worker/go.mod apps/worker/go.sum ./
RUN go mod download

COPY apps/worker/ ./

RUN CGO_ENABLED=0 go build -trimpath -o /worker ./...

# ── runtime ──────────────────────────────────────────────────────────────
FROM alpine:3.21 AS worker

RUN apk add --no-cache curl

WORKDIR /template-slim

COPY --from=builder /worker ./worker

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK CMD [ "curl", "-f", "http://localhost:8080/health" ]

ENTRYPOINT ["./worker"]
