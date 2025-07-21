#!/bin/bash

echo "🧪 TESTE MANUAL DA API WASELLER"
echo "================================"

# Configurar suas credenciais aqui:
TOKEN="SEU_TOKEN_AQUI"
BASE_URL="https://api.waseller.com"

echo "Token usado: ${TOKEN:0:10}..."
echo "URL base: $BASE_URL"
echo ""

# Teste 1: Endpoint básico
echo "1. Testando endpoint básico..."
curl -v -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/ping" 2>&1 | head -20

echo -e "\n2. Testando /contacts..."
curl -v -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/contacts?limit=1" 2>&1 | head -20

echo -e "\n3. Testando com X-API-Key..."
curl -v -H "X-API-Key: $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/contacts?limit=1" 2>&1 | head -20

echo -e "\n🎯 Análise dos resultados acima:"
echo "- Se 401: Token inválido"
echo "- Se 403: Sem permissão"
echo "- Se 404: URL errada"
echo "- Se 200: Funcionou!"
