import { ServerStatus } from "./server-status.enum";

export interface Server {
	_id: string
	client: string
	provider: string
	callbackUrl?: string
	region: string
	game: string
	createdAt: Date
	status: ServerStatus
	closePref: {
		minPlayers: number
		idleTime: number
		waitTime: number
	},
	password: string
	ip: string
	port: number
	closeAt?: Date
}