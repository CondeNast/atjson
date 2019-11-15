import OffsetSource, { YouTubeEmbed } from "@atjson/offset-annotations";
import HTMLRenderer from "@atjson/renderer-html";
import HTMLSource from "@atjson/source-html";
import CodeBlock from "@theme/CodeBlock";
import * as React from "react";
import { FC, useState } from "react";
import styled from "styled-components";
import { TextArea } from "./TextArea.tsx";

class MyHTMLRenderer extends HTMLRenderer {
  *YoutubeEmbed(embed: YouTubeEmbed) {
    return yield* this.$("iframe", {
      width: embed.attributes.width,
      height: embed.attributes.height,
      src: embed.attributes.url,
      frameborder: "0",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
      allowfullscreen: true
    });
  }
}

const RenderedHTML: FC<{ document: OffsetSource }> = props => {
  return (
    <pre className="mdxCodeBlock_node_modules-@docusaurus-theme-classic-src-theme-MDXComponents-">
      <CodeBlock className="html">
        {MyHTMLRenderer.render(props.document)}
      </CodeBlock>
    </pre>
  );
};

const ScaledIframe = styled.div`
  text-align: center;
  margin-bottom: 1em;
  iframe {
    max-width: 100%;
  }
`;

export const RenderedDOM: FC<{ document: OffsetSource }> = props => {
  return (
    <ScaledIframe
      dangerouslySetInnerHTML={{
        __html: MyHTMLRenderer.render(props.document)
      }}
    />
  );
};

export const HTMLRendererDemo = () => {
  let [html, setHTML] = useState(
    `<iframe width="560" height="315" src="https://www.youtube.com/embed/RrkL9e2w7gQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  );
  let doc = HTMLSource.fromRaw(html).convertTo(OffsetSource);
  let embeds = [...doc.where({ type: "-offset-youtube-embed" })];
  let url = "";
  if (embeds.length) {
    url = embeds[0].attributes.url;
  }
  return (
    <>
      <p>
        Now when we put in a video, like <code>{url}</code>, we'll get the
        following:
      </p>
      <RenderedHTML document={doc} />
      <RenderedDOM document={doc} />
      <p>Paste in an HTML embed to see the contents change:</p>
      <TextArea
        autoResize={true}
        value={html}
        onChange={evt => setHTML(evt.target.value)}
      />
    </>
  );
};
