# ✈️ TripWise — Travel smarter. Spend better.

**Organize suas finanças, divida despesas e viaje com mais tranquilidade.**

O TripWise é uma aplicação web de organização financeira voltada para viagens individuais e em grupo. A plataforma permite planejar orçamentos, registrar despesas, acompanhar gastos e organizar a divisão de custos entre participantes de uma viagem.

O projeto foi desenvolvido como parte de um desafio prático da **Digital Innovation One (DIO)**, utilizando a abordagem de **Vibe Coding**, com apoio de inteligência artificial durante o planejamento, desenvolvimento e evolução da aplicação.

---

## 🎯 Objetivo do projeto

O objetivo do TripWise é simplificar a gestão financeira de viagens, oferecendo em um único ambiente ferramentas para planejamento, acompanhamento de despesas e acerto de contas entre viajantes.

A proposta surgiu da necessidade de facilitar o controle dos gastos individuais e compartilhados, evitando cálculos manuais, confusões sobre pagamentos e perda de controle do orçamento.

## 💡 Funcionalidades

A aplicação possui oito áreas principais:

### 1. Dashboard
- Resumo financeiro das viagens.
- Total planejado e total gasto.
- Saldo disponível.
- Valores a receber e a pagar.
- Gastos por categoria.
- Acompanhamento do orçamento.

### 2. Minhas viagens
- Cadastro, edição e exclusão de viagens.
- Destino, datas e orçamento.
- Gerenciamento de participantes.
- Orçamentos coletivos, individuais e por categoria.
- Acompanhamento do status das viagens.

### 3. Planejamento financeiro
- Definição de limites de gastos.
- Organização por categorias.
- Comparação entre valores planejados e realizados.
- Alertas de orçamento próximo do limite ou ultrapassado.

### 4. Despesas
- Registro, edição e exclusão de despesas.
- Classificação por categoria.
- Identificação de quem realizou o pagamento.
- Associação das despesas às viagens e participantes.

### 5. Divisão de despesas
Permite organizar os custos compartilhados utilizando quatro modalidades:
- Divisão igualitária.
- Divisão por valores personalizados.
- Divisão por porcentagem.
- Despesas individuais.

O sistema calcula automaticamente a participação financeira de cada pessoa e valida os valores para evitar divergências.

### 6. Acerto de contas
- Identificação de quem deve e de quem tem valores a receber.
- Sugestão de transferências para reduzir a quantidade de pagamentos.
- Registro de pagamentos totais e parciais.
- Histórico de pagamentos e saldos pendentes.

### 7. Assistente financeiro
Interface de consulta que utiliza os dados registrados no aplicativo para responder perguntas sobre despesas, orçamento, categorias e dívidas entre participantes.

**Observação:** nesta versão, o assistente utiliza respostas simuladas com base nos dados da aplicação. Não há integração com um modelo de inteligência artificial externo.

### 8. Relatórios e perfil
- Relatórios de gastos por categoria e participante.
- Comparação entre orçamento planejado e realizado.
- Histórico financeiro das viagens.
- Configurações de perfil e preferências.
- Exportação e gerenciamento dos dados.

---

## 🛠️ Tecnologias utilizadas

- **React:** construção da interface.
- **TypeScript:** tipagem e organização do código.
- **Vite:** ambiente de desenvolvimento e compilação.
- **Tailwind CSS:** estilização.
- **Recharts:** visualização de dados e gráficos.
- **Lucide React:** ícones da interface.
- **Local Storage / armazenamento local do navegador:** persistência dos dados nesta versão.

## 🧪 Validações realizadas

Durante o desenvolvimento, foram realizados testes funcionais para verificar:

- Divisão igualitária de despesas entre participantes.
- Divisão por valores personalizados.
- Validação da soma dos valores.
- Registro de pagamentos parciais.
- Atualização integrada das informações financeiras.
- Persistência dos dados após recarregar a página.
- Responsividade em telas de computadores e dispositivos móveis.

### Exemplo de divisão

Uma despesa de R$ 240,00, paga por uma pessoa e dividida igualmente entre quatro participantes, resulta em:

| Participante | Valor |
|---|---:|
| Participante 1 (pagante) | R$ 60,00 |
| Participante 2 | R$ 60,00 |
| Participante 3 | R$ 60,00 |
| Participante 4 | R$ 60,00 |

O pagante tem R$ 180,00 a receber dos outros três participantes.

## 🚀 Como executar o projeto

É necessário ter Node.js e npm instalados.

Clone o repositório:

```bash
git clone https://github.com/sunmilyoliveira/tripwise.git
```

Entre na pasta:

```bash
cd tripwise
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

## ⚠️ Limitações da versão atual

O TripWise foi desenvolvido como um MVP funcional, com armazenamento local no navegador.

Nesta versão:
- Os dados permanecem salvos no navegador utilizado.
- Não há sincronização automática entre dispositivos.
- Login e autenticação de usuários ainda não estão implementados.
- Convites e compartilhamento não possuem controle de acesso real entre contas.
- O assistente financeiro ainda não está conectado a uma IA externa.
- O aplicativo não realiza transferências ou pagamentos reais.

Essas funcionalidades poderão ser desenvolvidas em versões futuras com a implementação de backend, autenticação e integrações externas.

## 🔮 Possíveis evoluções

- Integração com inteligência artificial generativa.
- Autenticação e gerenciamento de usuários.
- Sincronização de viagens entre participantes e dispositivos.
- Compartilhamento seguro de despesas.
- Conversão automática de moedas.
- Exportação avançada de relatórios.
- Integrações com serviços financeiros.

## 🤖 Desenvolvimento com Vibe Coding

O projeto foi desenvolvido utilizando uma abordagem de Vibe Coding, com apoio de ferramentas de inteligência artificial para transformar requisitos e ideias em funcionalidades de software.

O processo envolveu:
- Definição do problema e da proposta de solução.
- Planejamento dos requisitos e funcionalidades.
- Construção da interface e experiência do usuário.
- Desenvolvimento iterativo com auxílio de IA.
- Testes, identificação de falhas e refinamento das funcionalidades.
- Versionamento e publicação do código no GitHub.

A experiência demonstrou como ferramentas de IA podem apoiar o desenvolvimento de soluções digitais, permitindo explorar ideias, construir protótipos funcionais e validar funcionalidades de forma iterativa.

## 👩‍💻 Autoria

**Sunmily Jenifer Leal de Oliveira**

Projeto desenvolvido para o desafio da **Digital Innovation One (DIO)**.

[GitHub — sunmilyoliveira](https://github.com/sunmilyoliveira)

---

**TripWise — Travel smarter. Spend better.**
