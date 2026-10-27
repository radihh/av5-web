// trazendo o componente da tabela de musicas
import TabelaDeMusicas from '../components/TabelaDeMusicas';

export default function Listar_Musicas() {

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1
          className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
        >Músicas</h1>

        <TabelaDeMusicas />

      </main>
    </div>
  );
}
