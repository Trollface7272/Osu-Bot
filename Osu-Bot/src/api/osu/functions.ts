import axios from "axios"

export const Get = async (link: string, data: any, headers: any={}) => {
    return (await axios.get(link, {
        params: data,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...headers
        }
    })).data
    
}

export const Post = async (link: string, data: any, headers: any={}) => {
    return (await axios.post(link, data, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...headers
        }
    })).data
}