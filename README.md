# Gustavo do Pastel

Site estático, leve e pronto para GitHub Pages. Não precisa instalar nada.

## Ajustes rápidos

O WhatsApp já está configurado no `script.js`. Caso precise trocar no futuro, edite a constante `WHATSAPP_NUMBER` usando somente números, incluindo DDI e DDD. Exemplo: `5585999999999`.

## Fotos do cardápio

As fotos enviadas pela loja ficam em `assets/products`. Para os itens sem foto própria, o projeto usa fotos genéricas de alimentos do Pexels, cuja [licença permite uso comercial e edição](https://www.pexels.com/license/). Quando houver uma foto real de um item, basta substituir o arquivo correspondente nessa pasta.

## Área administrativa

O cardápio público continua hospedado no GitHub Pages. O Supabase guarda os produtos, as fotos e o login da administradora. Assim, sua mãe entra em `admin.html`, altera um produto e a mudança aparece no cardápio público sem editar código.

### Acesso

O painel está em `admin.html`. A administradora entra usando o e-mail e a senha definidos no Supabase. Caso esqueça a senha, basta informar o e-mail e tocar em **Esqueci minha senha**: ela receberá um link para cadastrar outra.

Depois do primeiro acesso, basta clicar em **Importar cardápio atual** uma única vez. Em seguida, ela poderá criar, editar, ocultar, excluir e trocar a foto de produtos pelo painel. Itens indisponíveis somem automaticamente do catálogo público.

### Quentinha e bebidas

No topo do painel existe a área **Quentinha e bebidas**. Basta escrever uma opção por linha e salvar para atualizar as proteínas, acompanhamentos, saladas, extras e sabores que o cliente pode escolher.

### Pedidos e resumo semanal

Antes de abrir o WhatsApp, o site registra um pedido como **Pendente**. No topo do painel, a loja pode marcar cada pedido como **Concluído** ou **Não concluído**. O resumo da semana soma somente os pedidos concluídos e mostra também os pedidos ainda pendentes. Os pedidos antigos continuam salvos para consulta; o resumo apenas muda de semana automaticamente.

Para ativar esta parte, execute uma única vez o arquivo `supabase/orders.sql` no **SQL Editor** do Supabase. Esse registro guarda somente número, itens, total, observação e status do pedido — não guarda nome nem telefone do cliente.

### Loja aberta, avaliações e entrega

No topo do painel há a chave **Receber pedidos**. Ao desativá-la, o cardápio segue visível, mas o cliente vê que a loja está fechada e não consegue finalizar um pedido. A página inicial também traz o aviso de entrega combinada pelo WhatsApp e uma área de avaliação de 1 a 5 estrelas com mensagem. As avaliações aparecem no painel e exigem a execução única de `supabase/reviews.sql` no **SQL Editor** do Supabase.

## Publicar no GitHub Pages

1. Crie um repositório chamado `gustavo-do-pastel`.
2. Envie estes arquivos para a branch `main`.
3. No GitHub, entre em **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main` e pasta `/ (root)`.

O endereço ficará parecido com `https://seu-usuario.github.io/gustavo-do-pastel/`.
