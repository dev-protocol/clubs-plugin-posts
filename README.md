# Clubs Plugin Posts

## Local Development

### Setting up your config

This assumes you have created a Club. You'll need your property token address for this.
Go to `/preview/config.ts`, and enter your property address.

### Creating DB Indexes

If you are using your own Redis instance for local development, you need to create indexes. First, add your REDIS details to the .env file.
Next, run `yarn run preview` to start the server.
Finally, in a separate terminal window, run the following:

```sh
curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/devprotocol:clubs:plugin:posts/indexing/documents:redis
```

## Plugin configuration

```ts
{
	key: 'feeds',
	value: [
		{
			id: 'default',
			database: {
				type: 'encoded:redis',
				key: 'DATABASE_KEY', // i.g., posts::694666bb-b2ec-542b-a5d6-65b470e5c494
			}
		},
		{
			id: 'my-hobby',
			database: {
				type: 'encoded:redis',
				key: 'DATABASE_KEY', // i.g., posts::694666bb-b2ec-542b-a5d6-65b470e5c494
			}
		},
		{
			id: 'travel',
			database: {
				type: 'documents:redis', // New database type supported in the future
				key: 'INDEX_SCOPE', // i.g., scope::694666bb-b2ec-542b-a5d6-65b470e5c494
			}
		},
	]
}
```

## Structure of Post item

```ts
type Posts = {
	readonly id: string
	readonly title: string
	readonly content: string
	readonly options: readonly {
		readonly key: string
		readonly value: ClubsGeneralUnit
	}[]
	readonly created_by: string
	readonly created_at: Date
	readonly updated_at: Date
	readonly comments: readonly {
		readonly content: string
		readonly options: readonly {
			readonly key: string
			readonly value: ClubsGeneralUnit
		}[]
		readonly id: string
		readonly created_by: string
		readonly created_at: Date
		readonly updated_at: Date
	}[]
	readonly reactions: readonly {
		[emoji: string]: string[] // for example {'🦜': ['0x0', '0x2']}
	}
}
```

### Naming convention for option keys

Option keys can use any `string`, but for creating private options, a reserved naming convention "starts with `#`" works. If the option key has a leading "#", the plugin's server-side process returns those values to only authenticated users. This is useful for posting token-gated posts.

```ts
{
	...
	options: [
		{
			/**
			 * Unauthenticated users cannot access these values 🤫
			 */
			key: "#images",
			value: [
				'https://example.image/special1.png',
				'https://example.image/special2.png',
				'https://example.image/special3.png'
			]
		}
	]
}
```
