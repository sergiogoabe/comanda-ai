"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useChatStore, type Category } from "@/store/chat-store";
import { sampleCategories } from "@/components/chat/sample-menu";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tableId = params.tableId as string;
  const establishmentSlug = searchParams.get("estabelecimento") || "demo";
  const [loaded, setLoaded] = useState(false);
  const { setTable, setEstablishment, setCategories } = useChatStore();

  useEffect(() => {
    const fetchMenu = async () => {
      setTable({
        id: tableId,
        number: tableId.replace("table-", "").replace("mesa-", ""),
      });

      try {
        const res = await fetch(`/api/establishments?slug=${establishmentSlug}`);
        if (res.ok) {
          const data = await res.json();
          const est = data.establishment;
          setEstablishment({
            id: est.id,
            name: est.name,
            logo: est.logo || "",
          });

          const menuRes = await fetch(`/api/menu?establishmentId=${est.id}`);
          if (menuRes.ok) {
            const menuData = await menuRes.json();
            if (menuData.categories.length > 0) {
              const mapped: Category[] = menuData.categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || "🍽️",
                order: cat.order,
                description: cat.description || "",
                products: cat.products.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  description: p.description || "",
                  price: Number(p.price),
                  image: p.image || "",
                  categoryId: p.categoryId,
                  isActive: p.isActive,
                  preparationTime: p.preparationTime || 15,
                  additions: p.additions || [],
                  variants: p.variants || [],
                  tags: p.tags || [],
                  emoji: p.emoji || "",
                })),
              }));
              setCategories(mapped);
              setLoaded(true);
              return;
            }
          }
        }
      } catch {
        console.log("API unavailable, using fallback menu");
      }

      setEstablishment({
        id: "demo-establishment",
        name: "Bar & Restaurante Demo",
        logo: "",
      });
      setCategories(sampleCategories);
      setLoaded(true);
    };

    fetchMenu();
  }, [tableId, establishmentSlug, setTable, setEstablishment, setCategories]);

  if (!loaded) {
    return (
      <div className="h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return <ChatInterface />;
}