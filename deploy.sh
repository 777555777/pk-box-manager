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
# -r für rekursives Kopieren
scp -r ./build/* $DEPLOY_SERVER_PATH/build/

# Using global compose on the server
# echo "Kopiere Docker-Konfigurationsdateien..."
scp Dockerfile $DEPLOY_SERVER_PATH

echo "Starte Container neu..."
ssh $SERVER_PART "cd ./docker && docker compose down pk-box-manager && docker compose up pk-box-manager -d"

echo "Deployment abgeschlossen!"