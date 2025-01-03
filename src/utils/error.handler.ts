function ensureError(value: unknown): Error {
    if (value instanceof Error) {
        return value;
    }
    let stringError: string = '[Unable to stringify the thrown value]'
    try {
        stringError = JSON.stringify(value);
    } catch (error) {
        console.error(error);
    }
    const error = new Error(`This value was thrown as is, not through an Error: ${stringError}`);
    return error;
}


export { ensureError };