// =========================================================
// CONFIGURAÇÃO DO CLOUDINARY
// =========================================================
const CLOUD_NAME = "oudqsxxs";  
const UPLOAD_PRESET = "dabruale";

// =========================================================
// CONFIGURAÇÃO DO FIREBASE
// =========================================================
const firebaseConfig = {
    apiKey: "AIzaSyCqx6LI-yLh-wwjiSB6JsmYDHIYGG-SO4k",
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
const database = firebase.database();

// Cache local de produtos para edição rápida
let produtosCache = {};

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

// PREVIEW DAS IMAGENS NA TELA
window.previewImagem = function (input, previewId) {
    const preview = document.getElementById(previewId);
    if (preview && input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// --- COMPRESSÃO DE IMAGEM ANTES DO UPLOAD ---
function comprimirImagem(file, maxWidth = 1000, maxQuality = 0.75) {
    return new Promise((resolve) => {
        if (!file.type.match(/image.*/)) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }
                    const arquivoComprimido = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(arquivoComprimido);
                }, 'image/jpeg', maxQuality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}

// --- UPLOAD PARA CLOUDINARY ---
async function processarImagem(fileInput, urlInput) {
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const arquivoOriginal = fileInput.files[0];
        const arquivoComprimido = await comprimirImagem(arquivoOriginal);

        const formData = new FormData();
        formData.append('file', arquivoComprimido);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error(data.error ? data.error.message : "Erro ao enviar imagem ao Cloudinary.");
            }
        } catch (err) {
            throw new Error("Falha no upload da imagem: " + err.message);
        }
    }
    return urlInput ? urlInput.value.trim() : "";
}

// LOGIN
if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();

        if (erroLogin) erroLogin.style.display = 'none';

        auth.signInWithEmailAndPassword(email, senha)
            .catch((error) => {
                if (erroLogin) {
                    erroLogin.style.display = 'block';
                    erroLogin.innerText = "Erro ao entrar: " + error.message;
                } else {
                    alert("Erro ao entrar: " + error.message);
                }
            });
    });
}

// MONITOR DE AUTENTICAÇÃO
auth.onAuthStateChanged((user) => {
    if (user) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'flex';
        carregarProdutos();
    } else {
        if (loginContainer) loginContainer.style.display = 'flex';
        if (adminPanel) adminPanel.style.display = 'none';
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

        if (btnSalvar) {
            btnSalvar.disabled = true;
            btnSalvar.innerText = "Otimizando e enviando fotos...";
        }

        try {
            const file1 = document.getElementById('fileImagem1');
            const url1 = document.getElementById('imagem1');
            const file2 = document.getElementById('fileImagem2');
            const url2 = document.getElementById('imagem2');
            const file3 = document.getElementById('fileImagem3');
            const url3 = document.getElementById('imagem3');

            // Processar e otimizar fotos
            const img1 = await processarImagem(file1, url1);
            const img2 = await processarImagem(file2, url2);
            const img3 = await processarImagem(file3, url3);

            if (!img1) {
                alert("A Foto 1 (Principal) é obrigatória!");
                if (btnSalvar) {
                    btnSalvar.disabled = false;
                    btnSalvar.innerText = "Salvar Produto";
                }
                return;
            }

            // Captura os tamanhos selecionados nos checkboxes
            const checkboxesTamanhos = document.querySelectorAll('input[name="tamanhos"]:checked');
            const tamanhosSelecionados = Array.from(checkboxesTamanhos).map(cb => cb.value);

            const dadosProduto = {
                nome: nomeInput ? nomeInput.value.trim() : "",
                preco: precoInput ? parseFloat(precoInput.value) : 0,
                categoria: categoriaInput ? categoriaInput.value : "",
                tamanhos: tamanhosSelecionados.length > 0 ? tamanhosSelecionados : ["Tamanho Único"],
                imagem: img1,
                imagem1: img1,
                imagem2: img2 || "",
                imagem3: img3 || "",
                descricao: descricaoInput ? descricaoInput.value.trim() : ""
            };

            const id = produtoId ? produtoId.value : "";

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
            if (btnSalvar) {
                btnSalvar.disabled = false;
                btnSalvar.innerText = "Salvar Produto";
            }
        }
    });
}

// CARREGAR LISTA DE PRODUTOS
function carregarProdutos() {
    if (!listaProdutos) return;

    database.ref('produtos').on('value', (snapshot) => {
        listaProdutos.innerHTML = '';
        if (totalProdutos) totalProdutos.innerText = '0';
        produtosCache = {};
        let total = 0;

        snapshot.forEach((childSnapshot) => {
            total++;
            const id = childSnapshot.key;
            const p = childSnapshot.val();
            produtosCache[id] = p;

            const fotoCapa = p.imagem || p.imagem1 || 'https://via.placeholder.com/60';
            
            // Tratamento flexível de tamanhos (suporta Arrays e cadastros antigos em Texto)
            let listaTamanhos = 'Único';
            if (Array.isArray(p.tamanhos) && p.tamanhos.length > 0) {
                listaTamanhos = p.tamanhos.join(', ');
            } else if (typeof p.tamanhos === 'string' && p.tamanhos.trim() !== '') {
                listaTamanhos = p.tamanhos;
            }

            const card = document.createElement('div');
            card.className = 'item-admin-produto';
            card.innerHTML = `
                <img src="${fotoCapa}" alt="${p.nome || ''}">
                <div class="item-info">
                    <div class="item-nome">${p.nome || 'Sem nome'}</div>
                    <div class="item-detalhes">${p.categoria ? p.categoria.toUpperCase() : ''} | Tamanhos: <strong>${listaTamanhos}</strong></div>
                    <div class="item-preco">R$ ${parseFloat(p.preco || 0).toFixed(2)}</div>
                </div>
                <div class="item-acoes">
                    <button class="btn-acao btn-editar" onclick="editarProduto('${id}')">Editar</button>
                    <button class="btn-acao btn-excluir" onclick="excluirProduto('${id}')">Excluir</button>
                </div>
            `;
            listaProdutos.appendChild(card);
        });

        if (totalProdutos) totalProdutos.innerText = total;
    });
}

// EDITAR PRODUTO
window.editarProduto = function (id) {
    const p = produtosCache[id];
    if (!p) return;

    if (produtoId) produtoId.value = id;
    if (nomeInput) nomeInput.value = p.nome || '';
    if (precoInput) precoInput.value = p.preco || '';
    if (categoriaInput) categoriaInput.value = p.categoria || '';

    // Limpar todas as caixas de seleção primeiro
    document.querySelectorAll('input[name="tamanhos"]').forEach(cb => cb.checked = false);

    // Normalizar a leitura dos tamanhos salvos
    let tamanhosParaMarcar = [];
    if (Array.isArray(p.tamanhos)) {
        tamanhosParaMarcar = p.tamanhos;
    } else if (typeof p.tamanhos === 'string') {
        tamanhosParaMarcar = p.tamanhos.split(',').map(s => s.trim());
    }

    // Marcar no formulário os tamanhos encontrados
    tamanhosParaMarcar.forEach(tam => {
        const cb = document.querySelector(`input[name="tamanhos"][value="${tam}"]`);
        if (cb) cb.checked = true;
    });

    const img1Val = p.imagem1 || p.imagem || '';
    const img2Val = p.imagem2 || '';
    const img3Val = p.imagem3 || '';

    if (document.getElementById('imagem1')) document.getElementById('imagem1').value = img1Val;
    if (document.getElementById('imagem2')) document.getElementById('imagem2').value = img2Val;
    if (document.getElementById('imagem3')) document.getElementById('imagem3').value = img3Val;

    const p1 = document.getElementById('preview1');
    if (p1) {
        p1.src = img1Val;
        p1.style.display = img1Val ? 'block' : 'none';
    }

    const p2 = document.getElementById('preview2');
    if (p2) {
        p2.src = img2Val;
        p2.style.display = img2Val ? 'block' : 'none';
    }

    const p3 = document.getElementById('preview3');
    if (p3) {
        p3.src = img3Val;
        p3.style.display = img3Val ? 'block' : 'none';
    }

    if (document.getElementById('fileImagem1')) document.getElementById('fileImagem1').value = '';
    if (document.getElementById('fileImagem2')) document.getElementById('fileImagem2').value = '';
    if (document.getElementById('fileImagem3')) document.getElementById('fileImagem3').value = '';

    if (descricaoInput) descricaoInput.value = p.descricao || '';

    if (tituloForm) tituloForm.innerText = "Editar Produto";
    if (btnSalvar) btnSalvar.innerText = "Atualizar Produto";
    if (btnCancelar) btnCancelar.style.display = "block";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// EXCLUIR PRODUTO
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
    if (formProduto) formProduto.reset();
    if (produtoId) produtoId.value = '';
    
    document.querySelectorAll('input[name="tamanhos"]').forEach(cb => cb.checked = false);

    ['preview1', 'preview2', 'preview3'].forEach(id => {
        const preview = document.getElementById(id);
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
    });

    if (tituloForm) tituloForm.innerText = "Cadastrar Novo Produto";
    if (btnSalvar) btnSalvar.innerText = "Salvar Produto";
    if (btnCancelar) btnCancelar.style.display = "none";
}

function mostrarAviso(mensagem) {
    if (!aviso) return;
    aviso.innerText = mensagem;
    aviso.className = "aviso sucesso";
    aviso.style.display = "block";
    setTimeout(() => { aviso.style.display = "none"; }, 3000);
}
