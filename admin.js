<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin - Dabruale Moda Íntima</title>

    <!-- Prévia para WhatsApp e Redes Sociais -->
    <meta property="og:title" content="Dabruale Moda Íntima - Admin">
    <meta property="og:description" content="Painel de administração e catálogo de produtos para Dabruale Moda Íntima.">
    <meta property="og:image" content="https://dabruale.github.io/Dabruale-moda-intima/logo.png">
    <meta property="og:image:secure_url" content="https://dabruale.github.io/Dabruale-moda-intima/logo.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="300">
    <meta property="og:image:height" content="300">
    <meta property="og:url" content="https://dabruale.github.io/Dabruale-moda-intima/admin.html">
    <meta property="og:type" content="website">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body { 
            background-color: #f0f0f0; 
            display: flex; 
            justify-content: center; 
            align-items: flex-start; 
            min-height: 100vh; 
        } 
        .app-container { 
            max-width: 650px; 
            width: 100%; 
            background-color: #fdf2f8; 
            min-height: 100vh; 
            display: flex; 
            flex-direction: column; 
            box-shadow: 0 0 15px rgba(0,0,0,0.08); 
            position: relative; 
        } 
        /* --- TELA DE LOGIN --- */ 
        #loginContainer { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            padding: 20px; 
            background-color: #fdf2f8; 
        } 
        .card-login { 
            background: white; 
            padding: 30px 24px; 
            border-radius: 16px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            width: 100%; 
            max-width: 360px; 
            text-align: center; 
        } 
        .card-login h1 { 
            color: #d81b60; 
            font-size: 1.2rem; 
            margin-bottom: 6px; 
            text-transform: uppercase; 
        } 
        .card-login p { 
            font-size: 0.8rem; 
            color: #666; 
            margin-bottom: 20px; 
        } 
        .card-login input { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ccc; 
            border-radius: 8px; 
            font-size: 0.85rem; 
            margin-bottom: 12px; 
            outline: none; 
        } 
        .card-login input:focus { 
            border-color: #d81b60; 
        } 
        .btn-entrar { 
            width: 100%; 
            background-color: #d81b60; 
            color: white; 
            border: none; 
            padding: 12px; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 0.9rem; 
            cursor: pointer; 
            transition: background 0.2s; 
        } 
        .btn-entrar:hover { 
            background-color: #c2185b; 
        } 
        .erro-login { 
            color: #d32f2f; 
            font-size: 0.8rem; 
            margin-top: 10px; 
            display: none; 
            font-weight: bold; 
        } 
        /* --- PAINEL ADMIN --- */ 
        #adminPanel { 
            display: none; 
            flex-direction: column; 
            min-height: 100vh; 
        } 
        header { 
            background-color: #d81b60; 
            color: white; 
            padding: 14px 16px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            position: sticky; 
            top: 0; 
            z-index: 10; 
        } 
        header h1 { 
            font-size: 1.1rem; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            font-weight: 800; 
        } 
        header p { 
            font-size: 0.72rem; 
            opacity: 0.95; 
        } 
        .header-acoes { 
            display: flex; 
            gap: 8px; 
        } 
        .btn-header { 
            background-color: white; 
            color: #d81b60; 
            text-decoration: none; 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-weight: bold; 
            font-size: 0.75rem; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            cursor: pointer; 
            border: none; 
        } 
        .btn-header:active { 
            transform: scale(0.95); 
        } 
        main { 
            flex: 1; 
            padding: 16px; 
        } 
        .card-form { 
            background: white; 
            border-radius: 12px; 
            padding: 16px; 
            margin-bottom: 20px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
        } 
        .card-form h2 { 
            font-size: 1rem; 
            color: #d81b60; 
            margin-bottom: 12px; 
            border-bottom: 2px solid #fdf2f8; 
            padding-bottom: 6px; 
        } 
        .form-grid { 
            display: flex; 
            flex-direction: column; 
            gap: 10px; 
        } 
        .campo-grupo { 
            display: flex; 
            flex-direction: column; 
            gap: 4px; 
        } 
        .campo-linha { 
            display: flex; 
            gap: 10px; 
        } 
        .campo-linha .campo-grupo { 
            flex: 1; 
        } 
        label { 
            font-size: 0.75rem; 
            font-weight: bold; 
            color: #444; 
        } 
        input, select, textarea { 
            padding: 9px 12px; 
            border: 1px solid #ccc; 
            border-radius: 8px; 
            font-size: 0.85rem; 
            outline: none; 
            width: 100%; 
        } 
        input:focus, select:focus, textarea:focus { 
            border-color: #d81b60; 
        } 
        .btn-salvar { 
            background-color: #d81b60; 
            color: white; 
            border: none; 
            padding: 10px; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 0.85rem; 
            cursor: pointer; 
            margin-top: 6px; 
            transition: background 0.2s; 
        } 
        .btn-salvar:hover { 
            background-color: #c2185b; 
        } 
        .btn-cancelar { 
            background-color: #757575; 
            color: white; 
            border: none; 
            padding: 10px; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 0.85rem; 
            cursor: pointer; 
            margin-top: 6px; 
            display: none; 
        } 
        .secao-lista h2 { 
            font-size: 1rem; 
            color: #333; 
            margin-bottom: 10px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        } 
        .badge-total { 
            background: #d81b60; 
            color: white; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 0.75rem; 
        } 
        .lista-produtos { 
            display: flex; 
            flex-direction: column; 
            gap: 10px; 
        } 
        .item-admin-produto { 
            background: white; 
            border-radius: 10px; 
            padding: 10px; 
            display: flex; 
            gap: 12px; 
            align-items: center; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.03); 
        } 
        .item-admin-produto img { 
            width: 60px; 
            height: 60px; 
            object-fit: cover; 
            border-radius: 6px; 
            flex-shrink: 0; 
        } 
        .item-info { 
            flex: 1; 
        } 
        .item-nome { 
            font-weight: bold; 
            font-size: 0.88rem; 
            color: #333; 
        } 
        .item-detalhes { 
            font-size: 0.72rem; 
            color: #666; 
            margin-top: 2px; 
        } 
        .item-preco { 
            color: #d81b60; 
            font-weight: bold; 
            font-size: 0.85rem; 
        } 
        .item-acoes { 
            display: flex; 
            flex-direction: column; 
            gap: 4px; 
        } 
        .btn-acao { 
            border: none; 
            padding: 5px 10px; 
            border-radius: 6px; 
            font-size: 0.72rem; 
            font-weight: bold; 
            cursor: pointer; 
        } 
        .btn-editar { 
            background-color: #ff9800; 
            color: white; 
        } 
        .btn-excluir { 
            background-color: #f44336; 
            color: white; 
        } 
        .aviso { 
            display: none; 
            padding: 10px; 
            border-radius: 8px; 
            font-size: 0.8rem; 
            text-align: center; 
            margin-bottom: 12px; 
            font-weight: bold; 
        } 
        .aviso.sucesso { 
            background-color: #e8f5e9; 
            color: #2e7d32; 
            border: 1px solid #a5d6a7; 
        } 
        footer { 
            background-color: #d81b60; 
            color: white; 
            text-align: center; 
            padding: 12px; 
            font-size: 0.75rem; 
            margin-top: auto; 
        }
    </style>
</head>
<body>

    <div class="app-container">
        <!-- TELA DE LOGIN -->
        <div id="loginContainer">
            <div class="card-login">
                <h1>DABRUALE ADMIN</h1>
                <p>Acesse com seu e-mail e senha cadastrados</p>
                <form id="formLogin">
                    <input type="email" id="email" placeholder="Seu E-mail" required>
                    <input type="password" id="senha" placeholder="Sua Senha" required>
                    <button type="submit" class="btn-entrar">Acessar Painel</button>
                </form>
                <div id="erroLogin" class="erro-login">E-mail ou senha incorretos!</div>
            </div>
        </div>

        <!-- PAINEL ADMIN -->
        <div id="adminPanel">
            <header>
                <div>
                    <h1>Dabruale Admin</h1>
                    <p>Gestão de Produtos e Catálogo</p>
                </div>
                <div class="header-acoes">
                    <a href="index.html" target="_blank" class="btn-header">Ver Loja</a>
                    <button id="btnSair" class="btn-header">Sair</button>
                </div>
            </header>

            <main>
                <div id="aviso" class="aviso"></div>

                <div class="card-form">
                    <h2 id="tituloForm">Cadastrar Novo Produto</h2>
                    <form id="formProduto">
                        <input type="hidden" id="produtoId">
                        
                        <div class="form-grid">
                            <div class="campo-grupo">
                                <label for="nome">Nome do Produto</label>
                                <input type="text" id="nome" placeholder="Ex: Conjunto Renda Rosa" required>
                            </div>

                            <div class="campo-linha">
                                <div class="campo-grupo">
                                    <label for="preco">Preço (R$)</label>
                                    <input type="number" id="preco" step="0.01" placeholder="59.90" required>
                                </div>
                                <div class="campo-grupo">
                                    <label for="categoria">Categoria</label>
                                    <select id="categoria" required>
                                        <option value="">Selecione...</option>
                                        <option value="conjuntos">Conjuntos</option>
                                        <option value="sutiass">Sutiãs</option>
                                        <option value="calcinhas">Calcinhas</option>
                                        <option value="pijamas">Pijamas / Sleepwear</option>
                                        <option value="acessorios">Acessórios</option>
                                    </select>
                                </div>
                            </div>

                            <div class="campo-grupo">
                                <label for="imagem">URL da Imagem (Cloudinary)</label>
                                <input type="url" id="imagem" placeholder="https://res.cloudinary.com/..." required>
                            </div>

                            <div class="campo-grupo">
                                <label for="descricao">Descrição / Tamanhos Disponíveis</label>
                                <textarea id="descricao" rows="3" placeholder="Tamanhos: P, M, G. Tecido de renda super macio..."></textarea>
                            </div>

                            <button type="submit" class="btn-salvar" id="btnSalvar">Salvar Produto</button>
                            <button type="button" class="btn-cancelar" id="btnCancelar">Cancelar Edição</button>
                        </div>
                    </form>
                </div>

                <div class="secao-lista">
                    <h2>Produtos Cadastrados <span class="badge-total" id="totalProdutos">0</span></h2>
                    <div id="listaProdutos" class="lista-produtos">
                        <!-- Produtos serão carregados via JavaScript -->
                    </div>
                </div>
            </main>

            <footer>
                Dabruale Moda Íntima &copy; Todos os direitos reservados
            </footer>
        </div>
    </div>

    <!-- Scripts do Firebase compatíveis -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

    <!-- Script de controle do painel -->
    <script src="admin.js"></script>
</body>
</html>
