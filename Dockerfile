# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    cmake g++ git make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN mkdir -p build && cd build \
    && cmake .. -DCMAKE_BUILD_TYPE=Release \
    && cmake --build . --config Release -j$(nproc)

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM ubuntu:22.04

WORKDIR /app

# Copy compiled binary
COPY --from=builder /app/build/ADSVisualization ./ADSVisualization

# Copy static files (HTML, CSS, JS)
COPY --from=builder /app/build/static ./static

EXPOSE 8080

CMD ["./ADSVisualization"]
