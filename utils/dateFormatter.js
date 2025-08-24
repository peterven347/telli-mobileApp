export function dateFormatter(dateString) {
  if (!dateString || dateString.length < 8) return null;

  const timestampHex = dateString.substring(0, 8)
  const timestamp = parseInt(timestampHex, 16)
  const date = new Date(timestamp * 1000)
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return formattedDate
}

