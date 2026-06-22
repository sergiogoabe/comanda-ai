import Link from "next/link";
import {
  Bot,
  QrCode,
  CreditCard,
  ChefHat,
  BarChart3,
  Users,
  ArrowRight,
  Check,
  Zap,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Infinity Comanda AI" className="h-8 w-auto" />
            <span className="text-lg font-display font-bold">Infinity Comanda AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Funcionalidades</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">Como Funciona</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Preços</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm hidden sm:block">Entrar</Link>
              <Link href="/register" className="px-5 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-sm mb-6">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Plataforma #1 para restaurantes</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
                Peça pelo Chat.<br />
                <span className="text-primary">Pague com PIX.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                Transforme cada mesa em uma experiência única com IA conversacional, 
                pedidos inteligentes e pagamento instantâneo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white font-medium hover:bg-primary-600 transition-colors">
                  <span>Experimentar Grátis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/chat/mesa-1" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-surface text-white font-medium hover:bg-surface-700 transition-colors">
                  Ver Demo
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /><span>14 dias grátis</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /><span>Setup em 5 min</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /><span>Sem cartão</span></div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              <div className="relative bg-surface p-5 glow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-error" />
                  <div className="w-3 h-3 bg-warning" />
                  <div className="w-3 h-3 bg-accent" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-end"><div className="bg-primary text-white px-4 py-3 text-sm max-w-xs">Quero uma pizza margherita grande</div></div>
                  <div className="flex justify-start">
                    <div className="bg-surface-700 text-white px-4 py-3 text-sm max-w-xs">
                      <p className="mb-2">Perfeito! Adicionado:</p>
                      <div className="bg-surface-800 px-3 py-2"><div className="font-medium text-sm">Pizza Margherita Grande</div><div className="text-xs text-primary mt-1">R$ 52,00</div></div>
                      <p className="mt-2 text-xs text-accent">Sugestão: combine com nossa IPA artesanal!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-surface-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6">Usado por mais de 500 restaurantes no Brasil</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-40">
            {["Bar&Rest", "Sabor&Co", "GastroLab", "FoodHub", "ChefPro"].map((name) => (
              <span key={name} className="text-xl font-display font-bold">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Tudo que você precisa para vender mais</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Uma plataforma completa para gerenciar pedidos, clientes e pagamentos</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<Bot className="w-5 h-5" />} title="IA Conversacional" description="Seus clientes pedem pelo chat, como se conversassem com um garçom experiente." />
            <FeatureCard icon={<QrCode className="w-5 h-5" />} title="QR Code por Mesa" description="Cada mesa tem seu QR Code único. Cliente scaneia, abre o cardápio e pede." />
            <FeatureCard icon={<CreditCard className="w-5 h-5" />} title="PIX Instantâneo" description="Gere QR Code PIX na hora. Pagamento confirmado em segundos." />
            <FeatureCard icon={<ChefHat className="w-5 h-5" />} title="Cozinha Integrada" description="Pedidos chegam em tempo real na tela da cozinha. Sem papel, sem erros." />
            <FeatureCard icon={<Users className="w-5 h-5" />} title="CRM Completo" description="Conheça seus clientes. Histórico, preferências, aniversários e muito mais." />
            <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="Dashboard Analítico" description="Vendas, ticket médio, pratos mais vendidos, horários de pico." />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Como funciona</h2>
            <p className="text-lg text-gray-400">Setup completo em menos de 5 minutos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number={1} title="Cadastre seu restaurante" description="Preencha os dados, configure o cardápio e escolha um plano." />
            <StepCard number={2} title="Configure seu cardápio" description="Adicione categorias, produtos, preços e fotos. QR Codes gerados automaticamente." />
            <StepCard number={3} title="Comece a vender" description="Imprima os QR Codes nas mesas. Seus clientes scaneiam e pedem pelo chat!" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Planos e Preços</h2>
            <p className="text-lg text-gray-400">Escolha o plano ideal para o seu negócio</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard name="Starter" price={49} features={["Até 5 mesas", "Cardápio digital QR Code", "Pedidos ilimitados", "Cozinha Kanban"]} />
            <PricingCard name="Pro" price={97} popular features={["Mesas ilimitadas", "IA garçom inteligente", "Cozinha Kanban avançada", "Relatórios completos", "CRM básico", "PIX integrado", "Divisão de conta"]} />
            <PricingCard name="Enterprise" price={197} features={["Tudo do Pro", "Multi-filiais", "API aberta", "Integração iFood/Rappi", "Suporte 24/7", "White-label", "SLA garantido"]} />
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Setup inicial: <span className="text-accent font-semibold">R$ 297</span> — configuração + QR codes impressos
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">Pronto para revolucionar seu restaurante?</h2>
          <p className="text-lg text-gray-400 mb-8">Junte-se a mais de 500 estabelecimentos que já estão vendendo mais</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium text-lg hover:bg-primary-600 transition-colors">
            <span>Começar Gratuitamente</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-surface-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Infinity Comanda AI" className="h-6 w-auto" />
            <span className="font-display font-bold">Infinity Comanda AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <a href="https://wa.me/5537984189874" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contato</a>
          </div>
          <p className="text-sm text-gray-500">Infinity Agency . 2026 . All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-surface border border-surface-700 hover:border-primary/30 transition-colors card-hover">
      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary mb-4">{icon}</div>
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-primary flex items-center justify-center text-xl font-bold text-white mx-auto mb-5">{number}</div>
      <h3 className="text-lg font-display font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, features, popular }: { name: string; price: number; features: string[]; popular?: boolean }) {
  return (
    <div className={`p-8 bg-surface ${popular ? "border-2 border-primary" : "border border-surface-700"} relative`}>
      {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium">Mais Popular</div>}
      <h3 className="text-lg font-display font-bold mb-2">{name}</h3>
      <div className="mb-6"><span className="text-4xl font-display font-bold">R$ {price}</span><span className="text-gray-400 text-sm">/mês</span></div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-accent flex-shrink-0" /><span>{f}</span></li>
        ))}
      </ul>
      <Link href="/register" className={`block text-center py-3 text-sm font-medium transition-colors ${popular ? "bg-primary text-white hover:bg-primary-600" : "bg-surface-700 text-white hover:bg-surface-600"}`}>
        Começar Agora
      </Link>
    </div>
  );
}