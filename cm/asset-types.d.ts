type StaticAsset = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};

declare module '*.jpg' {
  const src: StaticAsset;
  export default src;
}

declare module '*.jpeg' {
  const src: StaticAsset;
  export default src;
}

declare module '*.png' {
  const src: StaticAsset;
  export default src;
}

declare module '*.svg' {
  const src: StaticAsset;
  export default src;
}
