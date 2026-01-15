// USUÁRIOS DO SISTEMA (VOCÊ CONTROLA)
const usuarios = [
    {
        usuario: "Felipe",
        senha: "11172026"
    },
    {
        usuario: "AnaCaroline",
        senha: "11172026"
    }
];

document.getElementById("formLogin").addEventListener("submit", e => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const valido = usuarios.find(
        u => u.usuario === usuario && u.senha === senha
    );

    if (!valido) {
        alert("Usuário ou senha inválidos!");
        return;
    }

    // SALVAR SESSÃO
    localStorage.setItem("usuarioLogado", usuario);

    // REDIRECIONAR PARA O SISTEMA
    window.location.href = "index.html";
});
