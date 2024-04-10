import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';
import type { BlockPreviewData } from './models';

export class BlockPreviewResource {

	/**
	 * @returns string Success
	 * @throws ApiError
	 */
	public static postUmbracoBlockpreviewApiV1PreviewGridMarkup(data: BlockPreviewData['payloads']['PostUmbracoBlockpreviewApiV1PreviewGridMarkup'] = {}): CancelablePromise<BlockPreviewData['responses']['PostUmbracoBlockpreviewApiV1PreviewGridMarkup']> {
		const {
                    
                    pageId,
blockEditorAlias,
culture,
requestBody
                } = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/umbraco/blockpreview/api/v1/previewGridMarkup',
			query: {
				pageId, blockEditorAlias, culture
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}

	/**
	 * @returns string Success
	 * @throws ApiError
	 */
	public static postUmbracoBlockpreviewApiV1PreviewListMarkup(data: BlockPreviewData['payloads']['PostUmbracoBlockpreviewApiV1PreviewListMarkup'] = {}): CancelablePromise<BlockPreviewData['responses']['PostUmbracoBlockpreviewApiV1PreviewListMarkup']> {
		const {
                    
                    pageId,
blockEditorAlias,
culture,
requestBody
                } = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/umbraco/blockpreview/api/v1/previewListMarkup',
			query: {
				pageId, blockEditorAlias, culture
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}

}