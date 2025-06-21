export const commonError = (error) => {
    const errorMessage = {}

    for (const e of error) {
        if (errorMessage[e.path] !== undefined) {
            const msg = `${errorMessage[e.path]}, ${e.msg}`
            errorMessage[e.path] = msg
        } else {
            errorMessage[e.path] = e.msg
        }
    }
    return errorMessage;
}