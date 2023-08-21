# Clubs Plugin Posts

## Plugin configuration

```ts
{
	key: 'database',
	value: {
		type: 'encoded:redis', // Will support more DBs in the future
		key: 'DATABASE_KEY', // i.g., posts::694666bb-b2ec-542b-a5d6-65b470e5c494
	},
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
