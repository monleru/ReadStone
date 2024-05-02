export const sleep = async (min:number,max:number) => {
    return new Promise((res) => setTimeout(res, Math.floor(getRandomNumber(min,max)*1000) ))
}

export const getRandomNumber = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}
