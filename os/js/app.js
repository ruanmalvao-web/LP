import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

// Estado global simples da aplicação
const state = {
  user: null,
  profile: null,
  activeTab: "os"
};

// Elementos da interface
const elLoading = document.getElementById("screen-loading");
const elLogin = document.getElementById("screen-login");
const elApp = document.getElementById("screen-app");
const elLoginForm = document.getElementById("login-form");
const elLoginBtn = document.getElementById("login-btn");
const elLoginError = document.getElementById("login-error");
const elUserEmail = document.getElementById("user-email");
const elUserRole = document.getElementById("user-role");
const elLogoutBtn = document.getElementById("btn-logout");
const elTabContent = document.getElementById("tab-content");
const navButtons = document.querySelectorAll("[data-tab]");

// Traduz códigos de erro do Firebase Auth para português
function formatAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
    case "auth/operation-not-allowed":
      return "Login por E-mail/Senha ainda não foi ativado no console do Firebase.";
    case "auth/network-request-failed":
      return "Sem conexão com a internet. Verifique sua rede.";
    default:
      return `Erro ao entrar (${code || "desconhecido"}).`;
  }
}

function showScreen(screen) {
  elLoading.classList.add("hidden");
  elLogin.classList.add("hidden");
  elApp.classList.add("hidden");

  if (screen === "loading") elLoading.classList.remove("hidden");
  if (screen === "login") elLogin.classList.remove("hidden");
  if (screen === "app") elApp.classList.remove("hidden");
}

// Busca ou cria o perfil do colaborador no Firestore
async function loadUserProfile(user) {
  try {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { ...snap.data(), firestoreOk: true };
    }

    const newProfile = {
      uid: user.uid,
      email: user.email,
      nome: user.displayName || user.email.split("@")[0],
      perfil: "tecnico", // tecnico | secretaria | admin
      ativo: true,
      criadoEm: serverTimestamp()
    };

    await setDoc(ref, newProfile);
    return { ...newProfile, firestoreOk: true };
  } catch (err) {
    console.warn("Firestore ainda não configurado ou bloqueado:", err);
    return {
      uid: user.uid,
      email: user.email,
      nome: user.displayName || user.email.split("@")[0],
      perfil: "tecnico",
      firestoreOk: false,
      firestoreError: err.code || err.message
    };
  }
}

function roleLabel(perfil) {
  if (perfil === "admin") return "Administrador";
  if (perfil === "secretaria") return "Secretária";
  return "Técnico";
}

function setActiveTab(tab) {
  state.activeTab = tab;
  navButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("text-primary", isActive);
    btn.classList.toggle("font-semibold", isActive);
    btn.classList.toggle("text-gray-400", !isActive);
  });
  renderTab();
}

function renderTab() {
  const { profile, user } = state;

  if (state.activeTab === "os") {
    elTabContent.innerHTML = `
      <div class="space-y-4">
        <div class="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-5 shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wider opacity-80">Grupo Litoral Seg</p>
              <h2 class="text-xl font-bold mt-1">Olá, ${profile?.nome || "Colaborador"}</h2>
              <p class="text-sm opacity-90 mt-1">Ambiente GLS-OS conectado ao Firebase.</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span><i class="fa-solid fa-circle-check mr-1"></i> Auth ativo</span>
            <span>
              ${
                profile?.firestoreOk
                  ? '<i class="fa-solid fa-database mr-1"></i> Firestore conectado'
                  : '<i class="fa-solid fa-triangle-exclamation mr-1 text-amber-200"></i> Firestore pendente'
              }
            </span>
          </div>
        </div>

        ${
          !profile?.firestoreOk
            ? `<div class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
                <p class="font-semibold mb-1"><i class="fa-solid fa-circle-info mr-1"></i> Cloud Firestore ainda não ativado</p>
                <p class="text-xs leading-relaxed">O login já está funcionando! Para salvar Ordens de Serviço, ative o <strong>Firestore Database</strong> no console do Firebase.</p>
              </div>`
            : ""
        }

        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <div class="text-2xl font-bold text-primary">0</div>
            <div class="text-[11px] text-gray-500 uppercase mt-1">Abertas</div>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <div class="text-2xl font-bold text-amber-500">0</div>
            <div class="text-[11px] text-gray-500 uppercase mt-1">Em Campo</div>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <div class="text-2xl font-bold text-emerald-600">0</div>
            <div class="text-[11px] text-gray-500 uppercase mt-1">Concluídas</div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
          <div class="w-12 h-12 rounded-full bg-primary-light text-primary mx-auto flex items-center justify-center text-xl mb-3">
            <i class="fa-solid fa-wrench"></i>
          </div>
          <h3 class="font-semibold text-gray-800">Nenhuma OS cadastrada</h3>
          <p class="text-sm text-gray-500 mt-1">A estrutura de Ordens de Serviço será habilitada na próxima etapa.</p>
          <button id="btn-go-nova" class="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
            <i class="fa-solid fa-plus"></i> Abrir Nova OS
          </button>
        </div>
      </div>
    `;

    const btnGoNova = document.getElementById("btn-go-nova");
    if (btnGoNova) btnGoNova.addEventListener("click", () => setActiveTab("nova"));
    return;
  }

  if (state.activeTab === "nova") {
    elTabContent.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-1">Nova Ordem de Serviço</h2>
        <p class="text-xs text-gray-500 mb-4">Em breve: busca de clientes via API OpenAPI 3, fotos, vídeos e assinatura na tela.</p>
        <div class="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center text-sm text-gray-500">
          <i class="fa-solid fa-hammer text-2xl text-primary mb-2 block"></i>
          Formulário de abertura de OS será construído na <strong>Fase 2</strong>.
        </div>
      </div>
    `;
    return;
  }

  if (state.activeTab === "perfil") {
    elTabContent.innerHTML = `
      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
            ${(profile?.nome || user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <h2 class="font-bold text-gray-900">${profile?.nome || "Colaborador"}</h2>
            <p class="text-xs text-gray-500">${user?.email || ""}</p>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Perfil</span>
            <span class="font-semibold text-primary">${roleLabel(profile?.perfil)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Banco (Firestore)</span>
            <span class="font-semibold ${profile?.firestoreOk ? "text-emerald-600" : "text-amber-600"}">
              ${profile?.firestoreOk ? "Conectado" : "Aguardando ativação"}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Projeto Firebase</span>
            <span class="font-mono text-xs text-gray-700">gls-os-80d40</span>
          </div>
        </div>
        <button id="btn-logout-profile" class="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition">
          <i class="fa-solid fa-right-from-bracket mr-1"></i> Sair da conta
        </button>
      </div>
    `;
    document.getElementById("btn-logout-profile")?.addEventListener("click", handleLogout);
  }
}

async function handleLogout() {
  await signOut(auth);
}

// Eventos
elLoginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  elLoginError.classList.add("hidden");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  elLoginBtn.disabled = true;
  elLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Entrando...';

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    elLoginError.textContent = formatAuthError(err.code);
    elLoginError.classList.remove("hidden");
  } finally {
    elLoginBtn.disabled = false;
    elLoginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i>Entrar';
  }
});

elLogoutBtn.addEventListener("click", handleLogout);

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
});

// Observador de sessão do Firebase Auth
onAuthStateChanged(auth, async (user) => {
  if (user) {
    state.user = user;
    state.profile = await loadUserProfile(user);
    elUserEmail.textContent = state.profile.nome || user.email;
    elUserRole.textContent = roleLabel(state.profile.perfil);
    showScreen("app");
    setActiveTab("os");
  } else {
    state.user = null;
    state.profile = null;
    showScreen("login");
  }
});
