import fetch from 'node-fetch';

interface UserId {
    id: number;
}

export const getAuthUserIdbyToken = async (token: string): Promise<number> => {
    const response = await fetch('https://dummyjson.com/auth/me', {
        method: 'GET',
        headers: {
        'Authorization': `${token}`, 
        },
    })
    const data = await response.json() as UserId;
    return data.id;
};