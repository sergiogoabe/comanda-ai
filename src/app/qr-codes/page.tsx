"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, QrCode, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

export default function QRCodePage() {
  const [tables, setTables] = useState<Array<{ number: string; id: string }>>([]);
  const [establishment, setEstablishment] = useState<{ name: string; slug: string } | null>(null);
  const [slug, setSlug] = useState("demo");
  const [customUrl, setCustomUrl] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        const res = await fetch(`/api/establishments?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setEstablishment({ name: data.establishment.name, slug: data.establishment.slug });
          setTables(data.establishment.tables || []);
        }
      } catch {}
    };
    fetchEstablishment();
  }, [slug]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://infinity-comanda-ai.vercel.app";

  const getTableUrl = (tableNumber: string) => {
    return `${baseUrl}/chat/${tableNumber}?estabelecimento=${slug}`;
  };

  const printAll = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `
      <html>
      <head>
        <title>QR Codes - ${establishment?.name || "Restaurante"}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 800px; }
          .card { border: 2px solid #000; padding: 20px; text-align: center; page-break-inside: avoid; }
          .card h2 { margin: 10px 0 5px; font-size: 24px; }
          .card p { margin: 0; color: #666; font-size: 12px; }
          .card svg { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center;margin-bottom:30px;">${establishment?.name || "Restaurante"} - QR Codes das Mesas</h1>
        <div class="grid">
    `;

    tables.forEach((table) => {
      const url = getTableUrl(table.number);
      html += `
        <div class="card">
          <h2>Mesa ${table.number}</h2>
          <p>Escaneie para pedir pelo celular</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" width="200" height="200" />
          <p style="margin-top:10px;font-size:10px;word-break:break-all;">${url}</p>
        </div>
      `;
    });

    html += `</div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <header className="bg-surface border-b border-surface-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/estabelecimento/demo-establishment" className="p-2 hover:bg-surface-600 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg">QR Codes das Mesas</h1>
            <p className="text-sm text-gray-400">Imprima e cole nas mesas do restaurante</p>
          </div>
        </div>
        <button
          onClick={printAll}
          className="flex items-center gap-2 px-4 py-2 gradient-primary text-white font-medium"
        >
          <Printer className="w-4 h-4" />
          Imprimir Todos
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Slug Selector */}
        <div className="mb-8 p-4 bg-surface">
          <label className="block text-sm text-gray-400 mb-2">Estabelecimento</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug-do-restaurante"
              className="flex-1 px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
            />
          </div>
          {establishment && (
            <p className="text-sm text-accent mt-2">
              Conectado: {establishment.name} ({tables.length} mesas)
            </p>
          )}
        </div>

        {/* Custom URL Generator */}
        <div className="mb-8 p-4 bg-surface">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span className="font-medium">Gerar QR Code personalizado</span>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {expanded && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://infinity-comanda-ai.vercel.app/chat/mesa-1?estabelecimento=demo"
                className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              />
              {customUrl && (
                <div className="flex flex-col items-center gap-3 p-6 bg-white">
                  <QRCodeSVG value={customUrl} size={200} />
                  <p className="text-xs text-gray-500 break-all max-w-xs text-center">{customUrl}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tables Grid */}
        {tables.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => {
              const url = getTableUrl(table.number);
              return (
                <div key={table.id} className="p-6 bg-surface border border-surface-600 flex flex-col items-center">
                  <h3 className="text-xl font-display font-bold mb-1">Mesa {table.number}</h3>
                  <p className="text-xs text-gray-500 mb-4">Escaneie para pedir</p>
                  <div className="p-3 bg-white mb-3">
                    <QRCodeSVG value={url} size={160} />
                  </div>
                  <p className="text-[10px] text-gray-500 break-all text-center max-w-[180px]">{url}</p>
                  <button
                    onClick={() => {
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.write(`
                          <html><head><title>Mesa ${table.number}</title>
                          <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:Arial,sans-serif}
                          .card{border:3px solid #000;padding:30px;text-align:center}h2{font-size:32px;margin:10px 0}svg{margin:20px 0}</style>
                          </head><body><div class="card"><h2>Mesa ${table.number}</h2>
                          <p>Escaneie para fazer seu pedido</p>
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}" width="300" height="300" />
                          </div></body></html>
                        `);
                        win.document.close();
                        win.print();
                      }
                    }}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Printer className="w-3 h-3" />
                    Imprimir
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma mesa encontrada para o slug "{slug}"</p>
            <p className="text-sm mt-2">Verifique o slug ou crie mesas no painel</p>
          </div>
        )}
      </div>
    </div>
  );
}
