export function dateFormatter(dateString) {
	if (!dateString || dateString.length < 8) return null;
	const now = new Date();

	const timestampHex = dateString.substring(0, 8)
	const timestamp = parseInt(timestampHex, 16)
	const date = new Date(timestamp * 1000)

	const diffMs = now - date;
	const msPerMinute = 60 * 1000;
	const msPerHour = 60 * msPerMinute;
	const msPerDay = 24 * msPerHour;
	const msPerWeek = 7 * msPerDay;

	const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const formatDate = (d) => d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

	if (diffMs < msPerDay && now.getDate() === date.getDate()) {
		return formatTime(date);
	} else if (diffMs < msPerDay * 2 && now.getDate() - date.getDate() === 1) {
		return "yesterday";
	} else if (diffMs < msPerWeek) {
		// const daysAgo = Math.floor(diffMs / msPerDay);
		// return `${daysAgo} days ago`;
		return `${date.toLocaleDateString([], { weekday: 'long' })} ${formatTime(date)}`;
	} else {
		return formatDate(date);
	}
}

