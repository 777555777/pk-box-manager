# Dockerfile
FROM denoland/deno:alpine

# curl hinzufügen
RUN apk add --no-cache curl

WORKDIR /app

# Kopiere die Build-Dateien
COPY build/ ./build/

# Explizit Deno-Module cachen
RUN deno cache build/index.js

# Ports freigeben
EXPOSE 3000

# Starte die App
CMD ["deno", "run", "--allow-env", "--allow-read", "--allow-net", "build/index.js"]