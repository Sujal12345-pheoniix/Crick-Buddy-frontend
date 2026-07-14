"use client";

import { useEffect } from "react";

export function KenzoLoader() {
  useEffect(() => {
    import("@kenzo/sdk").then(({ Kenzo }) => {
      Kenzo.init({
        apiKey: "kenzo_project_1784019412209_key_3hlo5",
        apiBaseUrl: "https://kenzo-dap.onrender.com/api/v1"
      });
    });
  }, []);

  return null;
}
