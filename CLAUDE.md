# CLAUDE.MD

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Only touch what's necessary. Avoid introducing side-effects.

## Skills

These skills are loaded automatically. Read the relevant SKILL.md before starting any task that matches a skill's domain — this is mandatory, not optional.

- **frontend-design**: [Skill Path](file:///C:/Users/vilan/claude-skills/frontend-design/SKILL.md)
- **brand-guidelines**: [Skill Path](file:///C:/Users/vilan/claude-skills/brand-guidelines/SKILL.md)
- **theme-factory**: [Skill Path](file:///C:/Users/vilan/claude-skills/theme-factory/SKILL.md)
- **design-an-interface**: [Skill Path](file:///C:/Users/vilan/claude-skills/design-an-interface/SKILL.md)
- **canvas-design**: [Skill Path](file:///C:/Users/vilan/claude-skills/canvas-design/SKILL.md)
- **web-artifacts-builder**: [Skill Path](file:///C:/Users/vilan/claude-skills/web-artifacts-builder/SKILL.md)
- **webapp-testing**: [Skill Path](file:///C:/Users/vilan/claude-skills/webapp-testing/SKILL.md)
- **skill-creator**: [Skill Path](file:///C:/Users/vilan/claude-skills/skill-creator/SKILL.md)
- **algorithmic-art**: [Skill Path](file:///C:/Users/vilan/claude-skills/algorithmic-art/SKILL.md)
- **claude-api**: [Skill Path](file:///C:/Users/vilan/claude-skills/claude-api/SKILL.md)
- **doc-coauthoring**: [Skill Path](file:///C:/Users/vilan/claude-skills/doc-coauthoring/SKILL.md)
- **docx**: [Skill Path](file:///C:/Users/vilan/claude-skills/docx/SKILL.md)
- **internal-comms**: [Skill Path](file:///C:/Users/vilan/claude-skills/internal-comms/SKILL.md)
- **mcp-builder**: [Skill Path](file:///C:/Users/vilan/claude-skills/mcp-builder/SKILL.md)
- **pdf**: [Skill Path](file:///C:/Users/vilan/claude-skills/pdf/SKILL.md)
- **pptx**: [Skill Path](file:///C:/Users/vilan/claude-skills/pptx/SKILL.md)
- **slack-gif-creator**: [Skill Path](file:///C:/Users/vilan/claude-skills/slack-gif-creator/SKILL.md)
- **xlsx**: [Skill Path](file:///C:/Users/vilan/claude-skills/xlsx/SKILL.md)

## Workflow

### Plan Before Acting

- Enter plan mode for any non-trivial task (3+ steps or architectural decisions).
- Write plan to `tasks/todo.md` with checkable items, then check in before starting implementation.
- If something goes sideways, stop and re-plan immediately — don't keep pushing.

### Subagent Strategy

- Offload research, exploration, and parallel analysis to subagents to keep the main context window clean.
- One focused task per subagent.

### Self-Improvement Loop

- After any correction from the user, update `tasks/lessons.md` with the pattern.
- Write rules that prevent the same mistake from recurring. Review lessons at session start.

### Verification Before Done

- Never mark a task complete without proving it works: run tests, check logs, demonstrate correctness.
- Mark items complete in `tasks/todo.md` as you go, and add a result summary when finished.
- Ask: "Would a staff engineer approve this?"

### Elegance Check

- For non-trivial changes, pause and ask: "Is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip for simple, obvious fixes.

### Autonomous Bug Fixing

- When given a bug report, just fix it. Point at logs/errors/failing tests, then resolve them.
- Go fix failing tests without being told how.

---

## Code Best Practices

These practices apply to every project, frontend and backend, unless a specific stack makes them irrelevant.

### 1. Componentização

- Dividir a interface em componentes pequenos, reutilizáveis e com responsabilidade única.
- Evitar componentes gigantes ("God Components").
- Componentes base (Button, Input, Card) devem ser reutilizados em todo o projeto.
- Componentes compostos são formados pela composição de componentes menores.
- Componentes devem ser previsíveis e fáceis de testar.

### 2. Separação de Responsabilidades

- Cada camada do sistema deve ter uma função clara.
- No frontend: separar UI, lógica e acesso a dados.
- No backend: separar Controller, Service/UseCase e Repository.
- Evitar que componentes de UI conheçam regras de negócio.
- Código organizado facilita manutenção, testes e evolução.

### 3. Modelagem de Banco de Dados

- Modelar o banco antes de escrever código.
- Identificar entidades, atributos e relacionamentos.
- Usar chaves primárias e estrangeiras corretamente.
- Evitar duplicação de dados (normalização).
- Modelagem deve refletir regras reais do negócio.

### 4. Migrations

- Migrations versionam a evolução do banco de dados.
- Nunca alterar migrations já aplicadas em produção.
- Criar uma migration por mudança relevante.
- Facilitam trabalho em equipe e rollback de alterações.

### 5. Design de APIs

- API é um contrato claro e previsível.
- Usar verbos HTTP corretamente (GET, POST, PUT, DELETE).
- Usar substantivos no plural nos endpoints.
- Padronizar respostas e erros.
- Versionar a API desde o início (`/api/v1`).

### 6. Arquitetura Backend em Camadas

- **Controller**: recebe request e retorna response.
- **Service/UseCase**: contém a regra de negócio.
- **Repository**: acesso ao banco de dados.
- Entidades representam o domínio do sistema.
- Código desacoplado facilita testes e refatoração.

### 7. Autenticação no Backend

- Autenticação confirma a identidade do usuário.
- Uso de JWT para autenticação stateless.
- Token contém apenas informações essenciais.
- Middlewares validam token e controlam acesso.
- Autorização define o que cada usuário pode fazer.

### 8. Autenticação no Frontend

- Frontend consome a autenticação do backend.
- Uso de Context API para estado global de auth.
- Hooks personalizados encapsulam a lógica.
- UI reage automaticamente ao estado autenticado.
- Rotas privadas protegem telas sensíveis.

### 9. Data Fetching no Frontend

- Separar chamadas de API da UI.
- Usar custom hooks para buscar dados.
- Tratar estados de loading, error e success.
- Cancelar requisições quando necessário.
- Evitar duplicação de lógica de fetch.

### 10. Error Handling

- Erros devem ser tratados de forma centralizada.
- Nunca expor erros internos ao usuário final.
- Mensagens devem ser claras e amigáveis.
- Frontend deve reagir corretamente a falhas.
- Logs são importantes para debug e monitoramento.

### 11. Design de Código Limpo

- Funções pequenas e com nomes claros.
- Evitar duplicação de código.
- Preferir early returns.
- Código deve ser legível antes de ser inteligente.
- Menos complexidade = menos bugs.

### 12. Background Jobs

- Tarefas pesadas não devem rodar no request/response.
- Uso de filas para processamento assíncrono.
- BullMQ + Redis para jobs, retries e delays.
- Workers executam tarefas em segundo plano.
- Ideal para emails, limpeza de dados e processamento pesado.

### 13. Organização por Domínio

- Agrupar arquivos por contexto do negócio.
- Evitar pastas genéricas demais.
- Cada domínio possui seus próprios serviços e regras.
- Facilita entendimento e escalabilidade do projeto.

### 14. Estrutura de Projeto como Guia

- A estrutura do projeto é uma decisão arquitetural.
- Boa estrutura orienta novos desenvolvedores.
- Ajuda a manter padrão entre projetos diferentes.
- Serve como base reutilizável para novos sistemas.
