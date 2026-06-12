import { StatementData } from './types';

export const statementData: StatementData = {
  "generatedAt": "2026-06-11",
  "periodStart": "2026-01-09",
  "periodEnd": "2026-06-11",
  "initialBalance": 0,
  "company": {
    "name": "ZODÍACO PRISMÁTICO, UNIPESSOAL, LDA",
    "address": [
      "RUA MOUSINHO DE ALBUQUERQUE, 28 1ºDTO.",
      "GUARDA",
      "6300-734",
      "Portugal"
    ]
  },
  "accountSections": [
    {
      "fields": [
        {
          "label": "Nome da conta",
          "value": "Main"
        },
        {
          "label": "Moeda",
          "value": "EUR"
        }
      ]
    },
    {
      "title": "Dados locais",
      "fields": [
        {
          "label": "Tipo",
          "value": "Dados locais"
        },
        {
          "label": "IBAN",
          "value": "LT55 3250 0436 4050 4913"
        },
        {
          "label": "BIC",
          "value": "REVOLT21"
        }
      ]
    },
    {
      "title": "Dados internacionais",
      "fields": [
        {
          "label": "Tipo",
          "value": "Dados internacionais"
        },
        {
          "label": "IBAN",
          "value": "LT55 3250 0436 4050 4913"
        },
        {
          "label": "BIC",
          "value": "REVOLT21"
        },
        {
          "label": "BIC do intermediário",
          "value": "CHASDEFX"
        }
      ]
    }
  ],
  "transactions": [
    {
      "id": "5",
      "date": "2026-01-09",
      "type": "MOS",
      "description": "Para OZNI ANJOS BATISTA • Devolução",
      "incoming": 0,
      "outgoing": 0.03,
      "balance": -0.03
    },
    {
      "id": "moa-jan",
      "date": "2026-01-09",
      "type": "MOA",
      "description": "Dinheiro adicionado de OZNI ANJOS BATISTA",
      "incoming": 0.03,
      "outgoing": 0,
      "balance": 0
    },
    {
      "id": "fee-fev",
      "date": "2026-02-09",
      "type": "FEE",
      "description": "Taxa da Revolut Business • Taxa do plano Basic",
      "incoming": 0,
      "outgoing": 10,
      "balance": -10
    },
    {
      "id": "moa-fev",
      "date": "2026-02-11",
      "type": "MOA",
      "description": "Dinheiro adicionado de FLAVIO ALMEIDA MATOS - Mensalidade Conta.",
      "incoming": 10,
      "outgoing": 0,
      "balance": 0
    },
    {
      "id": "fee-mar",
      "date": "2026-03-09",
      "type": "FEE",
      "description": "Taxa da Revolut Business • Taxa do plano Basic",
      "incoming": 0,
      "outgoing": 10,
      "balance": -10
    },
    {
      "id": "moa-mar",
      "date": "2026-03-12",
      "type": "MOA",
      "description": "Dinheiro adicionado de FLAVIO ALMEIDA MATOS - Mensalidade Conta.",
      "incoming": 10,
      "outgoing": 0,
      "balance": 0
    },
    {
      "id": "1",
      "date": "2026-04-02",
      "type": "OPENING",
      "description": "Capital Inicial – Injeção de Capital da Empresa",
      "incoming": 14671.83,
      "outgoing": 0,
      "balance": 14671.83
    },
    {
      "id": "moa-abr",
      "date": "2026-04-14",
      "type": "MOA",
      "description": "Dinheiro adicionado de FLAVIO ALMEIDA MATOS - Mensalidade Conta.",
      "incoming": 10,
      "outgoing": 0,
      "balance": 14681.83
    },
    {
      "id": "fee-mai",
      "date": "2026-05-09",
      "type": "FEE",
      "description": "Taxa da Revolut Business • Taxa do plano Basic",
      "incoming": 0,
      "outgoing": 10,
      "balance": 14671.83
    },
    {
      "id": "moa-mai",
      "date": "2026-05-15",
      "type": "MOA",
      "description": "Dinheiro adicionado de FLAVIO ALMEIDA MATOS - Mensalidade Conta.",
      "incoming": 10,
      "outgoing": 0,
      "balance": 14681.83
    },
    {
      "id": "7",
      "date": "2026-06-04",
      "type": "FEE",
      "description": "Taxa da Revolut Business • Taxa do plano Basic",
      "incoming": 0,
      "outgoing": 10,
      "balance": 14671.83
    },
    {
      "id": "fee-jun",
      "date": "2026-06-09",
      "type": "FEE",
      "description": "Taxa da Revolut Business • Taxa do plano Basic",
      "incoming": 0,
      "outgoing": 10,
      "balance": 14661.83
    }
  ]
};
