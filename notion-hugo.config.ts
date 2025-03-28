import { UserConfig } from "./src/config"

const userConfig: UserConfig = {
    base_url: "https://pflait.com",
    mount: {
        manual: false,
        page_url: 'https://flait.notion.site/Notion-Hugo-1c325ea6fb0480008a69f0cacce15467',
        pages: [
            // {
            //     page_id: '<page_id>',
            //     target_folder: 'path/relative/to/content/folder'
            // }
            {
                page_id: '45eb121158b9489480ec000fd25c812b',
                target_folder: '.'
            }
        ],
        databases: [
            // {
            //     database_id: '<database_id>',
            //     target_folder: 'path/relative/to/content/folder'
            // }
            {
                database_id: 'b7b1816c05ec464391c8c111fa242985',
                target_folder: '.'
            }
        ],
    }
}

export default userConfig;
