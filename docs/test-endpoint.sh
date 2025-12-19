#!/bin/bash

# Script de test pour l'endpoint API universel
# Usage: ./test-endpoint.sh [test_name]

ENDPOINT_URL="https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize"
RAPPORT_ID="1763649940640x234834439216168540"
USER_ID="user_antoine_123"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Test de l'Endpoint API Universel${NC}"
echo "================================================"
echo ""

# Test 1: Créer un signalement
test_create_signalement() {
    echo -e "${GREEN}Test 1: Créer un signalement${NC}"
    curl -X POST "$ENDPOINT_URL" \
      -H 'Content-Type: application/json' \
      -d '{
      "rapportId": "'$RAPPORT_ID'",
      "version": "test",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "userId": "'$USER_ID'",
      "actions": [
        {
          "actionType": "CREATE_SIGNALEMENT",
          "data": {
            "piece": "Salon",
            "probleme": "Tache sur le canapé",
            "commentaire": "Grande tache marron sur le coussin gauche",
            "photoUrl": "https://eb0bcaf95c312d7fe9372017cb5f1835.cdn.bubble.io/f1763650088185x167971974653885470/File.jpg",
            "photoBase64": null
          }
        }
      ]
    }'
    echo -e "\n"
}

# Test 2: Créer une consigne IA
test_create_consigne() {
    echo -e "${GREEN}Test 2: Créer une consigne IA${NC}"
    curl -X POST "$ENDPOINT_URL" \
      -H 'Content-Type: application/json' \
      -d '{
      "rapportId": "'$RAPPORT_ID'",
      "version": "test",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "userId": "'$USER_ID'",
      "actions": [
        {
          "actionType": "CREATE_CONSIGNE_IA",
          "data": {
            "piece": "Cuisine",
            "probleme": "Évier sale",
            "consigne": "Toujours vérifier la propreté de l évier avant de valider",
            "type": "surveiller"
          }
        }
      ]
    }'
    echo -e "\n"
}

# Test 3: Marquer comme faux positif
test_mark_false_positive() {
    echo -e "${GREEN}Test 3: Marquer comme faux positif${NC}"
    curl -X POST "$ENDPOINT_URL" \
      -H 'Content-Type: application/json' \
      -d '{
      "rapportId": "'$RAPPORT_ID'",
      "version": "test",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "userId": "'$USER_ID'",
      "actions": [
        {
          "actionType": "MARK_FALSE_POSITIVE",
          "data": {
            "piece": "Salon",
            "probleme": "Coussin déplacé"
          }
        }
      ]
    }'
    echo -e "\n"
}

# Test 4: Actions multiples
test_multiple_actions() {
    echo -e "${GREEN}Test 4: Actions multiples (batch)${NC}"
    curl -X POST "$ENDPOINT_URL" \
      -H 'Content-Type: application/json' \
      -d '{
      "rapportId": "'$RAPPORT_ID'",
      "version": "test",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "userId": "'$USER_ID'",
      "actions": [
        {
          "actionType": "CREATE_SIGNALEMENT",
          "data": {
            "piece": "Salon",
            "probleme": "Test signalement 1",
            "commentaire": "Test batch",
            "photoUrl": null,
            "photoBase64": null
          }
        },
        {
          "actionType": "CREATE_CONSIGNE_IA",
          "data": {
            "piece": "Cuisine",
            "probleme": null,
            "consigne": "Test consigne batch",
            "type": "ignorer"
          }
        },
        {
          "actionType": "MARK_FALSE_POSITIVE",
          "data": {
            "piece": "Chambre",
            "probleme": "Test faux positif"
          }
        }
      ]
    }'
    echo -e "\n"
}

# Test 5: Sélectionner photo de référence
test_select_photo() {
    echo -e "${GREEN}Test 5: Sélectionner photo de référence${NC}"
    curl -X POST "$ENDPOINT_URL" \
      -H 'Content-Type: application/json' \
      -d '{
      "rapportId": "'$RAPPORT_ID'",
      "version": "test",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "userId": "'$USER_ID'",
      "actions": [
        {
          "actionType": "SELECT_PHOTO_REFERENCE",
          "data": {
            "pieceId": "piece_salon",
            "photoId": "photo_456"
          }
        }
      ]
    }'
    echo -e "\n"
}

# Exécuter les tests
case "$1" in
    "signalement")
        test_create_signalement
        ;;
    "consigne")
        test_create_consigne
        ;;
    "faux")
        test_mark_false_positive
        ;;
    "multiple")
        test_multiple_actions
        ;;
    "photo")
        test_select_photo
        ;;
    "all")
        test_create_signalement
        sleep 1
        test_create_consigne
        sleep 1
        test_mark_false_positive
        sleep 1
        test_multiple_actions
        sleep 1
        test_select_photo
        ;;
    *)
        echo "Usage: $0 {signalement|consigne|faux|multiple|photo|all}"
        echo ""
        echo "Tests disponibles:"
        echo "  signalement  - Créer un signalement"
        echo "  consigne     - Créer une consigne IA"
        echo "  faux         - Marquer comme faux positif"
        echo "  multiple     - Actions multiples (batch)"
        echo "  photo        - Sélectionner photo de référence"
        echo "  all          - Exécuter tous les tests"
        exit 1
        ;;
esac

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Test terminé${NC}"

