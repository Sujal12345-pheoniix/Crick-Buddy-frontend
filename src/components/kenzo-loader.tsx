"use client";

import { useEffect } from "react";

export function KenzoLoader() {
  useEffect(() => {
    import("@kenzo/sdk").then(({ Kenzo }) => {
      Kenzo.init({
        apiKey: "kenzo_project_1784014691695_key_2g8e4",
        apiBaseUrl: "https://kenzo-dap.onrender.com/api/v1"
      });
    });
  }, []);

  return null;
}
