// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCqx6LI-yLh-wwjiSB6JsmYDHIYGG-SO4k",
    authDomain: "dabruale-a9712.firebaseapp.com",
    databaseURL: "https://dabruale-a9712-default-rtdb.firebaseio.com",
    projectId: "dabruale-a9712",
    storageBucket: "dabruale-a9712.appspot.com",
    messagingSenderId: "904434904806",
    appId: "1:904434904806:web:..."
};

// Inicializa o Firebase se ainda não tiver sido inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// ELEMENTOS DA TELA
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const formLogin = document.getElementById('formLogin');
const erroLogin = document.getElementById('erroLogin');
const btnSair = document.getElementById('btnSair');

const formProduto = document.getElementById('formProduto');
const produtoId = document.getElementById('produtoId');
const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const categoriaInput = document.getElementById('categoria');
const descricaoInput = document.getElementById('descricao');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const tituloForm = document.getElementById('tituloForm');
const listaProdutos = document.getElementById('listaProdutos');
const totalProdutos = document.getElementById('totalProdutos');
const aviso = document.getElementById('aviso');

// --- PREVIEW DAS IMAGENS SELECIONADAS DO COMPUTADOR ---
window.previewImagem = function (input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// --- FUNÇÃO AUXILIAR PARA REALIZAR UPLOAD DO ARQUIVO OU PEGAR A URL ---
async function processarImagem(fileInput, urlInput) {
    // 1. Se o usuário escolheu um arquivo do computador
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const nomeUnico = Date.now() + '_' + file.name.replace(/\s+/g, '_');
        const storageRef = storage.ref('produtos/' + nomeUnico);
        
        const snapshot = await storageRef.put(file);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        return downloadUrl;
    }
    // 2. Se o usuário apenas colou um link/URL
    return urlInput.value.trim();
}

// --- 1. EVENTO DE SUBMIT DO LOGIN ---
if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        fazerLogin();
    });
}

function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha.");
        return;
    }

    erroLogin.style.display = 'none';

    auth.signInWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            console.log("Login efetuado com sucesso:", userCredential.user);
        })
        .catch((error) => {
            console.error("Erro no login:", error);
            erroLogin.style.display = 'block';
            erroLogin.innerText = "E-mail ou senha incorretos!";
        });
}

// --- 2. MONITOR DE AUTENTICAÇÃO DO FIREBASE ---
auth.onAuthStateChanged((user) => {
    if (user) {
        loginContainer.style.display = 'none';
        adminPanel.style.display = 'flex';
        carregarProdutos();
    } else {
        loginContainer.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
});

// --- 3. BOTÃO DE SAIR ---
if (btnSair) {
    btnSair.addEventListener('click', () => {
        auth.signOut();
    });
}

// --- 4. SALVAR / EDITAR PRODUTO COM UPLOAD DAS 3 FOTOS ---
if (formProduto) {
    formProduto.addEventListener('submit', async function (e) {
        e.preventDefault();

        btnSalvar.disabled = true;
        btnSalvar.innerText = "Enviando fotos... Aguarde!";

        try {
            const file1 = document.getElementById('fileImagem1');
            const url1Input = document.getElementById('imagem1');
            
            const file2 = document.getElementById('fileImagem2');
            const url2Input = document.getElementById('imagem2');

            const file3 = document.getElementById('fileImagem3');
            const url3Input = document.getElementById('imagem3');

            // Fazer upload das 3 imagens (se houver arquivos)
            const img1 = await processarImagem(file1, url1Input);
            const img2 = await processarImagem(file2, url2Input);
            const img3 = await processarImagem(file3, url3Input);

            if (!img1) {
                alert("A Foto 1 (Principal) é obrigatória!");
                btnSalvar.disabled = false;
                btnSalvar.innerText = "Salvar Produto";
                return;
            }

            const dadosProduto = {
                nome: nomeInput.value.trim(),
                preco: parseFloat(precoInput.value),
                categoria: categoriaInput.value,
                imagem: img1,      // Imagem principal (para compatibilidade com a loja)
                imagem1: img1,
                imagem2: img2 || "",
                imagem3: img3 || "",
                descricao: descricaoInput.value.trim()
            };

            const id = produtoId.value;

            if (id) {
                // Atualizar existente
                await database.ref('produtos/' + id).update(dadosProduto);
                mostrarAviso("Produto atualizado com sucesso!");
            } else {
                // Criar Novo
                await database.ref('produtos').push(dadosProduto);
                mostrarAviso("Produto cadastrado com sucesso!");
            }

            limparFormulario();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            alert("Erro ao salvar produto ou imagens: " + err.message);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "Salvar Produto";
        }
    });
}

// --- 5. CARREGAR LISTA DE PRODUTOS DO DATABASE ---
function carregarProdutos() {
    database.ref('produtos').on('value', (snapshot) => {
        listaProdutos.innerHTML = '';
        let total = 0;

        snapshot.forEach((childSnapshot) => {
            total++;
            const id = childSnapshot.key;
            const p = childSnapshot.val();

            const fotoCapa = p.imagem || p.imagem1 || 'https://via.placeholder.com/60';

            const card = document.createElement('div');
            card.className = 'item-admin-produto';
            card.innerHTML = `
                <img src="${fotoCapa}" alt="${p.nome}">
                <div class="item-info">
                    <div class="item-nome">${p.nome}</div>
                    <div class="item-detalhes">${p.categoria ? p.categoria.toUpperCase() : ''}</div>
                    <div class="item-preco">R$ ${parseFloat(p.preco).toFixed(2)}</div>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-editar" onclick="editarProduto('${id}', '${escapeHtml(p.nome)}', ${p.preco}, '${p.categoria}', '${p.imagem || p.imagem1 || ''}', '${p.imagem2 || ''}', '${p.imagem3 || ''}', '${escapeHtml(p.descricao || '')}')">Editar</button>
                    <button class="btn-acao btn-excluir" onclick="excluirProduto('${id}')">Excluir</button>
                </div>
            `;
            listaProdutos.appendChild(card);
        });

        totalProdutos.innerText = total;
    });
}

// AUXILIAR PARA EVITAR ERROS DE ASPAS EM STRINGS
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// --- 6. FUNÇÕES DE EDIÇÃO E EXCLUSÃO ---
window.editarProduto = function (id, nome, preco, categoria, img1, img2, img3, descricao) {
    produtoId.value = id;
    nomeInput.value = nome;
    precoInput.value = preco;
    categoriaInput.value = categoria;

    document.getElementById('imagem1').value = img1 || '';
    document.getElementById('imagem2').value = img2 || '';
    document.getElementById('imagem3').value = img3 || '';

    // Mostrar prévias das imagens existentes
    const p1 = document.getElementById('preview1');
    if (img1) { p1.src = img1; p1.style.display = 'block'; } else { p1.style.display = 'none'; }

    const p2 = document.getElementById('preview2');
    if (img2) { p2.src = img2; p2.style.display = 'block'; } else { p2.style.display = 'none'; }

    const p3 = document.getElementById('preview3');
    if (img3) { p3.src = img3; p3.style.display = 'block'; } else { p3.style.display = 'none'; }

    // Limpar campos de arquivo do PC
    document.getElementById('fileImagem1').value = '';
    document.getElementById('fileImagem2').value = '';
    document.getElementById('fileImagem3').value = '';

    descricaoInput.value = descricao;

    tituloForm.innerText = "Editar Produto";
    btnSalvar.innerText = "Atualizar Produto";
    btnCancelar.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.excluirProduto = function (id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
        database.ref('produtos/' + id).remove()
            .then(() => mostrarAviso("Produto removido com sucesso!"))
            .catch((err) => alert("Erro ao excluir: " + err.message));
    }
};

if (btnCancelar) {
    btnCancelar.addEventListener('click', limparFormulario);
}

function limparFormulario() {
    formProduto.reset();
    produtoId.value = '';
    
    // Limpar previews
    document.getElementById('preview1').style.display = 'none';
    document.getElementById('preview2').style.display = 'none';
    document.getElementById('preview3').style.display = 'none';

    tituloForm.innerText = "Cadastrar Novo Produto";
    btnSalvar.innerText = "Salvar Produto";
    btnCancelar.style.display = "none";
}

function mostrarAviso(mensagem) {
    aviso.innerText = mensagem;
    aviso.className = "aviso sucesso";
    aviso.style.display = "block";
    setTimeout(() => {
        aviso.style.display = "none";
    }, 3000);
}
