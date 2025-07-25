#!/bin/bash

echo "🚀 Deployando HOBTiv Bot Inteligente no GitHub..."

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Execute na pasta raiz do projeto!"
    exit 1
fi

# Criar pastas necessárias
mkdir -p data/learning data/transfers data/knowledge

# Adicionar todos os arquivos
git add .

# Commit com timestamp
timestamp=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "🧠 Bot Inteligente v2.0 - Sistema de Aprendizado

✅ FEATURES IMPLEMENTADAS:
- Detecção inteligente de problemas ('não achei', 'não tem')
- Ofertas automáticas de alternativas por dispositivo
- Transfer inteligente para humano após tentativas
- Sistema de aprendizado salvando todas as conversas
- Contador de tentativas de resolução
- Detecção de takeover humano
- Padrões de problemas identificados

🐛 BUGS CORRIGIDOS:
- Bot não oferecia alternativas quando cliente não encontrava app
- Respostas repetitivas sem inteligência contextual
- Falta de transfer para humano em casos complexos

🎯 PRÓXIMOS PASSOS:
- Analytics do sistema de aprendizado
- Dashboard de transferências
- Otimização baseada em dados

Data: $timestamp"

# Push para GitHub
git push origin main

echo "✅ Deploy concluído no GitHub!"
echo "🔗 Verifique: https://github.com/diogofrancam/whatsapp-iptv-agent"
