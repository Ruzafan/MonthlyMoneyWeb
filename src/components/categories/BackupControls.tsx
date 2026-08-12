"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { importBackup } from "@/lib/actions/backup";

export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importBackup(json);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: `Importado: ${result.data.transactionsImported} movimientos, ${result.data.categoriesCreated} categorías nuevas${
            result.data.skipped ? `, ${result.data.skipped} omitidos` : ""
          }.`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "No se pudo leer el archivo. ¿Es un backup JSON válido?" });
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-medium">Copia de seguridad</h2>
      <p className="mt-1 text-sm text-muted">
        Exporta todos tus movimientos y categorías a un archivo, o restaura uno anterior.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href="/api/export">
          <Button type="button" variant="secondary" size="sm">
            <Download size={15} />
            Exportar datos
          </Button>
        </a>
        <Button type="button" variant="secondary" size="sm" disabled={importing} onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} />
          {importing ? "Importando…" : "Importar datos"}
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      </div>
      {message && (
        <p className={`mt-3 text-sm ${message.type === "error" ? "text-expense" : "text-income"}`}>{message.text}</p>
      )}
    </Card>
  );
}
