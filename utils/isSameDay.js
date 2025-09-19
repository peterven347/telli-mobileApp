export const isSameDay = (timestamp) => {
    const date1 = new Date(timestamp);
    const date2 = new Date(Date.now());
    return (
        date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate()
    );
}