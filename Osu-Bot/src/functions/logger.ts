import consola from "consola"

consola.wrapAll()

const Log = (...messages: any[]) => {
    console.log(...messages)
}

const Warn = (...messages: any[]) => {
    console.warn(...messages)
}

const Info = (...messages: any[]) => {
    console.info(...messages)
}

const Error = (...messages: any[]) => {
    console.error(...messages)
}


export default { Log, Warn, Info, Error }