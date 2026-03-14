import { Client, isFullDatabase, isFullPage } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs-extra";
import { savePage } from "./render";
import { loadConfig } from "./config";
import { getAllContentFiles } from "./file";
import { getFileName, getPageTitle } from "./helpers";

dotenv.config();

async function main() {
  if (!process.env.NOTION_TOKEN) {
    throw Error("The NOTION_TOKEN environment variable is not set.");
  }

  const config = await loadConfig();
  console.info("[Info] Config loaded");

  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const pages: string[] = [];

  console.info("[Info] Start processing mounted databases");

  for (const mount of config.mount.databases) {
    fs.ensureDirSync(`content/${mount.target_folder}`);

    const database = await notion.databases.retrieve({
      database_id: mount.database_id,
    });

    if (!isFullDatabase(database)) {
      console.warn(
        `[Warn] Skipping mount for database ${mount.database_id} as it could not be fully retrieved.`,
      );
      continue;
    }

    for (const dataSource of database.data_sources) {
      console.info(
        `[Info] Processing data source: ${dataSource.name} (${dataSource.id})`,
      );

      let nextCursor: string | undefined;

      do {
        const response = await notion.dataSources.query({
          data_source_id: dataSource.id,
          start_cursor: nextCursor,
          result_type: "page",
        });

        for (const page of response.results) {
          if (!isFullPage(page)) {
            continue;
          }

          console.info(`[Info] Start processing page ${page.id}`);
          pages.push(getFileName(getPageTitle(page), page.id));
          await savePage(page, notion, mount);
        }

        nextCursor = response.next_cursor ?? undefined;
      } while (nextCursor);
    }
  }

  for (const mount of config.mount.pages) {
    const page = await notion.pages.retrieve({ page_id: mount.page_id });

    if (!isFullPage(page)) {
      continue;
    }

    pages.push(getFileName(getPageTitle(page), page.id));
    await savePage(page, notion, mount);
  }

  const contentFiles = getAllContentFiles("content");
  for (const file of contentFiles) {
    if (!pages.includes(file.filename) && file.managed) {
      console.info(`[Info] Removing unsynced file ${file.filepath}`);
      fs.removeSync(file.filepath);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
