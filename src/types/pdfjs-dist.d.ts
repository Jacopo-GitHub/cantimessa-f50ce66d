declare module "pdfjs-dist/es5/build/pdf" {
  const pdfjsLib: {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument(input: { data: Uint8Array }): {
      promise: Promise<{
        numPages: number;
        getPage(pageNumber: number): Promise<{
          getViewport(input: { scale: number }): { width: number; height: number };
          render(input: {
            canvasContext: CanvasRenderingContext2D;
            viewport: { width: number; height: number };
          }): { promise: Promise<void> };
        }>;
      }>;
    };
  };
  export = pdfjsLib;
}