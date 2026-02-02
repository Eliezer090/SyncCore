# Documento de Implementação - Tarefas Pendentes SyncCore

## Resumo Executivo

Este documento detalha a análise técnica e o plano de implementação para 16 tarefas identificadas no sistema SyncCore. As tarefas foram organizadas por área funcional e prioridade.

---

## 📋 Lista de Tarefas

| # | Área | Tarefa | Complexidade | Prioridade |
|---|------|--------|--------------|------------|
| 1 | Agendamentos | Botão "Adicionar" serviço não funciona | Baixa | Alta |
| 2 | Agendamentos | Campo "Duração Total" deve ser somente leitura | Baixa | Alta |
| 3 | Geral | Scroll do mouse em campos data/hora muito rápido | Média | Média |
| 4 | Clientes | Erro "Campo não encontrado" ao criar cliente | Média | Alta |
| 5 | Endereços | Endereços de clientes via clientes_empresas não aparecem | Média | Alta |
| 6 | Categorias | Remover campo imagem da categoria de produto | Baixa | Baixa |
| 7 | Produtos | Upload de imagens durante criação (antes de salvar) | Alta | Média |
| 8 | Variações | Combo de produtos não lista - adicionar filtro/busca | Média | Média |
| 9 | Adicionais | Combo de produtos não lista - adicionar filtro/busca | Média | Média |
| 10 | Estoque | Combo de produtos não lista - adicionar filtro/busca | Média | Média |
| 11 | Pedidos | Refazer tela para cadastrar itens e adicionais na mesma tela | Alta | Alta |
| 12 | Pagamentos | Combo de pedidos não lista | Média | Média |
| 13 | Serviços Profissional | Combos de profissional/serviço não listam | Média | Média |
| 14 | Expediente | Combo de profissional não lista | Média | Média |
| 15 | Expediente | Separar horários de sábado/domingo em manhã e tarde | Alta | Média |
| 16 | Bloqueios | Combo de profissional não lista | Média | Média |

---

## 🔍 Análise Detalhada por Tarefa

---

### Tarefa 1: Botão "Adicionar" serviço no agendamento não funciona

**Arquivo:** `src/app/dashboard/agendamentos/page.tsx`

**Análise:**
O botão "Adicionar" chama a função `handleAddServico()` na linha 1039. A função está implementada corretamente (linhas 386-416):
- Verifica se `selectedServicoId` não é 0
- Se é agendamento existente, faz POST para API
- Se é novo agendamento, adiciona a `servicosPendentes`

**Problema Identificado:**
O botão está com `disabled={!selectedServicoId}`, mas `selectedServicoId` é inicializado como `0` e o `<MenuItem value={0}>Selecione...</MenuItem>` pode estar causando confusão porque quando selecionado permanece como 0.

**Solução:**
Verificar se há problema no estado inicial ou no comportamento do Select. Adicionar log para debug se necessário.

**Código Atual (linha 1021-1039):**
```tsx
<Select
  value={selectedServicoId}
  onChange={(e) => {
    const id = Number(e.target.value);
    setSelectedServicoId(id);
    // ...
  }}
  label="Serviço"
>
  <MenuItem value={0}>Selecione...</MenuItem>
  {servicos.filter(...).map(...)}
</Select>
// ...
<Button
  variant="outlined"
  size="small"
  startIcon={<PlusIcon />}
  onClick={handleAddServico}
  disabled={!selectedServicoId}
  fullWidth
>
  Adicionar
</Button>
```

**Ação:** Testar se o problema está na lista de serviços vazia (filtro removendo todos) ou no estado.

---

### Tarefa 2: Campo "Duração Total" deve ser somente leitura

**Arquivo:** `src/app/dashboard/agendamentos/page.tsx`

**Análise:**
O campo está na linha 866-874 e atualmente é editável:
```tsx
<Controller name="duracao_total_minutos" control={control} render={({ field }) => (
  <FormControl fullWidth>
    <InputLabel>Duração Total</InputLabel>
    <OutlinedInput {...field} type="number" value={field.value ?? ''} label="Duração Total" 
      endAdornment={<span style={{ marginRight: 8 }}>min</span>} 
      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)} />
    <FormHelperText>Calculado automaticamente com base nos serviços</FormHelperText>
  </FormControl>
)} />
```

**Solução:**
Adicionar `readOnly` ou `disabled` ao campo e calcular automaticamente baseado nos serviços.

**Alteração:**
```tsx
<OutlinedInput 
  {...field} 
  type="number" 
  value={field.value ?? ''} 
  label="Duração Total"
  readOnly
  sx={{ bgcolor: 'action.disabledBackground' }}
  endAdornment={<span style={{ marginRight: 8 }}>min</span>}
/>
```

---

### Tarefa 3: Scroll do mouse em campos data/hora muito rápido

**Arquivos Afetados:** Todos que usam `<OutlinedInput type="datetime-local" />`

**Análise:**
Campos com `type="datetime-local"` no Chrome/Edge permitem scroll com mouse wheel para alterar valores. O comportamento padrão incrementa muito rápido.

**Solução:**
Desabilitar scroll wheel nos inputs datetime-local via CSS ou JavaScript:
```tsx
// Opção 1: CSS Global em styles/global.css
input[type="datetime-local"]::-webkit-inner-spin-button,
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  /* Já existe no Chrome */
}

// Opção 2: onWheel em cada campo
<OutlinedInput 
  {...field} 
  type="datetime-local" 
  onWheel={(e) => e.currentTarget.blur()}
/>
```

**Recomendação:** Adicionar `onWheel={(e) => e.currentTarget.blur()}` ou `onWheel={(e) => e.preventDefault()}` em todos os inputs de tipo `datetime-local`, `date`, `time`, e `number`.

---

### Tarefa 4: Erro "Campo não encontrado" ao criar cliente

**Arquivos:**
- `src/app/api/clientes/route.ts`
- `src/components/dashboard/clientes/cliente-form.tsx`

**Análise:**
A API `POST /api/clientes` espera: `nome, telefone, email, url_foto`
O formulário envia exatamente esses campos.

**Problema Potencial:**
O erro "Campo não encontrado" pode estar vindo do `formatDatabaseError()` interpretando um erro de constraint ou campo inexistente na tabela.

**Verificação Necessária:**
1. Confirmar schema da tabela `clientes` no banco
2. Verificar se todos os campos existem: `nome, telefone, email, url_foto`

**Código API (linha 101-114):**
```typescript
const sql = `
  INSERT INTO clientes (nome, telefone, email, url_foto)
  VALUES ($1, $2, $3, $4)
  RETURNING *
`;
const params = [nome, telefone, emailNormalizado, url_foto];
```

**Ação:** Verificar se o campo `url_foto` existe na tabela. Se não existir, remover do INSERT ou criar a coluna.

---

### Tarefa 5: Endereços de clientes via clientes_empresas não aparecem

**Arquivo:** `src/app/api/enderecos/route.ts`

**Análise:**
O endpoint atual filtra diretamente por `e.empresa_id = $N`, mas os endereços de clientes podem ter `empresa_id = NULL` se foram criados pelo cliente (não pela empresa).

**Código Atual (linha 27-45):**
```typescript
// Filtrar por empresa_id específico (ex: buscar endereço de uma empresa)
if (empresaIdParam) {
  whereClause += whereClause ? ` AND e.empresa_id = $${paramIndex}` : ` WHERE e.empresa_id = $${paramIndex}`;
  params.push(empresaIdParam);
  paramIndex++;
}
// Ou filtrar por empresa do usuário (obrigatório para não-admin_global)
else if (empresaIdFiltro !== null) {
  whereClause += whereClause ? ` AND e.empresa_id = $${paramIndex}` : ` WHERE e.empresa_id = $${paramIndex}`;
  params.push(empresaIdFiltro);
  paramIndex++;
}
```

**Problema:**
Não considera endereços de clientes que estão vinculados via `clientes_empresas`.

**Solução:**
```typescript
else if (empresaIdFiltro !== null) {
  // Incluir endereços da empresa OU de clientes vinculados à empresa
  whereClause += whereClause 
    ? ` AND (e.empresa_id = $${paramIndex} OR e.cliente_id IN (SELECT cliente_id FROM clientes_empresas WHERE empresa_id = $${paramIndex}))`
    : ` WHERE (e.empresa_id = $${paramIndex} OR e.cliente_id IN (SELECT cliente_id FROM clientes_empresas WHERE empresa_id = $${paramIndex}))`;
  params.push(empresaIdFiltro);
  paramIndex++;
}
```

---

### Tarefa 6: Remover campo imagem da categoria de produto

**Arquivo:** `src/app/dashboard/categorias-produto/page.tsx`

**Análise:**
O campo `url_imagem` existe no schema zod (linha ~50) e no formulário.

**Solução:**
1. Remover do schema zod
2. Remover do defaultValues
3. Remover do JSX do formulário
4. Remover do payload enviado para API

**Nota:** Manter coluna no banco por retrocompatibilidade (pode ter dados).

---

### Tarefa 7: Upload de imagens de produto durante criação

**Arquivo:** `src/app/dashboard/produtos/page.tsx`

**Análise:**
Atualmente o upload de imagens só funciona depois de salvar o produto porque `handleAddImagem` requer `selectedProduto`:

```tsx
const handleAddImagem = async (url: string) => {
  if (!selectedProduto) return;  // <-- Problema aqui
  // ...
}
```

**Solução:**
Similar ao `servicosPendentes` em agendamentos:
1. Criar estado `imagensPendentes` para novos produtos
2. Na criação, fazer upload para pasta temporária
3. Após salvar produto, mover imagens e vincular ao produto

**Implementação:**
```tsx
const [imagensPendentes, setImagensPendentes] = React.useState<{url: string, ordem: number, is_capa: boolean}[]>([]);

const handleAddImagem = async (url: string) => {
  if (selectedProduto) {
    // Salvar direto no banco
    // código atual...
  } else {
    // Adicionar à lista pendente
    setImagensPendentes(prev => [...prev, { 
      url, 
      ordem: prev.length, 
      is_capa: prev.length === 0 
    }]);
  }
};

// No onSubmit, após criar produto:
if (!selectedProduto && imagensPendentes.length > 0) {
  for (const img of imagensPendentes) {
    await fetch('/api/produto-imagens', {
      method: 'POST',
      body: JSON.stringify({ produto_id: savedProduto.id, ...img })
    });
  }
}
```

---

### Tarefas 8, 9, 10: Combo de produtos com filtro/busca (Variações, Adicionais, Estoque)

**Arquivos:**
- `src/app/dashboard/produto-variacoes/page.tsx`
- `src/app/dashboard/produto-adicionais/page.tsx`
- `src/app/dashboard/estoque/page.tsx`

**Análise:**
Todos usam `<Select>` simples que carrega todos os produtos sem filtro.

**Código Atual:**
```tsx
<Select {...field} label="Produto">
  {produtos.map((p) => (<MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>))}
</Select>
```

**Solução:**
Substituir por `Autocomplete` do MUI com busca:
```tsx
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

<Controller 
  name="produto_id" 
  control={control} 
  render={({ field }) => (
    <Autocomplete
      options={produtos}
      getOptionLabel={(option) => option.nome}
      value={produtos.find(p => p.id === field.value) || null}
      onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
      renderInput={(params) => (
        <TextField {...params} label="Produto" error={Boolean(errors.produto_id)} 
          helperText={errors.produto_id?.message} />
      )}
      filterOptions={(options, { inputValue }) => 
        options.filter(opt => opt.nome.toLowerCase().includes(inputValue.toLowerCase()))
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  )} 
/>
```

---

### Tarefa 11: Refazer tela de Pedidos (itens + adicionais na mesma tela)

**Arquivo:** `src/app/dashboard/pedidos/page.tsx`

**Análise:**
Tela atual é um CRUD simples sem gerenciamento de itens/adicionais.
Precisa virar um formulário hierárquico:
- Pedido (cliente, status, tipo, observação)
  - Itens do Pedido (produto/serviço, quantidade, preço)
    - Adicionais do Item (adicional_id, quantidade)

**Estrutura Proposta:**
```
┌─────────────────────────────────────────┐
│ Novo Pedido                             │
├─────────────────────────────────────────┤
│ Cliente: [Select]     Tipo: [Produto ▼] │
│ Status: [Pendente ▼]                    │
├─────────────────────────────────────────┤
│ ITENS DO PEDIDO                         │
│ ┌─────────────────────────────────────┐ │
│ │ Produto    │ Qtd │ Preço   │ Ações │ │
│ │ X-Burguer  │ 2   │ R$25,00 │ [🗑️]  │ │
│ │  └ Bacon   │     │ R$ 3,00 │       │ │
│ │  └ Cheddar │     │ R$ 2,50 │       │ │
│ │ Coca-Cola  │ 2   │ R$8,00  │ [🗑️]  │ │
│ └─────────────────────────────────────┘ │
│ [+ Adicionar Item]                      │
├─────────────────────────────────────────┤
│ TOTAL: R$ 63,50                         │
│                      [Cancelar] [Salvar]│
└─────────────────────────────────────────┘
```

**Complexidade:** ALTA
- Requer refatoração completa da página
- Estados para `itensPendentes` e `adicionaisPendentes`
- Cálculo dinâmico de totais
- UI complexa com níveis

---

### Tarefa 12: Combo de pedidos em Pagamentos não lista

**Arquivo:** `src/app/dashboard/pagamentos/page.tsx`

**Análise:**
O `fetchPedidos` (linha 100-110) faz fetch correto, mas o combo pode estar vazio se não houver pedidos ou se o filtro de empresa estiver incorreto.

**Código Atual:**
```tsx
<Select {...field} label="Pedido">
  {pedidos.map((p) => (<MenuItem key={p.id} value={p.id}>#{p.id}</MenuItem>))}
</Select>
```

**Solução:**
1. Verificar se `fetchPedidos` está retornando dados
2. Adicionar debug para ver se `pedidos` está populado
3. Substituir por Autocomplete para melhor UX com muitos pedidos

---

### Tarefas 13, 14, 16: Combos de profissional/serviço não listam

**Arquivos:**
- `src/app/dashboard/servicos-profissional/page.tsx` (Profissional + Serviço)
- `src/app/dashboard/expediente-profissional/page.tsx` (Profissional)
- `src/app/dashboard/bloqueios-profissional/page.tsx` (Profissional)

**Análise:**
Todos fazem `fetchProfissionais` chamando `/api/profissionais?empresa_id=X`.

**Verificação Necessária:**
1. Confirmar que a API `/api/profissionais` está retornando dados
2. Verificar se `empresaId` está definido no momento do fetch
3. Adicionar Autocomplete para melhor UX

**Solução Similar às Tarefas 8-10:**
```tsx
<Autocomplete
  options={profissionais}
  getOptionLabel={(option) => option.nome}
  value={profissionais.find(p => p.id === field.value) || null}
  onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
  renderInput={(params) => <TextField {...params} label="Profissional" />}
/>
```

---

### Tarefa 15: Separar horários de sábado/domingo em manhã e tarde

**Arquivos:**
- `src/app/dashboard/expediente-profissional/page.tsx`
- `src/types/database.ts`
- API expediente (se existir)

**Análise:**
Atualmente o schema tem:
```typescript
export interface ExpedienteProfissional {
  // ...
  trabalha_sabado: boolean;
  sabado_inicio: string | null;  // Um único período
  sabado_fim: string | null;
  trabalha_domingo: boolean;
  domingo_inicio: string | null;  // Um único período
  domingo_fim: string | null;
}
```

**Solução:**
Alterar para:
```typescript
export interface ExpedienteProfissional {
  // ...
  trabalha_sabado: boolean;
  sabado_manha_inicio: string | null;
  sabado_manha_fim: string | null;
  sabado_tarde_inicio: string | null;
  sabado_tarde_fim: string | null;
  trabalha_domingo: boolean;
  domingo_manha_inicio: string | null;
  domingo_manha_fim: string | null;
  domingo_tarde_inicio: string | null;
  domingo_tarde_fim: string | null;
}
```

**Alterações Necessárias:**
1. **Migration SQL:**
```sql
ALTER TABLE expediente_profissional 
  RENAME COLUMN sabado_inicio TO sabado_manha_inicio;
ALTER TABLE expediente_profissional 
  RENAME COLUMN sabado_fim TO sabado_manha_fim;
ALTER TABLE expediente_profissional 
  ADD COLUMN sabado_tarde_inicio TIME;
ALTER TABLE expediente_profissional 
  ADD COLUMN sabado_tarde_fim TIME;
-- Repetir para domingo
ALTER TABLE expediente_profissional 
  RENAME COLUMN domingo_inicio TO domingo_manha_inicio;
ALTER TABLE expediente_profissional 
  RENAME COLUMN domingo_fim TO domingo_manha_fim;
ALTER TABLE expediente_profissional 
  ADD COLUMN domingo_tarde_inicio TIME;
ALTER TABLE expediente_profissional 
  ADD COLUMN domingo_tarde_fim TIME;
```

2. **Atualizar `src/types/database.ts`**
3. **Atualizar formulário em `expediente-profissional/page.tsx`**
4. **Atualizar API se houver**

---

## 📊 Ordem de Implementação Recomendada

### Fase 1 - Correções Críticas (Quick Wins)
1. **Tarefa 2** - Campo Duração Total readonly (5 min)
2. **Tarefa 6** - Remover campo imagem categoria (10 min)
3. **Tarefa 3** - Desabilitar scroll em datetime (15 min - global)

### Fase 2 - Correções de API
4. **Tarefa 4** - Investigar erro "Campo não encontrado" (15 min)
5. **Tarefa 5** - Endereços via clientes_empresas (20 min)

### Fase 3 - Autocomplete em Combos
6. **Tarefas 8, 9, 10** - Autocomplete Produtos (30 min - reuso componente)
7. **Tarefas 12, 13, 14, 16** - Autocomplete Pedidos/Profissionais (30 min)

### Fase 4 - Funcionalidades Novas
8. **Tarefa 1** - Debug botão Adicionar serviço (20 min)
9. **Tarefa 7** - Upload imagens produto novo (1h)

### Fase 5 - Refatorações Maiores
10. **Tarefa 15** - Separar sábado/domingo manhã/tarde (1h30 - inclui migration)
11. **Tarefa 11** - Refazer tela Pedidos (3h+)

---

## 📁 Arquivos a Modificar

| Arquivo | Tarefas |
|---------|---------|
| `src/app/dashboard/agendamentos/page.tsx` | 1, 2, 3 |
| `src/styles/global.css` | 3 |
| `src/app/api/clientes/route.ts` | 4 |
| `src/app/api/enderecos/route.ts` | 5 |
| `src/app/dashboard/categorias-produto/page.tsx` | 6 |
| `src/app/dashboard/produtos/page.tsx` | 7 |
| `src/app/dashboard/produto-variacoes/page.tsx` | 8 |
| `src/app/dashboard/produto-adicionais/page.tsx` | 9 |
| `src/app/dashboard/estoque/page.tsx` | 10 |
| `src/app/dashboard/pedidos/page.tsx` | 11 |
| `src/app/dashboard/pagamentos/page.tsx` | 12 |
| `src/app/dashboard/servicos-profissional/page.tsx` | 13 |
| `src/app/dashboard/expediente-profissional/page.tsx` | 14, 15 |
| `src/app/dashboard/bloqueios-profissional/page.tsx` | 16 |
| `src/types/database.ts` | 15 |
| `scripts/migrate-expediente-sabado-domingo.sql` | 15 (novo) |

---

## ⚠️ Riscos e Dependências

1. **Tarefa 15 (Expediente):** Requer migration de banco. Fazer backup antes.
2. **Tarefa 11 (Pedidos):** Maior complexidade. Considerar fazer em sprint separado.
3. **Tarefa 4 (Clientes):** Pode ser problema no banco. Verificar schema primeiro.

---

## ✅ Checklist Final

- [ ] Tarefa 1 - Botão Adicionar serviço
- [ ] Tarefa 2 - Duração Total readonly
- [ ] Tarefa 3 - Scroll datetime
- [ ] Tarefa 4 - Erro criar cliente
- [ ] Tarefa 5 - Endereços clientes_empresas
- [ ] Tarefa 6 - Remover imagem categoria
- [ ] Tarefa 7 - Upload imagens produto novo
- [ ] Tarefa 8 - Autocomplete Variações
- [ ] Tarefa 9 - Autocomplete Adicionais
- [ ] Tarefa 10 - Autocomplete Estoque
- [ ] Tarefa 11 - Refazer tela Pedidos
- [ ] Tarefa 12 - Autocomplete Pagamentos
- [ ] Tarefa 13 - Autocomplete Serviços Profissional
- [ ] Tarefa 14 - Autocomplete Expediente
- [ ] Tarefa 15 - Sábado/Domingo manhã/tarde
- [ ] Tarefa 16 - Autocomplete Bloqueios

---

*Documento gerado em: $(date)*
*Versão: 1.0*
