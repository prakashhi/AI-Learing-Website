declare module "epub-parser" {
  export interface EPubItem {
    text: string;
  }

  export interface EPubData {
    spine: EPubItem[];
  }

  export function parse(buffer: Buffer): Promise<EPubData>;
}
