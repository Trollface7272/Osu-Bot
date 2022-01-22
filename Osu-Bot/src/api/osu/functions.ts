import logger from "@functions/logger"
import axios, { Axios, AxiosRequestConfig, AxiosRequestHeaders } from "axios"

export const Get = async (link: string, data: any, headers: any={}, axiosOptions?: AxiosRequestConfig) => {
    logger.Debug(`Request -> ${link}`, data)
    return (await axios.get(link, {
        params: data,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...headers
        },
        ...axiosOptions
    })).data
    
}

export const SilentGet = async (link: string, data: any, headers: any={}, axiosOptions?: AxiosRequestConfig) => {
    return (await axios.get(link, {
        params: data,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...headers
        },
        ...axiosOptions
    })).data
    
}

export const Post = async (link: string, data: any, headers: any={}, axiosOptions?: AxiosRequestConfig) => {
    logger.Debug(`Request -> ${link}`, data)
    if (link.startsWith("http://localhost:727")) data.secret = process.env.SECRET
    return (await axios.post(link, data, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...headers
        },
        ...axiosOptions
    })).data
}

export const SilentPost = async (link: string, data: any, headers: any={}, axiosOptions?: AxiosRequestConfig) => {
    if (link.startsWith("http://localhost:727")) data.secret = process.env.SECRET
    return (await axios.post(link, data, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...headers
        },
        ...axiosOptions
    })).data
}

export const HandlePromise = async <T>(promise: Promise<any>): Promise<[T, any]> => {
    try {
        const res = await promise
        return [res, null]
    } catch (err) {
        return [null, err]
    }
}