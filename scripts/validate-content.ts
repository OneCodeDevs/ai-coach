import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import matter from "gray-matter";
import { kapitelMetaSchema, lessonFrontmatterSchema } from "../src/lib/content/schemas";

const root = "content/kapitel";
const folders = await readdir(root);
let lessons = 0;

for (const folder of folders.sort()) {
  const dir = path.join(root, folder);
  const yamlRaw = await readFile(path.join(dir, "kapitel.yml"), "utf8");
  const meta = kapitelMetaSchema.parse(parse(yamlRaw));
  const files = (await readdir(dir)).filter((file) => file.endsWith(".mdx"));
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    lessonFrontmatterSchema.parse(data);
  }
  lessons += files.length;
  console.log(
    `OK ${String(meta.nummer).padStart(2, "0")} ${meta.slug} ${files.length} Lektionen ${meta.exam.length} Fragen`,
  );
}

console.log(`Summe ${lessons} Lektionen`);
