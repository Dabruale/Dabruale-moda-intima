// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBVCANXtuWg2IMyY3xc1l5xdQ81A621jZ0",
    authDomain: "dabruale-a9712.firebaseapp.com",
    databaseURL: "https://dabruale-a9712-default-rtdb.firebaseio.com",
    projectId: "dabruale-a9712",
    storageBucket: "dabruale-a9712.firebasestorage.app",
    messagingSenderId: "904434904806",
    appId: "1:904434904806:web:2054057c62bd41aa361527"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
let listaProdutosGlobal = [];

// MONITORA SE O USUÁRIO ESTÁ LOGADO
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("adminPanel").style.display = "flex";
        carregarProdutos();
    } else {
        document.getElementById("loginContainer").style.display = "flex";
        document.getElementById("adminPanel").style.display = "none";
    }
});

// ==========================================
// AUTENTICAÇÃO / LOGIN
// ==========================================
function fazerLoginFirebase(e) {
    e.preventDefault();
    const email = document.getElementById("emailInput").value.trim();
    const senha = document.getElementById("senhaInput").value;
    const msgErro = document.getElementById("msgErro");
    const btnEntrar = document.getElementById("btnEntrar");

    btnEntrar.textContent = "Verificando...";
    btnEntrar.disabled = true;

    // Define para EXIGIR LOGIN SEMPRE QUE FECHAR O NAVEGADOR
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
            return auth.signInWithEmailAndPassword(email, senha);
        })
        .then(() => {
            msgErro.style.display = "none";
        })
        .catch((error) => {
            msgErro.textContent = "E-mail ou senha inválidos!";
            msgErro.style.display = "block";
        })
        .finally(() => {
            btnEntrar.textContent = "Acessar Painel";
            btnEntrar.disabled = false;
        });
}

function fazerLogoutFirebase() {
    auth.signOut();
}

// ==========================================
// UPLOAD DE FOTO PARA O CLOUDINARY
// ==========================================
async function carregarFotoLocal(event) {
    const file = event.target.files[0];
    const status = document.getElementById("statusFoto");

    if (!file) return;

    if (status) {
        status.style.display = "block";
        status.style.color = "#d81b60";
        status.textContent = "⏳ Enviando imagem para o Cloudinary...";
    }

    const cloudName = "oudqsxxs";
    const uploadPreset = "dabruale"; // Lembre-se de configurar este preset como 'Unsigned' no painel do Cloudinary

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.secure_url) {
            document.getElementById("imagem").value = data.secure_url;
            if (status) {
                status.style.color = "#2e7d32";
                status.textContent = "✅ Foto enviada com sucesso!";
            }
        } else {
            throw new Error(data.error ? data.error.message : "Falha ao enviar imagem");
        }
    } catch (err) {
        if (status) {
            status.style.color = "#d32f2f";
            status.textContent = "❌ Erro: " + err.message;
        }
    }
}

// ==========================================
// GERENCIAMENTO DE PRODUTOS
// ==========================================
function carregarProdutos() {
    db.ref("produtos").on("value", (snapshot) => {
        listaProdutosGlobal = [];
        snapshot.forEach((child) => {
            listaProdutosGlobal.push({
                id: child.key,
                ...child.val()
            });
        });
        renderizarLista();
    });
}

function renderizarLista() {
    const container = document.getElementById("listaProdutos");
    const badgeTotal = document.getElementById("totalProdutos");
    
    badgeTotal.textContent = listaProdutosGlobal.length;
    container.innerHTML = "";

    if (listaProdutosGlobal.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; color: #888; font-size: 0.85rem;'>Nenhum produto cadastrado ainda.</p>";
        return;
    }

    listaProdutosGlobal.forEach(prod => {
        const img = prod.imagem || 'https://via.placeholder.com/60';
        const precoFormatado = parseFloat(prod.preco || 0).toFixed(2).replace('.', ',');
        const tamanhosTxt = Array.isArray(prod.tamanhos) ? prod.tamanhos.join(', ') : (prod.tamanhos || 'N/A');

        const div = document.createElement("div");
        div.className = "item-admin-produto";
        div.innerHTML = `
            <img src="${img}" alt="${prod.nome}">
            <div class="item-info">
                <div class="item-nome">${prod.nome}</div>
                <div class="item-detalhes">Cat: <strong>${prod.categoria || 'Geral'}</strong> | Tam: <strong>${tamanhosTxt}</strong></div>
                <div class="item-preco">R$ ${precoFormatado}</div>
            </div>
            <div class="item-acoes">
                <button class="btn-acao btn-editar" onclick="prepararEdicao('${prod.id}')">✏️ Editar</button>
                <button class="btn-acao btn-excluir" onclick="excluirProduto('${prod.id}', '${prod.nome}')">🗑️ Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function salvarProduto(e) {
    e.preventDefault();

    const id = document.getElementById("produtoId").value;
    const nome = document.getElementById("nome").value.trim();
    const descricao = document.getElementById("descricao") ? document.getElementById("descricao").value.trim() : '';
    const preco = parseFloat(document.getElementById("preco").value);
    const categoria = document.getElementById("categoria").value;
    const tamanhosInput = document.getElementById("tamanhos").value.trim();
    const imagem = document.getElementById("imagem").value.trim();

    const tamanhosArr = tamanhosInput.split(',').map(t => t.trim()).filter(t => t !== '');

    const dadosProduto = {
        nome: nome,
        descricao: descricao,
        preco: preco,
        categoria: categoria,
        tamanhos: tamanhosArr,
        imagem: imagem
    };

    if (id) {
        db.ref("produtos/" + id).update(dadosProduto)
            .then(() => {
                mostrarAviso("✅ Produto atualizado com sucesso!");
                resetarFormulario();
            });
    } else {
        db.ref("produtos").push(dadosProduto)
            .then(() => {
                mostrarAviso("✅ Novo produto cadastrado!");
                resetarFormulario();
            });
    }
}

function prepararEdicao(id) {
    const prod = listaProdutosGlobal.find(p => p.id === id);
    if (!prod) return;

    document.getElementById("produtoId").value = prod.id;
    document.getElementById("nome").value = prod.nome || '';
    if (document.getElementById("descricao")) {
        document.getElementById("descricao").value = prod.descricao || '';
    }
    document.getElementById("preco").value = prod.preco || '';
    document.getElementById("categoria").value = prod.categoria || 'Calcinhas';
    
    const tamanhosTxt = Array.isArray(prod.tamanhos) ? prod.tamanhos.join(', ') : (prod.tamanhos || 'P, M, G, GG');
    document.getElementById("tamanhos").value = tamanhosTxt;
    document.getElementById("imagem").value = prod.imagem || '';

    document.getElementById("tituloForm").textContent = "✏️ Editar Produto";
    document.getElementById("btnSubmit").textContent = "💾 Salvar Alterações";
    document.getElementById("btnCancelar").style.display = "block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetarFormulario() {
    document.getElementById("formProduto").reset();
    document.getElementById("produtoId").value = "";
    document.getElementById("tamanhos").value = "P, M, G, GG";
    document.getElementById("tituloForm").textContent = "➕ Cadastrar Novo Produto";
    document.getElementById("btnSubmit").textContent = "💾 Salvar Produto";
    document.getElementById("btnCancelar").style.display = "none";

    const status = document.getElementById("statusFoto");
    if (status) status.style.display = "none";
}

function excluirProduto(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
        db.ref("produtos/" + id).remove()
            .then(() => {
                mostrarAviso("🗑️ Produto excluído com sucesso!");
            });
    }
}

function mostrarAviso(msg) {
    const box = document.getElementById("boxAviso");
    box.textContent = msg;
    box.className = "aviso sucesso";
    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 3000);
}
