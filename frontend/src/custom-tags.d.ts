import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}
