import Link from "next/link";

export default function Termos() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <header className="border-b border-[#1E1E2F]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Voltar</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12 prose prose-invert prose-gray">
        <h1 className="text-3xl font-display font-bold mb-8">Termos de Serviço</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: Maio de 2026</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>Ao criar uma conta na Infinity Comanda AI, você concorda com estes Termos de Serviço. Se não concordar, não utilize a plataforma.</p>

        <h2>2. Definições</h2>
        <ul>
          <li><strong>Plataforma:</strong> sistema SaaS Infinity Comanda AI</li>
          <li><strong>Estabelecimento:</strong> restaurante, bar ou similar cadastrado na plataforma</li>
          <li><strong>Usuário:</strong> proprietário ou funcionário do estabelecimento</li>
          <li><strong>Cliente:</strong> consumidor final que faz pedidos via chat</li>
        </ul>

        <h2>3. Planos e Assinatura</h2>
        <p>Oferecemos planos mensais (Starter, Pro, Enterprise). Características de cada plano:</p>
        <ul>
          <li>O pagamento é processado no momento da contratação</li>
          <li>A assinatura é renovada automaticamente a cada mês</li>
          <li>Você pode cancelar a qualquer momento</li>
          <li>O cancelamento entra em vigor no final do ciclo de faturamento</li>
          <li>Não há reembolso de valores proporcionais</li>
        </ul>

        <h2>4. Obrigações do Usuário</h2>
        <ul>
          <li>Fornecer dados cadastrais verdadeiros e atualizados</li>
          <li>Manter a confidencialidade da senha</li>
          <li>Não utilizar a plataforma para atividades ilícitas</li>
          <li>Não reproduzir, distribuir ou modificar o software sem autorização</li>
          <li>Responsabilizar-se pelo conteúdo do cardápio e preços</li>
        </ul>

        <h2>5. Propriedade Intelectual</h2>
        <p>A plataforma, seu código-fonte, design e conteúdo são propriedade exclusiva da Infinity Agência. O estabelecimento mantém a propriedade dos dados de seu cardápio e clientes.</p>

        <h2>6. Limitação de Responsabilidade</h2>
        <p>A Infinity Comanda AI não se responsabiliza por:</p>
        <ul>
          <li>Interrupções temporárias do serviço para manutenção</li>
          <li>Perdas decorrentes de uso inadequado da plataforma</li>
          <li>Conteúdo publicado pelo estabelecimento (cardápio, preços)</li>
          <li>Danos causados por terceiros (ataques cibernéticos, falhas de internet)</li>
        </ul>

        <h2>7. Cancelamento e Exclusão</h2>
        <p>O usuário pode solicitar exclusão da conta a qualquer momento pelo painel administrativo ou entrando em contato. Os dados serão eliminados conforme a Política de Privacidade.</p>

        <h2>8. Disposições Gerais</h2>
        <ul>
          <li>Estes termos são regidos pela legislação brasileira</li>
          <li>O foro é da comarca de Divinópolis, MG</li>
          <li>Casos omissos serão resolvidos pelo Código de Defesa do Consumidor</li>
          <li>Alterações nos termos serão comunicadas com 30 dias de antecedência</li>
        </ul>

        <h2>9. Contato</h2>
        <p>Dúvidas sobre estes termos:</p>
        <ul>
          <li><strong>Email:</strong> contato@infinitycomanda.com.br</li>
          <li><strong>WhatsApp:</strong> (37) 98418-9874</li>
        </ul>
      </main>
      <footer className="border-t border-[#1E1E2F] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <Link href="/termos" className="hover:text-white transition-colors">Termos de Serviço</Link>
          <span className="mx-3">·</span>
          <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
