export interface IpcApi {
  ping: () => Promise<string>
}

declare global {
  interface Window {
    api: IpcApi
  }
}
