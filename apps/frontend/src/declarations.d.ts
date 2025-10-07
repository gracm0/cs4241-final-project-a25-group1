//type definitions for image imports

declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.jpeg" {
  const value: string;
  export default value;
}
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.JPG" {
  const value: string;
  export default value;
}
declare module "*.JPEG" {
  const value: string;
  export default value;
}

interface ImportMetaEnv {
  VITE_API_BASE?: string;
  // add other env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
