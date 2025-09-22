# Running Food Game 🍔🚗

Este projeto é um **jogo de entrega de comida**, onde o jogador deve levar pedidos às casas evitando obstáculos e carros. O placar do jogador é salvo em **AWS DynamoDB** via **AWS Lambda** e **API Gateway**.  

O objetivo deste README é **documentar passo a passo** como o projeto funciona e como testá-lo.

---

## 🔹 Tecnologias Utilizadas

- **Frontend:** HTML, CSS, JavaScript (Canvas 2D)
- **Backend:** AWS Lambda (Node.js)
- **Banco de Dados:** AWS DynamoDB
- **Integração:** AWS API Gateway
- **Hospedagem Frontend:** GitHub Pages
- **Áudio e imagens:** Locais (`sons/` e `imagens/`)

---

## 🔹 Estrutura do Projeto

```
runningfood-web/
├── index.html           # HTML principal
├── game.js              # Lógica do jogo
├── imagens/             # Sprites e cenários
├── sons/                # Sons do jogo
└── README.md            # Documentação
```

---

## 🔹 Como Jogar

1. Abrir `index.html` em um navegador moderno (Chrome, Edge, Firefox).
2. Digitar seu **nome** quando solicitado.
3. Movimentar o personagem com:
   - Teclas de seta no PC
   - Botões touch para mobile
4. Entregar pedidos nas casas sem colidir com carros ou obstáculos.
5. O jogo termina quando:
   - Todas as casas forem entregues (vitória)
   - Ou acabar o tempo / perder todas as vidas (derrota)
6. O placar será enviado automaticamente para a **AWS DynamoDB**.

---

## 🔹 Backend AWS

### Lambda

- Função: `SalvarPlacar`
- Linguagem: Node.js
- Responsável por salvar o nome e pontuação do jogador no DynamoDB
- Código principal:

```javascript
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {

  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  const { nome, pontuacao } = JSON.parse(event.body);

  const params = {
    TableName: "PlacarJogo",
    Item: {
      nome: { S: nome },
      pontuacao: { N: pontuacao.toString() }
    }
  };

  try {
    await client.send(new PutItemCommand(params));
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Placar salvo com sucesso!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Erro ao salvar placar", error })
    };
  }
};
```

### DynamoDB

- Tabela: `PlacarJogo`
- Atributos:
  - `nome` (String) → chave primária
  - `pontuacao` (Number)
- Configuração:
  - Região: `us-east-1`
  - Sem índices secundários necessários para este projeto

### API Gateway

- Endpoint: `https://<seu-api-id>.execute-api.us-east-1.amazonaws.com/dev/placar`
- Método: `POST`
- Método `OPTIONS` configurado para **CORS**
- Integração: Lambda Function
- **CORS habilitado** para permitir requisições do frontend hospedado no GitHub Pages

---

## 🔹 Como Testar

1. Clone o repositório:

```bash
git clone https://github.com/<seu-usuario>/runningfood-web.git
```

2. Abra o projeto em um navegador ou hospede via **GitHub Pages**.
3. Certifique-se de que:
   - Lambda está publicado
   - API Gateway está com CORS configurado
   - Tabela DynamoDB existe
4. Jogue e verifique se o placar aparece no DynamoDB.

---

## 🔹 Problemas Comuns

- **Erro CORS**:  
  Se o browser bloquear o fetch, verifique se:
  - O método OPTIONS existe no API Gateway
  - CORS está habilitado com `Access-Control-Allow-Origin: *`
  - Headers corretos permitidos (`Content-Type`)

- **Placar não salva**:  
  Verifique se o Lambda está devidamente publicado e integrado ao API Gateway.

---

## 🔹 Observações Finais

- Este projeto é um **exemplo de integração fullstack leve**, combinando frontend em Canvas 2D e backend serverless na AWS.
- Pode ser expandido para:
  - Ranking global de jogadores
  - Diferentes níveis de dificuldade
  - Multiplataforma (mobile, desktop)

---

## 🔹 Contato

Bruno Cesar  
[GitHub](https://github.com/brunocco)  
[LinkedIn](https://www.linkedin.com/in/brunocco)  

