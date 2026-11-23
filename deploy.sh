#!/bin/bash

source .env

# Stelle sicher, dass Umgebungsvariablen gesetzt sind
if [ -z "$DEPLOY_SERVER_PATH" ]; then
  echo "Fehler: DEPLOY_SERVER_PATH ist nicht gesetzt"
  exit 1
fi

# Server und Pfad aufteilen (Format: user@server:/pfad)
SERVER_PART=$(echo $DEPLOY_SERVER_PATH | cut -d':' -f1)
PATH_PART=$(echo $DEPLOY_SERVER_PATH | cut -d':' -f2)

echo "Erstelle Verzeichnisstruktur auf dem Server..."
# Erstellt die benötigten Verzeichnisse, falls sie noch nicht existieren
ssh $SERVER_PART "mkdir -p $PATH_PART/build"

echo "Kopiere Build-Dateien auf den Server..."
# --delete entfernt Dateien vom Server, die es im aktuellen Build nicht mehr gibt
# (sonst sammeln sich alte Chunks an)
rsync -a --delete ./build/ "$DEPLOY_SERVER_PATH/build/"

# Using global compose on the server
# echo "Kopiere Docker-Konfigurationsdateien..."
scp Dockerfile $DEPLOY_SERVER_PATH

echo "Starte Container neu..."
# --pull fetches the current node:26-alpine instead of reusing an old cached base image.
# Building before the restart keeps the old container running if the build fails.
ssh $SERVER_PART "cd ./docker && docker compose build --pull pk-box-manager && docker compose up -d pk-box-manager"

echo "Deployment abgeschlossen!"