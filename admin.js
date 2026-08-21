// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = { 
    apiKey: "AIzaSyCqx6LI-YLh-wwjiSB6JsmYDHIYGG-SO4k", 
    authDomain: "dabruale-a9712.firebaseapp.com", 
    databaseURL: "https://dabruale-a9712-default-rtdb.firebaseio.com", 
    projectId: "dabruale-a9712", 
    storageBucket: "dabruale-a9712.appspot.com", 
    messagingSenderId: "904434904806", 
   appId: "1:904434904806:web:2054057c62bd41aa361527",
  measurementId: "G-H4GF971P31"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// Elementos da Interface
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const formLogin = document.getElementById('formLogin');
const erroLogin = document.getElementById('erroLogin');
const btnSair = document.getElementById('btnSair');

const formProduto = document.getElementById('formProduto');
const produtoIdInput = document.getElementById('produtoId');
const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const categoriaSelect = document.getElementById('categoria');
const descricaoInput = document.getElementById('descricao');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const tituloForm = document.getElementById('tituloForm');
const listaProdutos = document.getElementById('listaProdutos');
const totalProdutos = document.getElementById('totalProdutos');
const aviso = document.getElementById('aviso');

// VERIFICAÇÃO DE LOGIN E SESSÃO
auth.onAuthStateChanged(user => {
    if (user) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'flex';
        carregarProdutos();
    } else {
        if (loginContainer) loginContainer.style.display = 'flex';
        if (adminPanel) adminPanel.style.display = 'none';
    }
});

// EFETUAR LOGIN
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        auth.signInWithEmailAndPassword(email, senha)
            .catch(error => {
                if (erroLogin) {
                    erroLogin.style.display = 'block';
                    erroLogin.textContent = "Erro ao entrar: E-mail ou senha inválidos.";
                }
            });
    });
}

// LOGOUT
if (btnSair) {
    btnSair.addEventListener('click', () => {
        auth.signOut();
    });
}

// PRÉ-VISUALIZAÇÃO DAS IMAGENS
window.previewImagem = function(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
};

// PROCESSAMENTO DE IMAGENS (FILE OU URL)
async function obterUrlImagem(fileInputId, urlInputId) {
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);

    if (fileInput && fileInput.files && fileInput.files[0]) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    } else if (urlInput && urlInput.value.trim() !== '') {
        return urlInput.value.trim();
    }
    return '';
}

// CADASTRAR OU ATUALIZAR PRODUTO
if (formProduto) {
    formProduto.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSalvar.disabled = true;
        btnSalvar.textContent = "Salvando...";

        const checkboxesTamanhos = document.querySelectorAll('input[name="tamanhos"]:checked');
        const tamanhosSelecionados = Array.from(checkboxesTamanhos).map(cb => cb.value);

        const img1 = await obterUrlImagem('fileImagem1', 'imagem1');
        const img2 = await obterUrlImagem('fileImagem2', 'imagem2');
        const img3 = await obterUrlImagem('fileImagem3', 'imagem3');

        const id = produtoIdInput.value;
        const dadosProduto = {
            nome: nomeInput.value,
            preco: parseFloat(precoInput.value),
            categoria: categoriaSelect.value,
            tamanhos: tamanhosSelecionados.length > 0 ? tamanhosSelecionados : ['Único'],
            descricao: descricaoInput.value,
            imagem1: img1,
            imagem2: img2,
            imagem3: img3
        };

        if (id) {
            db.ref('produtos/' + id).update(dadosProduto)
                .then(() => mostrarAviso("Produto atualizado com sucesso!"))
                .finally(() => resetarFormulario());
        } else {
            db.ref('produtos').push(dadosProduto)
                .then(() => mostrarAviso("Produto cadastrado com sucesso!"))
                .finally(() => resetarFormulario());
        }
    });
}

// LISTAR PRODUTOS EM TEMPO REAL
function carregarProdutos() {
    if (!listaProdutos) return;
    db.ref('produtos').on('value', snapshot => {
        listaProdutos.innerHTML = '';
        let total = 0;

        snapshot.forEach(childSnapshot => {
            total++;
            const prod = childSnapshot.val();
            const key = childSnapshot.key;

            let tamanhosTexto = 'Único';
            if (Array.isArray(prod.tamanhos)) {
                tamanhosTexto = prod.tamanhos.join(', ');
            } else if (typeof prod.tamanhos === 'string') {
                tamanhosTexto = prod.tamanhos;
            }

            const fotoCapa = prod.imagem1 || prod.imagem || 'https://via.placeholder.com/70';

            const card = document.createElement('div');
            card.className = 'item-admin-produto';
            card.innerHTML = `
                <img src="${fotoCapa}" alt="${prod.nome}">
                <div class="item-info">
                    <div class="item-nome">${prod.nome}</div>
                    <div class="item-detalhes">${(prod.categoria || '').toUpperCase()} | Tamanhos: <strong>${tamanhosTexto}</strong></div>
                    <div class="item-preco">R$ ${parseFloat(prod.preco || 0).toFixed(2)}</div>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-editar" onclick="prepararEdicao('${key}')">Editar</button>
                    <button class="btn-acao btn-excluir" onclick="excluirProduto('${key}')">Excluir</button>
                </div>
            `;
            listaProdutos.appendChild(card);
        });

        if (totalProdutos) totalProdutos.textContent = total;
    });
}

// CARREGAR DADOS NO FORMULÁRIO PARA EDIÇÃO
window.prepararEdicao = function(id) {
    db.ref('produtos/' + id).once('value').then(snapshot => {
        const prod = snapshot.val();
        if (!prod) return;

        produtoIdInput.value = id;
        nomeInput.value = prod.nome || '';
        precoInput.value = prod.preco || '';
        categoriaSelect.value = prod.categoria || '';
        descricaoInput.value = prod.descricao || '';

        const tamanhosSalvos = Array.isArray(prod.tamanhos) 
            ? prod.tamanhos 
            : (prod.tamanhos ? prod.tamanhos.split(',').map(s => s.trim()) : []);

        document.querySelectorAll('input[name="tamanhos"]').forEach(cb => {
            cb.checked = tamanhosSalvos.includes(cb.value);
        });

        document.getElementById('imagem1').value = prod.imagem1 || prod.imagem || '';
        document.getElementById('imagem2').value = prod.imagem2 || '';
        document.getElementById('imagem3').value = prod.imagem3 || '';

        if (prod.imagem1 || prod.imagem) {
            document.getElementById('preview1').src = prod.imagem1 || prod.imagem;
            document.getElementById('preview1').style.display = 'block';
        }
        if (prod.imagem2) {
            document.getElementById('preview2').src = prod.imagem2;
            document.getElementById('preview2').style.display = 'block';
        }
        if (prod.imagem3) {
            document.getElementById('preview3').src = prod.imagem3;
            document.getElementById('preview3').style.display = 'block';
        }

        tituloForm.textContent = "Editar Produto";
        btnCancelar.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

// EXCLUIR PRODUTO
window.excluirProduto = function(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
        db.ref('produtos/' + id).remove()
            .then(() => mostrarAviso("Produto excluído com sucesso!"));
    }
};

if (btnCancelar) {
    btnCancelar.addEventListener('click', resetarFormulario);
}

function resetarFormulario() {
    produtoIdInput.value = '';
    formProduto.reset();
    document.querySelectorAll('input[name="tamanhos"]').forEach(cb => cb.checked = false);

    ['preview1', 'preview2', 'preview3'].forEach(id => {
        const p = document.getElementById(id);
        if (p) {
            p.src = '';
            p.style.display = 'none';
        }
    });

    tituloForm.textContent = "Cadastrar Novo Produto";
    btnCancelar.style.display = 'none';
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar Produto";
}

function mostrarAviso(msg) {
    if (!aviso) return;
    aviso.textContent = msg;
    aviso.className = "aviso sucesso";
    aviso.style.display = "block";
    setTimeout(() => {
        aviso.style.display = "none";
    }, 3000);
}
