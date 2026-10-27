// esta página será um componente de CLIENTE
// isso é necessário para poder ARMAZENAR ESTADO
// que estado?
// - login e senha: variáveis que estão relacionadas com elementos da tela
// - mensagem de erro
// - token
'use client';

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // variáveis de estado
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // roteador: para poder "encaminhar" para outra página, quando necessário
  const router = useRouter();

  // obter a URL do backend, a partir de uma variável de ambiente
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  {/* useEffect serve para executar um código
    depois que o React renderiza a página.
    Isso é importante pois o localStorage só
    vai ser acessado depois que a página
    estiver toda "desenhada", garantindo
    que o acesso ao localStorage vai
    ser realizado com sucesso */}

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // código que vai ser executado ao clicar no botão de login
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // faz a chamada ao backend, para obter a TOKEN
      const resposta = await fetch(apiUrl + '/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, senha }),
      });

      // recebe a resposta em json
      const dados = await resposta.json();

      // se o código HTTP da resposta for diferente de 2xx (200, 201, 204, etc)
      // OU se a resposta json (resultado) não for "ok"
      // resposta.ok é uma propriedade do fetch que é verdadeira se 
      // o resultado da requisição for 200, 201, ...
      // se o resultado (código) for 4xx ou 5xx, aí resposta.ok retorna falso
      if (!resposta.ok || dados.resultado !== "ok") {
        throw new Error(dados.detalhes || "Algo deu errado!");
      }
      // depurar, caso seja necessário
      // console.log(dados.resultado);
      // console.log(dados.detalhes);

      // se chegou até aqui (não parou no erro acima), 
      // armazena a token no localStorage

      // pega a token que veio na resposta
      const novoToken = dados.detalhes.token
      // armazena no localStorage
      localStorage.setItem("token", novoToken);
      // salva a token no "conjunto de estados" da página
      setToken(novoToken);

      // encaminha a página para a "raiz" (home)
      router.replace("/");

    }
    // em caso de algum erro...
    catch (err: unknown) {
      // configura mensagem de erro
      setError(err instanceof Error ? err.message : "Algo deu errado!");
    }
  }

  // ação do botão logout
  const handleLogout = () => {
    // remove a token do localStorage
    localStorage.removeItem("token");
    // apaga a token do estado interno
    setToken(null);
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto", textAlign: "center" }}>
      <h1
        className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
      >Login</h1>

      {error &&
        <p style={{ color: "red" }}>{error}</p>
      }

      {/* se hover token, mostra o "logout" */}
      {token && (
        <div>
          <p>Você está logado!!</p>

          <button
            onClick={handleLogout}
            className="cursor-pointer text-blue-600 underline hover:text-blue-900"
          >
            Logout
          </button>
        </div>
      )}

      {/* se não houver token, não está logado, 
      daí mostra o formulário */}

      {!token &&
        <form onSubmit={handleLogin}
          className="flex flex-col gap-4 w-full rounded-xl bg-white p-6 shadow-lg border border-gray-200"
        >
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="password"
            placeholder="Password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Entrar
          </button>
        </form>
      }
    </div>
  );
}