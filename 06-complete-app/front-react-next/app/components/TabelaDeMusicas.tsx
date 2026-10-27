// tipo que descreve como é uma música (o TypeScript exige isso)
type Musica = {
    id: number;
    titulo: string;
    artista: string;
    genero: string;
    ano: number;
    duracao: number | null;
    nota: number | null;
};

// Componente de SERVIDOR (sem 'use client'): roda no servidor do Next,
// busca os dados no backend e já entrega a tabela pronta para o navegador.
export default async function TabelaDeMusicas() {

    // endereço do backend, vindo da variável de ambiente (arquivo .env.local)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    let musicas: Musica[] = [];
    let erro = "";

    try {
        if (!apiUrl) {
            throw new Error("NEXT_PUBLIC_API_URL não definida");
        }

        // cache: 'no-store' = sempre buscar dados atualizados
        const response = await fetch(apiUrl + '/musicas', { cache: 'no-store' });

        if (!response.ok) {
            erro = "Erro ao buscar músicas (código " + response.status + ")";
        } else {
            const data = await response.json();
            musicas = Array.isArray(data?.detalhes) ? data.detalhes : [];
        }
    } catch {
        // acontece, por exemplo, se o backend estiver desligado
        erro = "Não foi possível conectar-se ao backend (" + (apiUrl ?? "NEXT_PUBLIC_API_URL não definida em .env.local") + ")";
    }

    return (
        <>
            {erro && (
                <p className="text-red-600 font-medium">{erro}</p>
            )}

            {!erro && musicas.length === 0 && (
                <p className="text-gray-600">Nenhuma música cadastrada ainda.</p>
            )}

            {musicas.length > 0 && (
                <table className="mt-6 w-full border-collapse rounded-xl border border-gray-200 bg-white text-left shadow-md">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Título</th>
                            <th className="px-4 py-3">Artista</th>
                            <th className="px-4 py-3">Gênero</th>
                            <th className="px-4 py-3">Ano</th>
                            <th className="px-4 py-3">Duração (s)</th>
                            <th className="px-4 py-3">Nota</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                        {/* para cada música (map) ... uma linha da tabela */}
                        {musicas.map((f) => (
                            <tr key={f.id} className="hover:bg-blue-50">
                                <td className="px-4 py-3">{f.id}</td>
                                <td className="px-4 py-3">{f.titulo}</td>
                                <td className="px-4 py-3">{f.artista}</td>
                                <td className="px-4 py-3">{f.genero}</td>
                                <td className="px-4 py-3">{f.ano}</td>
                                <td className="px-4 py-3">{f.duracao ?? "-"}</td>
                                <td className="px-4 py-3">{f.nota ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}
