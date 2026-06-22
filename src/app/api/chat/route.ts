import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { hasFeature } from "@/lib/plan-check";

const SYSTEM_PROMPT = `Você é um garçom virtual inteligente e amigável de um restaurante brasileiro.
Suas tarefas:
1. Ajudar clientes a escolher pratos do cardápio
2. Fazer sugestões baseadas nas preferências do cliente
3. Tirar dúvidas sobre ingredientes e preparo
4. Ser simpático e usar emojis ocasionalmente

Regras:
- Responda em português brasileiro
- Seja conciso (máximo 3-4 frases)
- Sugira combinações de pratos quando apropriado
- Se o cliente pedir algo fora do cardápio, sugira alternativas similares
- Use um tom informal mas educado
- Sempre termine com uma pergunta ou sugestão`;

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    if (!rateLimit(ip, 10, 60000)) {
      return NextResponse.json(
        { error: "Muitas solicitações. Aguarde um momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, menuContext, establishmentId, establishmentSlug } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Check plan
    let estId = establishmentId;
    if (!estId && establishmentSlug) {
      const est = await prisma.establishment.findUnique({ where: { slug: establishmentSlug }, select: { id: true, plan: true } });
      if (est) {
        estId = est.id;
        if (!hasFeature(est.plan as any, "aiChat")) {
          return NextResponse.json({
            response: "💬 O chat com IA não está disponível no seu plano atual. Faça upgrade para o Plano Pro para ativar o garçom inteligente!",
            planBlocked: true,
          });
        }
      }
    }
    if (estId) {
      const est = await prisma.establishment.findUnique({ where: { id: estId }, select: { plan: true } });
      if (est && !hasFeature(est.plan as any, "aiChat")) {
        return NextResponse.json({
          response: "💬 O chat com IA não está disponível no seu plano atual. Faça upgrade para o Plano Pro para ativar o garçom inteligente!",
          planBlocked: true,
        });
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response: generateLocalResponse(messages, menuContext),
        fallback: true,
      });
    }

    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPT + (menuContext ? `\n\nCardápio disponível:\n${menuContext}` : ""),
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages.slice(-8)],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        response: generateLocalResponse(messages, menuContext),
        fallback: true,
      });
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || "Desculpe, não entendi. Pode repetir?";

    return NextResponse.json({ response: aiMessage, fallback: false });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Erro na IA" },
      { status: 500 }
    );
  }
}

function generateLocalResponse(messages: any[], menuContext: string): string {
const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

if (lastMessage.includes("menu") || lastMessage.includes("cardápio") || lastMessage.includes("ver")) {
return "📋 Aqui está nosso cardápio! Temos entradas deliciosas, pratos principais incríveis, bebidas refrescantes e sobremesas de dar água na boca. Clique no botão de cardápio acima para ver tudo! 😋";
}

if (lastMessage.includes("pizza")) {
return "🍕 Nossas pizzas são feitas com massa artesanal e ingredientes frescos! A Margherita é a mais pedida, mas a Pepperoni é sensacional. Qual te interessa?";
}

if (lastMessage.includes("hambúrguer") || lastMessage.includes("hamburguer") || lastMessage.includes("batata")) {
return "🍔 Nossos hambúrgueres são 100% carne scelta e feitos na hora! O X-Burger é o queridinho, mas o Bacon Lover é de outro mundo. Acompanha batata frita crocante!";
}

if (lastMessage.includes("bebida") || lastMessage.includes("drink") || lastMessage.includes("cerveja") || lastMessage.includes("refrigerante")) {
return "🍺 Temos chope artesanal, IPAs, caipirinhas e muito mais! A Caipirinha de Limão é a campeã de vendas. Quer experimentar?";
}

if (lastMessage.includes("sobremesa") || lastMessage.includes("doce")) {
return "🍰 Nossas sobremesas são irresistíveis! O Brownie com Sorvete e o Petit Gâteau são os favoritos. Qual vai ser?";
}

if (lastMessage.includes("recomend") || lastMessage.includes("sugest") || lastMessage.includes("indic")) {
return "⭐ Recomendo muito a Picanha na Brasa com uma IPA Artesanal! É a combinação perfeita. Ou se preferir algo mais leve, o Risoto de Camarão é excelente! O que acha?";
}

if (lastMessage.includes("conta") || lastMessage.includes("pagar") || lastMessage.includes("fechar") || lastMessage.includes("valor")) {
return "💰 Claro! Vou preparar sua conta. Clique no botão de checkout acima para ver o resumo e escolher a forma de pagamento. Aceitamos PIX, cartão e dinheiro!";
}

if (lastMessage.includes("obrigad") || lastMessage.includes("valeu") || lastMessage.includes("brigad")) {
return "😊 Por nada! Estamos aqui para tornar sua experiência incrível. Precisa de mais alguma coisa?";
}

if (lastMessage.includes("demor") || lastMessage.includes("tempo") || lastMessage.includes("quanto tempo")) {
return "⏱️ Nosso tempo médio de entrega é de 15-20 minutos para pratos quentes e 5-10 minutos para bebidas. Pedidos especiais podem levar um pouco mais de tempo!";
}

if (lastMessage.includes("frio") || lastMessage.includes("gelado") || lastMessage.includes("temperatura")) {
return "🧊 Nossas bebidas são servidas bem geladas! Se algo não estiver na temperatura ideal, é só avisar que trocamos na hora!";
}

if (lastMessage.includes("alérgico") || lastMessage.includes("alergia") || lastMessage.includes("glúten") || lastMessage.includes("lactose")) {
return "⚠️ Temos opções sem glúten e sem lactose! Por favor, informe seu garçom sobre qualquer alergia para que possamos preparar seu prato com segurança. Quer ver algumas sugestões?";
}

if (lastMessage.includes("criança") || lastMessage.includes("infantil") || lastMessage.includes("criança")) {
return "👶 Temos um cardápio especial para crianças! Porções menores e preços especiais. O Mini Hambúrguer e o Franguinho com Batata são os favoritos!";
}

if (lastMessage.includes("garrafa") || lastMessage.includes("garrafa") || lastMessage.includes("inteira")) {
return "🍷 Temos uma adega completa! Vinhos tintos, brancos e espumantes. Nosso sommelier pode te ajudar a escolher o harmonização perfeita!";
}

if (lastMessage.includes("porção") || lastMessage.includes("divide") || lastMessage.includes("dividir")) {
return "🍽️ Nossas porções são ótimas para compartilhar! A Picanha para 2 e a Tábua de Fritas são perfeitas para dividir. Quer que eu sugira algo para o seu grupo?";
}

if (lastMessage.includes("bom dia") || lastMessage.includes("boa tarde") || lastMessage.includes("boa noite")) {
return "👋 Olá! Seja muito bem-vindo! Estou aqui para ajudar você a ter uma experiência incrível. O que vai querer hoje?";
}

if (lastMessage.includes("oi") || lastMessage.includes("olá") || lastMessage.includes("ola")) {
return "👋 Olá! Bem-vindo! Estou aqui para te ajudar. Quer ver nosso cardápio ou tem alguma dúvida?";
}

return "Entendido! 😊 Posso ajudar você com o cardápio, recomendações de pratos ou tirar qualquer dúvida. O que deseja?";
}

  if (lastMessage.includes("pizza")) {
    return "🍕 Nossas pizzas são feitas com massa artesanal e ingredientes frescos! A Margherita é a mais pedida, mas a Pepperoni é sensacional. Qual te interessa?";
  }

  if (lastMessage.includes("bebida") || lastMessage.includes("drink") || lastMessage.includes("cerveja")) {
    return "🍺 Temos chope artesanal, IPAs, caipirinhas e muito mais! A Caipirinha de Limão é a campeã de vendas. Quer experimentar?";
  }

  if (lastMessage.includes("sobremesa") || lastMessage.includes("doce")) {
    return "🍰 Nossas sobremesas são irresistíveis! O Brownie com Sorvete e o Petit Gâteau são os favoritos. Qual vai ser?";
  }

  if (lastMessage.includes("recomend") || lastMessage.includes("sugest") || lastMessage.includes("indic")) {
    return "⭐ Recomendo muito a Picanha na Brasa com uma IPA Artesanal! É a combinação perfeita. Ou se preferir algo mais leve, o Risoto de Camarão é excelente! O que acha?";
  }

  if (lastMessage.includes("conta") || lastMessage.includes("pagar") || lastMessage.includes("fechar")) {
    return "💰 Claro! Vou preparar sua conta. Clique no botão de checkout acima para ver o resumo e escolher a forma de pagamento. Aceitamos PIX, cartão e dinheiro!";
  }

  if (lastMessage.includes("obrigad")) {
    return "😊 Por nada! Estamos aqui para tornar sua experiência incrível. Precisa de mais alguma coisa?";
  }

  return "Entendido! 😊 Posso ajudar você com o cardápio, recomendações de pratos ou tirar qualquer dúvida. O que deseja?";
}
