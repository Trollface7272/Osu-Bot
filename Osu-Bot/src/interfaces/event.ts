export interface iEvent {
    name: string
    callback: () => void
}

export interface dbEvent {
    RegisteredChannels: string[]
    LastChecked: Date
}