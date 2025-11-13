export const isSameDay = (timestamp) => {
    const date1 = new Date(timestamp);
    const date2 = new Date(Date.now());
    return (
        date1.toLocaleDateString() === date2.toLocaleDateString()
    );
}