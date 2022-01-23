export interface iEvent {
    name: string
    callback: () => void
}

export interface dbEvent {
    RegisteredChannels: { id: string, mode: (0 | 1 | 2 | 3)[] }[]
    LastChecked: Date
}