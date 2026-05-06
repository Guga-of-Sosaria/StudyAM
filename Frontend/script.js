let usuarios = [
    {
        id: 1,
        nome: "Administrador",
        email: "admin@studyam.com",
        senha: "admin123",
        tipo: "admin",
        status: "ativo",
        dataCadastro: "2024-01-01",
        avatar: "https://ui-avatars.com/api/?background=2563eb&color=fff&name=Admin"
    },
    {
        id: 2,
        nome: "João Silva",
        email: "joao@studyam.com",
        senha: "123456",
        tipo: "student",
        status: "ativo",
        dataCadastro: "2024-01-15",
        avatar: "https://ui-avatars.com/api/?background=f97316&color=fff&name=Joao"
    }
];

let currentUserType = 'student';
let currentUser = null;
let selectedUserType = 'student';
let selectedRegisterType = 'student';
let resetEmail = null;
let recoveryCode = null;
let logoAtual = null;

let lembretes = [
    { id: 1, titulo: 'Estudar React', data: '2024-12-05', hora: '14:00', prioridade: 'alta', concluido: false, usuarioId: 2 },
    { id: 2, titulo: 'Revisar matemática', data: '2024-12-06', hora: '09:00', prioridade: 'media', concluido: false, usuarioId: 2 }
];
let quizzes = [];
let materias = [];
let cronogramas = [];
let tarefas = [];
let flashcards = [];
let metas = [];
let historico = [];
let pontosUsuario = {};
let nivelUsuario = {};

function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoAtual = e.target.result;
            const logos = document.querySelectorAll('.site-logo, .sidebar-logo-img');
            logos.forEach(logo => {
                logo.src = logoAtual;
            });
            localStorage.setItem('studyam_logo', logoAtual);
            showNotification('Logo atualizada com sucesso!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function carregarLogoSalva() {
    const logoSalva = localStorage.getItem('studyam_logo');
    if (logoSalva) {
        logoAtual = logoSalva;
        const logos = document.querySelectorAll('.site-logo, .sidebar-logo-img');
        logos.forEach(logo => {
            logo.src = logoSalva;
        });
    }
}

function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function selectUserType(type) {
    selectedUserType = type;
    document.getElementById('studentTypeBtn').classList.remove('active');
    document.getElementById('adminTypeBtn').classList.remove('active');
    if (type === 'student') {
        document.getElementById('studentTypeBtn').classList.add('active');
    } else {
        document.getElementById('adminTypeBtn').classList.add('active');
    }
}

function selectRegisterType(type) {
    selectedRegisterType = type;
    document.getElementById('regStudentBtn').classList.remove('active');
    document.getElementById('regAdminBtn').classList.remove('active');
    if (type === 'student') {
        document.getElementById('regStudentBtn').classList.add('active');
    } else {
        document.getElementById('regAdminBtn').classList.add('active');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

function register() {
    const nome = document.getElementById('regNome').value;
    const email = document.getElementById('regEmail').value;
    const senha = document.getElementById('regPassword').value;
    const confirmSenha = document.getElementById('regConfirmPassword').value;
    const termos = document.getElementById('acceptTerms').checked;
    
    if (!nome || !email || !senha) {
        showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    if (senha !== confirmSenha) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    if (senha.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    if (!termos) {
        showNotification('Aceite os termos de uso!', 'error');
        return;
    }
    
    const usuarioExistente = usuarios.find(u => u.email === email);
    if (usuarioExistente) {
        showNotification('Este e-mail já está cadastrado!', 'error');
        return;
    }
    
    const novoUsuario = {
        id: usuarios.length + 1,
        nome: nome,
        email: email,
        senha: senha,
        tipo: selectedRegisterType,
        status: 'ativo',
        dataCadastro: new Date().toLocaleDateString(),
        avatar: `https://ui-avatars.com/api/?background=${selectedRegisterType === 'admin' ? '2563eb' : 'f97316'}&color=fff&name=${nome.split(' ')[0]}`
    };
    
    usuarios.push(novoUsuario);
    pontosUsuario[novoUsuario.id] = 0;
    nivelUsuario[novoUsuario.id] = 1;
    
    showNotification(`Conta criada com sucesso! Faça login para continuar.`, 'success');
    
    document.getElementById('regNome').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
    document.getElementById('acceptTerms').checked = false;
    
    switchTab('login');
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    const usuario = usuarios.find(u => u.email === email && u.senha === password);
    
    if (!usuario) {
        showNotification('E-mail ou senha incorretos!', 'error');
        return;
    }
    
    if (usuario.status !== 'ativo') {
        showNotification('Usuário inativo! Contate o administrador.', 'error');
        return;
    }
    
    if (usuario.tipo !== selectedUserType) {
        showNotification(`Este usuário é do tipo ${usuario.tipo === 'admin' ? 'Administrador' : 'Estudante'}!`, 'error');
        return;
    }
    
    currentUser = usuario;
    currentUserType = usuario.tipo;
    
    document.getElementById('preloader').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
    }, 500);
    
    if (currentUserType === 'admin') {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        document.getElementById('adminUserName').textContent = usuario.nome;
        document.getElementById('adminUserEmail').textContent = usuario.email;
        showSection('adminOverview');
    } else {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'flex';
        document.getElementById('studentUserName').textContent = usuario.nome;
        document.getElementById('studentUserEmail').textContent = usuario.email;
        showSection('studentOverview');
    }
    
    showNotification(`Bem-vindo(a) ${usuario.nome}!`, 'success');
    adicionarPontos(50);
}

function logout() {
    currentUser = null;
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    showNotification('Logout realizado com sucesso!', 'info');
}

function showForgotPassword() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('forgotContainer').style.display = 'flex';
}

function backToLoginFromForgot() {
    document.getElementById('forgotContainer').style.display = 'none';
    document.getElementById('verifyCodeContainer').style.display = 'none';
    document.getElementById('resetPasswordContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
}

function backToForgot() {
    document.getElementById('verifyCodeContainer').style.display = 'none';
    document.getElementById('forgotContainer').style.display = 'flex';
    resetEmail = null;
    recoveryCode = null;
}

function backToVerifyCode() {
    document.getElementById('resetPasswordContainer').style.display = 'none';
    document.getElementById('verifyCodeContainer').style.display = 'flex';
}

function sendRecoveryCode() {
    const email = document.getElementById('forgotEmail').value;
    
    if (!email) {
        showNotification('Digite seu e-mail', 'error');
        return;
    }
    
    const usuario = usuarios.find(u => u.email === email);
    
    if (!usuario) {
        showNotification('E-mail não encontrado!', 'error');
        return;
    }
    
    resetEmail = email;
    recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Código de recuperação para ${email}: ${recoveryCode}`);
    
    showNotification(`Código enviado para ${email}! (Demo: ${recoveryCode})`, 'success');
    
    document.getElementById('forgotContainer').style.display = 'none';
    document.getElementById('verifyCodeContainer').style.display = 'flex';
    
    document.getElementById('code1').value = '';
    document.getElementById('code2').value = '';
    document.getElementById('code3').value = '';
    document.getElementById('code4').value = '';
    document.getElementById('code5').value = '';
    document.getElementById('code6').value = '';
    document.getElementById('code1').focus();
}

function moveToNext(current, nextId) {
    if (current.value.length === 1) {
        const next = document.getElementById(nextId);
        if (next) {
            next.focus();
        }
    }
}

function validateCode() {
    const code1 = document.getElementById('code1').value;
    const code2 = document.getElementById('code2').value;
    const code3 = document.getElementById('code3').value;
    const code4 = document.getElementById('code4').value;
    const code5 = document.getElementById('code5').value;
    const code6 = document.getElementById('code6').value;
    
    const insertedCode = code1 + code2 + code3 + code4 + code5 + code6;
    
    if (insertedCode.length === 6 && insertedCode === recoveryCode) {
        verifyRecoveryCode();
    }
}

function verifyRecoveryCode() {
    const code1 = document.getElementById('code1').value;
    const code2 = document.getElementById('code2').value;
    const code3 = document.getElementById('code3').value;
    const code4 = document.getElementById('code4').value;
    const code5 = document.getElementById('code5').value;
    const code6 = document.getElementById('code6').value;
    
    const insertedCode = code1 + code2 + code3 + code4 + code5 + code6;
    
    if (insertedCode.length !== 6) {
        showNotification('Digite o código completo de 6 dígitos', 'error');
        return;
    }
    
    if (insertedCode === recoveryCode) {
        showNotification('Código verificado com sucesso!', 'success');
        document.getElementById('verifyCodeContainer').style.display = 'none';
        document.getElementById('resetPasswordContainer').style.display = 'flex';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    } else {
        showNotification('Código inválido! Tente novamente.', 'error');
    }
}

function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }
    
    const usuario = usuarios.find(u => u.email === resetEmail);
    
    if (usuario) {
        usuario.senha = newPassword;
        showNotification('Senha alterada com sucesso! Faça login.', 'success');
        
        resetEmail = null;
        recoveryCode = null;
        
        document.getElementById('resetPasswordContainer').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

function showDemo() {
    const demoUser = {
        id: 999,
        nome: "Usuário Demo",
        email: "demo@studyam.com",
        senha: "demo123",
        tipo: "student",
        status: "ativo",
        dataCadastro: new Date().toLocaleDateString(),
        avatar: "https://ui-avatars.com/api/?background=f97316&color=fff&name=Demo"
    };
    
    currentUser = demoUser;
    currentUserType = 'student';
    
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'flex';
    document.getElementById('studentUserName').textContent = demoUser.nome;
    document.getElementById('studentUserEmail').textContent = demoUser.email;
    showSection('studentOverview');
    
    showNotification('Modo demonstração ativado!', 'info');
}

function adicionarPontos(pontos) {
    if (!currentUser) return;
    
    if (!pontosUsuario[currentUser.id]) {
        pontosUsuario[currentUser.id] = 0;
    }
    
    pontosUsuario[currentUser.id] += pontos;
    
    const novoNivel = Math.floor(pontosUsuario[currentUser.id] / 1000) + 1;
    if (novoNivel > nivelUsuario[currentUser.id]) {
        nivelUsuario[currentUser.id] = novoNivel;
        showNotification(`🎉 Parabéns! Você alcançou o nível ${novoNivel}!`, 'success');
    }
}

function showSection(sectionName) {
    const userPrefix = currentUserType === 'admin' ? 'admin' : 'student';
    
    switch(sectionName) {
        case 'adminOverview':
            renderAdminOverview();
            break;
        case 'studentOverview':
            renderStudentOverview();
            break;
        case 'adminUsuarios':
            renderGerenciarUsuarios();
            break;
        default:
            document.getElementById(`${userPrefix}Content`).innerHTML = `
                <div class="content-card">
                    <h3>Funcionalidade em desenvolvimento</h3>
                    <p>Em breve disponível!</p>
                </div>
            `;
    }
    
    const pageTitle = document.getElementById(currentUserType === 'admin' ? 'pageTitle' : 'pageTitleStudent');
    if (pageTitle) {
        const title = sectionName.replace(/admin|student/, '').replace(/([A-Z])/g, ' $1').trim();
        pageTitle.textContent = title || 'Visão Geral';
    }
}

function renderAdminOverview() {
    const stats = {
        totalUsuarios: usuarios.length,
        usuariosAtivos: usuarios.filter(u => u.status === 'ativo').length,
        totalLembretes: lembretes.length,
        totalQuizzes: quizzes.length
    };
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Total de Usuários</h3>
                    <div class="stat-number">${stats.totalUsuarios}</div>
                    <small>${stats.usuariosAtivos} ativos</small>
                </div>
                <div class="stat-icon"><i class="fas fa-users"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Lembretes Criados</h3>
                    <div class="stat-number">${stats.totalLembretes}</div>
                    <small>em todo sistema</small>
                </div>
                <div class="stat-icon"><i class="fas fa-bell"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Quizzes Gerados</h3>
                    <div class="stat-number">${stats.totalQuizzes}</div>
                    <small>por IA</small>
                </div>
                <div class="stat-icon"><i class="fas fa-brain"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Nível do Sistema</h3>
                    <div class="stat-number">v2.0</div>
                    <small>Premium</small>
                </div>
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            </div>
        </div>
        <div class="content-card">
            <div class="card-header">
                <h3>Últimos Usuários Cadastrados</h3>
            </div>
            <div class="users-table">
                <table>
                    <thead>
                        <tr><th>Usuário</th><th>E-mail</th><th>Tipo</th><th>Data</th></tr>
                    </thead>
                    <tbody>
                        ${usuarios.slice(-5).reverse().map(user => `
                            <tr>
                                <td>${user.nome}</td>
                                <td>${user.email}</td>
                                <td>${user.tipo === 'admin' ? 'Admin' : 'Estudante'}</td>
                                <td>${user.dataCadastro}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('adminContent').innerHTML = html;
}

function renderStudentOverview() {
    const userPontos = pontosUsuario[currentUser?.id] || 0;
    const userNivel = nivelUsuario[currentUser?.id] || 1;
    const proximoNivel = (userNivel * 1000) - userPontos;
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Meus Pontos</h3>
                    <div class="stat-number">${userPontos}</div>
                    <small>Nível ${userNivel}</small>
                </div>
                <div class="stat-icon"><i class="fas fa-star"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Próximo Nível</h3>
                    <div class="stat-number">${proximoNivel > 0 ? proximoNivel : 0}</div>
                    <small>pontos restantes</small>
                </div>
                <div class="stat-icon"><i class="fas fa-arrow-up"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Lembretes</h3>
                    <div class="stat-number">${lembretes.filter(l => l.usuarioId === currentUser?.id).length}</div>
                    <small>ativos</small>
                </div>
                <div class="stat-icon"><i class="fas fa-bell"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>Taxa de Conclusão</h3>
                    <div class="stat-number">68%</div>
                    <small>+12% este mês</small>
                </div>
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            </div>
        </div>
        <div class="content-card">
            <div class="card-header">
                <h3>Minhas Próximas Atividades</h3>
                <button onclick="showSection('studentLembretes')" class="btn-secondary">Ver todas</button>
            </div>
            <div id="proximasAtividades">
                ${lembretes.filter(l => l.usuarioId === currentUser?.id && !l.concluido).slice(0, 3).map(lembrete => `
                    <div style="padding: 15px; border-bottom: 1px solid var(--gray-200);">
                        <strong>📌 ${lembrete.titulo}</strong>
                        <p style="font-size: 14px; color: var(--gray-500); margin-top: 5px;">📅 ${lembrete.data} às ${lembrete.hora}</p>
                    </div>
                `).join('')}
                ${lembretes.filter(l => l.usuarioId === currentUser?.id && !l.concluido).length === 0 ? '<p style="text-align:center; color:gray;">Nenhuma atividade pendente</p>' : ''}
            </div>
        </div>
    `;
    
    document.getElementById('studentContent').innerHTML = html;
}

function renderGerenciarUsuarios() {
    const html = `
        <div class="content-card">
            <div class="card-header">
                <h3>👥 Gerenciar Usuários</h3>
                <button onclick="mostrarModalCadastroUsuario()" class="btn-primary">
                    <i class="fas fa-user-plus"></i> Novo Usuário
                </button>
            </div>
            <div class="users-table">
                <table>
                    <thead>
                        <tr><th>ID</th><th>Usuário</th><th>E-mail</th><th>Tipo</th><th>Status</th><th>Data Cadastro</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="${user.avatar}" style="width: 35px; height: 35px; border-radius: 50%;">
                                        <strong>${user.nome}</strong>
                                    </div>
                                </td>
                                <td>${user.email}</td>
                                <td>
                                    <span class="status-badge" style="background: ${user.tipo === 'admin' ? '#dbeafe' : '#fed7aa'}; color: ${user.tipo === 'admin' ? '#1e40af' : '#9a3412'}">
                                        ${user.tipo === 'admin' ? 'Administrador' : 'Estudante'}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge ${user.status === 'ativo' ? 'status-active' : 'status-inactive'}">
                                        ${user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>${user.dataCadastro}</td>
                                <td>
                                    <button onclick="editarUsuario(${user.id})" class="btn-edit" style="margin-right: 5px;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="toggleUserStatus(${user.id})" class="btn-${user.status === 'ativo' ? 'delete' : 'edit'}">
                                        <i class="fas fa-${user.status === 'ativo' ? 'ban' : 'check'}"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('adminContent').innerHTML = html;
    document.getElementById('usuariosCount').textContent = usuarios.length;
}

function mostrarModalCadastroUsuario() {
    const nome = prompt('Nome completo:');
    const email = prompt('E-mail:');
    const senha = prompt('Senha:');
    const tipo = confirm('Criar como administrador? Clique OK para Admin, Cancelar para Estudante') ? 'admin' : 'student';
    
    if (nome && email && senha) {
        const novoUsuario = {
            id: usuarios.length + 1,
            nome: nome,
            email: email,
            senha: senha,
            tipo: tipo,
            status: 'ativo',
            dataCadastro: new Date().toLocaleDateString(),
            avatar: `https://ui-avatars.com/api/?background=${tipo === 'admin' ? '2563eb' : 'f97316'}&color=fff&name=${nome.split(' ')[0]}`
        };
        
        usuarios.push(novoUsuario);
        pontosUsuario[novoUsuario.id] = 0;
        nivelUsuario[novoUsuario.id] = 1;
        
        showNotification(`Usuário ${nome} criado com sucesso!`, 'success');
        renderGerenciarUsuarios();
    }
}

function editarUsuario(id) {
    const user = usuarios.find(u => u.id === id);
    if (!user) return;
    
    const novoNome = prompt('Novo nome:', user.nome);
    const novoEmail = prompt('Novo e-mail:', user.email);
    
    if (novoNome) user.nome = novoNome;
    if (novoEmail) user.email = novoEmail;
    
    showNotification('Usuário atualizado!', 'success');
    renderGerenciarUsuarios();
}

function toggleUserStatus(id) {
    const user = usuarios.find(u => u.id === id);
    if (user) {
        user.status = user.status === 'ativo' ? 'inativo' : 'ativo';
        showNotification(`Usuário ${user.nome} ${user.status === 'ativo' ? 'ativado' : 'desativado'}!`, 'success');
        renderGerenciarUsuarios();
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

window.onload = () => {
    carregarLogoSalva();
    selectUserType('student');
    selectRegisterType('student');
    
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 1500);
};