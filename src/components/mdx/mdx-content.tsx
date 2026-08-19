import { MDXRemote } from "next-mdx-remote/rsc";
import { Quelle } from "./quelle";
import { Zitat } from "./zitat";
import { Video } from "./video";
import { Merksatz } from "./merksatz";

const components = {
  Quelle,
  Zitat,
  Video,
  Merksatz,
};

export function MdxContent({ source }: { source: string }) {
  return (
    <article className="prose-lesson">
      <MDXRemote source={source} components={components} />
    </article>
  );
}
