'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

export default function FormIncluirMusica() {

  // um "estado" para cada campo do formulário
  const [titulo, setTitulo] = useState<string>("");
  const [artista, setArtista] = useState<string>("");
  const [genero, setGenero] = useState<string>("");
  const [ano, setAno] = useState<string>("");
  const [duracao, setDuracao] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // a token do login (null = ninguém logado)
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  // endereço do backend, vindo da variável de ambiente
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // PROTEÇÃO DA PÁGINA: ao abrir, procura a token no localStorage.
  // Se não houver, a pessoa não fez login: manda para a tela de login.
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.replace("/form_login");
    }
    setToken(savedToken);
  }, [router]);

  // some com a mensagem de sucesso depois de 5 segundos
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // some com a mensagem de erro depois de 5 segundos
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // executa ao clicar em "Cadastrar"
  const enviar = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();   // evita recarregar a página

    setMessage("");
    setError("");

    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL não definida: crie o arquivo .env.local e reinicie o npm run dev.");
      return;
    }

    setLoading(true);

    try {
      const resposta = await fetch(apiUrl + '/musica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // envia a token: é isso que prova ao backend que houve login
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo,
          artista,
          genero,
          // os inputs dão texto; convertemos para número (ou null se vazio)
          ano: Number(ano),
          duracao: duracao === "" ? null : Number(duracao),
          nota: nota === "" ? null : Number(nota)
        })
      });

      switch (resposta.status) {
        case 200:
        case 201:
          setMessage("Música cadastrada com sucesso!");
          // limpa os campos
          setTitulo(""); setArtista(""); setGenero("");
          setAno(""); setDuracao(""); setNota("");
          break;
        case 400:
          setError("Dados inválidos. Confira os campos (nota de 0 a 10).");
          break;
        case 401:
        case 422:
          // token vencida (dura 15 minutos) ou inválida: faz login de novo
          localStorage.removeItem("token");
          router.replace("/form_login");
          break;
        case 500:
          setError("Erro interno no servidor backend.");
          break;
        default:
          setError("Um erro inesperado ocorreu.");
      }
    } catch (err) {
      console.log('error', err);
      setError("Não foi possível conectar-se ao backend");
    } finally {
      setLoading(false);
    }
  }

  // se não houver token, não desenha a página (o redirecionamento já foi pedido)
  if (!token) {
    return null;
  }

  const estiloInput = "rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

        <h1
          className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
        >Cadastrar Música</h1>

        {message && (
          <p className="text-green-600 font-medium">{message}</p>
        )}

        {error && (
          <p className="text-red-600 font-medium">{error}</p>
        )}

        <form className="flex flex-col gap-4 w-full" onSubmit={enviar}>

          <input type="text" name="titulo" placeholder="Título"
            value={titulo} onChange={(e) => setTitulo(e.target.value)}
            className={estiloInput} required />

          <input type="text" name="artista" placeholder="Artista"
            value={artista} onChange={(e) => setArtista(e.target.value)}
            className={estiloInput} required />

          <input type="text" name="genero" placeholder="Gênero"
            value={genero} onChange={(e) => setGenero(e.target.value)}
            className={estiloInput} required />

          <input type="number" name="ano" placeholder="Ano de lançamento"
            value={ano} onChange={(e) => setAno(e.target.value)}
            className={estiloInput} required />

          <input type="number" name="duracao" placeholder="Duração em segundos (opcional)"
            value={duracao} onChange={(e) => setDuracao(e.target.value)}
            className={estiloInput} />

          <input type="number" name="nota" placeholder="Nota de 0 a 10 (opcional)"
            min="0" max="10" step="0.1"
            value={nota} onChange={(e) => setNota(e.target.value)}
            className={estiloInput} />

          <button type="submit"
            disabled={loading}
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

        </form>

      </main>
    </div>
  );
}
