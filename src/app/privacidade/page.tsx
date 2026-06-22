import Link from "next/link";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <header className="border-b border-[#1E1E2F]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Voltar</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12 prose prose-invert prose-gray">
        <h1 className="text-3xl font-display font-bold mb-8">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: Maio de 2026</p>

        <h2>1. Dados Coletados</h2>
        <p>A Infinity Comanda AI coleta os seguintes dados pessoais:</p>
        <ul>
          <li><strong>Dados de cadastro:</strong> nome, email, telefone, senha (criptografada)</li>
          <li><strong>Dados do estabelecimento:</strong> nome, endereço, logo, cardápio</li>
          <li><strong>Dados de clientes:</strong> nome, email, telefone, histórico de pedidos, preferências</li>
          <li><strong>Dados de uso:</strong> páginas acessadas, interações com o chat, funcionalidades utilizadas</li>
          <li><strong>Dados de pagamento:</strong> processados exclusivamente pelo gateway de pagamento, sem armazenamento de dados sensíveis de cartão</li>
        </ul>

        <h2>2. Finalidade do Tratamento</h2>
        <p>Seus dados são utilizados para:</p>
        <ul>
          <li>Fornecer, manter e melhorar a plataforma</li>
          <li>Processar pedidos e pagamentos</li>
          <li>Personalizar a experiência do usuário</li>
          <li>Enviar comunicações operacionais (confirmação de cadastro, atualizações)</li>
          <li>Cumprir obrigações legais e regulatórias</li>
        </ul>

        <h2>3. Compartilhamento de Dados</h2>
        <p>Compartilhamos dados apenas com:</p>
        <ul>
          <li><strong>Processadores de pagamento:</strong> para processar transações</li>
          <li><strong>Provedores de infraestrutura:</strong> Vercel (hospedagem), Neon (banco de dados)</li>
          <li><strong>OpenAI:</strong> processamento de mensagens do chat (sem armazenamento)</li>
          <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
        </ul>

        <h2>4. Direitos do Titular (LGPD)</h2>
        <p>Você tem direito a:</p>
        <ul>
          <li>Confirmar a existência de tratamento de dados</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Anonimizar, bloquear ou eliminar dados desnecessários</li>
          <li>Solicitar a portabilidade dos dados</li>
          <li>Eliminar dados tratados com consentimento</li>
          <li>Revogar o consentimento a qualquer momento</li>
        </ul>

        <h2>5. Segurança</h2>
        <p>Aplicamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (TLS), criptografia de senhas (bcrypt), acesso restrito a dados, e monitoramento contínuo de segurança.</p>

        <h2>6. Cookies</h2>
        <p>Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação, sessão). Não utilizamos cookies de rastreamento ou publicidade.</p>

        <h2>7. Retenção de Dados</h2>
        <p>Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, os dados são eliminados em até 90 dias, exceto quando necessário para cumprir obrigações legais.</p>

        <h2>8. Contato</h2>
        <p>Para exercer seus direitos ou esclarecer dúvidas, entre em contato:</p>
        <ul>
          <li><strong>Email:</strong> contato@infinitycomanda.com.br</li>
          <li><strong>WhatsApp:</strong> (37) 98418-9874</li>
          <li><strong>Responsável LGPD:</strong> Infinity Agência</li>
        </ul>

        <h2>9. Alterações</h2>
        <p>Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas por email ou aviso na plataforma.</p>
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
