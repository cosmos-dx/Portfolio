import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `TextLinks`.
 */
export type TextLinksProps = SliceComponentProps<Content.TextLinksSlice>;

/**
 * Component for "TextLinks" Slices.
 */
const TextLinks = ({ slice }: TextLinksProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for text_links (variation: {slice.variation}) Slices
    </section>
  );
};

export default TextLinks;
