import type { ClubsConfiguration } from '@devprotocol/clubs-core'

export const deletePostHandler =
	(conf: ClubsConfiguration, dbQueryKey: string, id: string) =>
	async ({ request }: { readonly request: Request }) => {
		return new Response(
			JSON.stringify({
				message: 'success',
				data: null,
			}),
			{
				status: 200,
			},
		)
	}
