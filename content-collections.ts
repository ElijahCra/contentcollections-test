import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { visit } from "unist-util-visit";


function remarkCollectSpanJsx(spans: Array<{ id?: string; title: string }>) {
    return (tree: any) => {
        console.log("spans tree:",tree);
        visit(tree, (node: any) => {

            const isFlowSpan =
                node.type === "mdxJsxFlowElement" && node.name === "span";

            const isTextSpan =
                node.type === "mdxJsxTextElement" && node.name === "span";

            if (isFlowSpan || isTextSpan) {
                const idAttr = node.attributes?.find((attr: any) => attr.name === "id");
                const id = idAttr?.value;

                let textContent = "";
                if (Array.isArray(node.children)) {
                    node.children.forEach((child: any) => {
                        if (child.type === "text") {
                            textContent += child.value;
                        }
                    });
                }
                spans.push({ id, title: textContent });
            }
        });
    };
}

const posts = defineCollection({
    name: "posts",
    directory: "mdx/posts",
    include: "**/*.mdx",
    schema: (z) => ({
        title: z.string(),
        summary: z.string(),
    }),

    transform: async (document, context) => {
        console.log('transform ran');
        const spans: Array<{ id?: string; title: string }> = [];
        console.log('context',context);
        console.log('document',document);
        const mdx = await compileMDX(context, document, {
                remarkPlugins: [[remarkCollectSpanJsx, spans], ],
        });

        console.log("Collected spans: ", spans);
        return {
            ...document,
            mdx,
            spans,
        };
    },
});

export default defineConfig({
    collections: [posts],
});
