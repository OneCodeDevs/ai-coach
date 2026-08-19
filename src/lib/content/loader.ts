import "server-only";

import { cache } from "react";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import {
  kapitelMetaSchema,
  lessonFrontmatterSchema,
  type Kapitel,
  type Lesson,
} from "./schemas";

function contentRoot(): string {
  return process.env.CONTENT_DIR ?? path.join(process.cwd(), "content");
}

function kapitelDir(): string {
  return path.join(contentRoot(), "kapitel");
}

async function loadLesson(filePath: string): Promise<Lesson> {
  const raw = await readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = lessonFrontmatterSchema.parse(data);
  const slug = path.basename(filePath, ".mdx");

  return {
    ...frontmatter,
    slug,
    body: content.trim(),
    filePath,
  };
}

async function loadKapitelFolder(folderName: string): Promise<Kapitel> {
  const dir = path.join(kapitelDir(), folderName);
  const yamlPath = path.join(dir, "kapitel.yml");
  const yamlRaw = await readFile(yamlPath, "utf8");
  const meta = kapitelMetaSchema.parse(parseYaml(yamlRaw));

  const entries = await readdir(dir);
  const mdxFiles = entries.filter((file) => file.endsWith(".mdx")).sort();

  const lessons = (
    await Promise.all(
      mdxFiles.map((file) => loadLesson(path.join(dir, file))),
    )
  ).sort((a, b) => a.reihenfolge - b.reihenfolge);

  return { ...meta, dir, lessons };
}

export const listKapitel = cache(async (): Promise<Kapitel[]> => {
  let folders: string[];
  try {
    folders = (await readdir(kapitelDir())).sort();
  } catch {
    return [];
  }

  const loaded: Kapitel[] = [];

  for (const folder of folders) {
    if (folder.startsWith(".")) continue;
    try {
      loaded.push(await loadKapitelFolder(folder));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      loaded.push({
        slug: folder,
        nummer: loaded.length + 1,
        titel: folder,
        untertitel: "Kapitel konnte nicht geladen werden",
        dauerMinuten: 0,
        lernziele: ["Inhalt prüfen"],
        exam: [
          {
            id: "error",
            topic: "Fehler",
            frage: "Platzhalter",
            erwartet: ["n/a"],
          },
        ],
        praxis: [],
        zertifikate: [],
        dir: path.join(kapitelDir(), folder),
        lessons: [],
        error: message,
      });
    }
  }

  return loaded.sort((a, b) => a.nummer - b.nummer);
});

export const getKapitel = cache(async (slug: string): Promise<Kapitel | null> => {
  const all = await listKapitel();
  return all.find((kapitel) => kapitel.slug === slug) ?? null;
});

export const getLesson = cache(
  async (
    kapitelSlug: string,
    lessonSlug: string,
  ): Promise<{ kapitel: Kapitel; lesson: Lesson } | null> => {
    const kapitel = await getKapitel(kapitelSlug);
    if (!kapitel) return null;
    const lesson = kapitel.lessons.find((item) => item.slug === lessonSlug);
    if (!lesson) return null;
    return { kapitel, lesson };
  },
);
