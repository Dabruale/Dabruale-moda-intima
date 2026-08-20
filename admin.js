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
const imagemInput = document.getElementById('imagem');
const descricaoInput = document.getElementById('descricao');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const tituloForm = document.getElementById('tituloForm');
const listaProdutos = document.getElementById('listaProdutos');
const totalProdutos = document.getElementById('totalProdutos');
const aviso = document.getElementById('aviso');

// --- 1. EVENTO DE SUBMIT DO LOGIN ---
if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
        e.preventDefault(); // Impede o recarregamento da página ao enviar
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

// --- 4. SALVAR / EDITAR PRODUTO ---
if (formProduto) {
    formProduto.addEventListener('submit', function (e) {
        e.preventDefault();

        const id = produtoId.value;
        const dadosProduto = {
            nome: nomeInput.value.trim(),
            preco: parseFloat(precoInput.value),
            categoria: categoriaInput.value,
            imagem: imagemInput.value.trim(),
            descricao: descricaoInput.value.trim()
        };

        if (id) {
            // Atualizar existente
            database.ref('produtos/' + id).update(dadosProduto)
                .then(() => {
                    mostrarAviso("Produto atualizado com sucesso!");
                    limparFormulario();
                })
                .catch((err) => alert("Erro ao atualizar: " + err.message));
        } else {
            // Criar Novo
            database.ref('produtos').push(dadosProduto)
                .then(() => {
                    mostrarAviso("Produto cadastrado com sucesso!");
                    limparFormulario();
                })
                .catch((err) => alert("Erro ao cadastrar: " + err.message));
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

            const card = document.createElement('div');
            card.className = 'item-admin-produto';
            card.innerHTML = `
                <img src="${p.imagem}" alt="${p.nome}">
                <div class="item-info">
                    <div class="item-nome">${p.nome}</div>
                    <div class="item-detalhes">${p.categoria ? p.categoria.toUpperCase() : ''}</div>
                    <div class="item-preco">R$ ${parseFloat(p.preco).toFixed(2)}</div>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-editar" onclick="editarProduto('${id}', '${escapeHtml(p.nome)}', ${p.preco}, '${p.categoria}', '${p.imagem}', '${escapeHtml(p.descricao || '')}')">Editar</button>
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
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// --- 6. FUNÇÕES DE EDIÇÃO E EXCLUSÃO ---
window.editarProduto = function (id, nome, preco, categoria, imagem, descricao) {
    produtoId.value = id;
    nomeInput.value = nome;
    precoInput.value = preco;
    categoriaInput.value = categoria;
    imagemInput.value = imagem;
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
