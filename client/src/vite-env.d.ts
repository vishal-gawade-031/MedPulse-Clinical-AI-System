interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_EMERGENCY_HOTLINE: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
