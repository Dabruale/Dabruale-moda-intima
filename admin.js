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

// Inicializa o Firebase
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

// PREVIEW DAS IMAGENS
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

// FUNÇÃO PARA FAZER UPLOAD DA FOTO OU USAR URL
async function processarImagem(fileInput, urlInput) {
    // 1. Se foi selecionado um arquivo do computador
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const nomeArquivo = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storageRef = storage.ref('produtos/' + nomeArquivo);

        try {
            const snapshot = await storageRef.put(file);
            const urlFinal = await snapshot.ref.getDownloadURL();
            return urlFinal;
        } catch (err) {
            throw new Error("Falha no upload da foto: " + err.message);
        }
    }
    // 2. Se apenas colou a URL
    return urlInput ? urlInput.value.trim() : "";
}

// LOGIN
if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();

        erroLogin.style.display = 'none';

        auth.signInWithEmailAndPassword(email, senha)
            .catch((error) => {
                erroLogin.style.display = 'block';
                erroLogin.innerText = "Erro ao entrar: " + error.message;
            });
    });
}

// MONITOR DE AUTENTICAÇÃO
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

// LOGOUT
if (btnSair) {
    btnSair.addEventListener('click', () => auth.signOut());
}

// SALVAR / ATUALIZAR PRODUTO
if (formProduto) {
    formProduto.addEventListener('submit', async function (e) {
        e.preventDefault();

        btnSalvar.disabled = true;
        btnSalvar.innerText = "Enviando imagens... Aguarde!";

        try {
            const file1 = document.getElementById('fileImagem1');
            const url1 = document.getElementById('imagem1');
            const file2 = document.getElementById('fileImagem2');
            const url2 = document.getElementById('imagem2');
            const file3 = document.getElementById('fileImagem3');
            const url3 = document.getElementById('imagem3');

            // Processar fotos (Upload ou URL)
            const img1 = await processarImagem(file1, url1);
            const img2 = await processarImagem(file2, url2);
            const img3 = await processarImagem(file3, url3);

            if (!img1) {
                alert("A Foto 1 (Principal) é obrigatória! Selecione um arquivo do computador ou insira uma URL.");
                btnSalvar.disabled = false;
                btnSalvar.innerText = "Salvar Produto";
                return;
            }

            const dadosProduto = {
                nome: nomeInput.value.trim(),
                preco: parseFloat(precoInput.value),
                categoria: categoriaInput.value,
                imagem: img1,
                imagem1: img1,
                imagem2: img2 || "",
                imagem3: img3 || "",
                descricao: descricaoInput.value.trim()
            };

            const id = produtoId.value;

            if (id) {
                await database.ref('produtos/' + id).update(dadosProduto);
                mostrarAviso("Produto atualizado com sucesso!");
            } else {
                await database.ref('produtos').push(dadosProduto);
                mostrarAviso("Produto cadastrado com sucesso!");
            }

            limparFormulario();
        } catch (err) {
            console.error("Erro completo:", err);
            alert("ERRO AO SALVAR:\n" + err.message);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "Salvar Produto";
        }
    });
}

// CARREGAR LISTA
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

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// EDITAR E EXCLUIR
window.editarProduto = function (id, nome, preco, categoria, img1, img2, img3, descricao) {
    produtoId.value = id;
    nomeInput.value = nome;
    precoInput.value = preco;
    categoriaInput.value = categoria;

    document.getElementById('imagem1').value = img1 || '';
    document.getElementById('imagem2').value = img2 || '';
    document.getElementById('imagem3').value = img3 || '';

    const p1 = document.getElementById('preview1');
    if (img1) { p1.src = img1; p1.style.display = 'block'; } else { p1.style.display = 'none'; }

    const p2 = document.getElementById('preview2');
    if (img2) { p2.src = img2; p2.style.display = 'block'; } else { p2.style.display = 'none'; }

    const p3 = document.getElementById('preview3');
    if (img3) { p3.src = img3; p3.style.display = 'block'; } else { p3.style.display = 'none'; }

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
    if (confirm("Deseja excluir este produto?")) {
        database.ref('produtos/' + id).remove()
            .then(() => mostrarAviso("Produto removido!"))
            .catch((err) => alert("Erro ao excluir: " + err.message));
    }
};

if (btnCancelar) {
    btnCancelar.addEventListener('click', limparFormulario);
}

function limparFormulario() {
    formProduto.reset();
    produtoId.value = '';
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
    setTimeout(() => { aviso.style.display = "none"; }, 3000);
}
