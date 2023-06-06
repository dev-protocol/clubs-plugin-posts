import type { APIRoute } from 'astro'

export const post: APIRoute = async ({ request }) => {
	const body = await request.json()
	const contents = body.contents

	return new Response(
		JSON.stringify({
			message: contents,
		}),
		{
			status: 200,
		}
	)
}
