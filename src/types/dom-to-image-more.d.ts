declare module 'dom-to-image-more' {
  interface Options {
    bgcolor?: string;
    width?: number;
    height?: number;
    scale?: number;
    style?: Partial<CSSStyleDeclaration>;
    filter?: (node: Node) => boolean;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  function toPng(node: HTMLElement, options?: Options): Promise<string>;
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;

  export { toPng, toJpeg, toSvg, toBlob };
  export default { toPng, toJpeg, toSvg, toBlob };
}
