import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import BlockPreviewContext from "./block-preview.context";

export const BLOCK_PREVIEW_CONTEXT = new UmbContextToken<BlockPreviewContext>('BlockPreviewContext');
