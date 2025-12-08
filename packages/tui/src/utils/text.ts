export function truncateText(text: string, maxWidth: number): string {
	if (text.length <= maxWidth) {
		return text;
	}
	return text.slice(0, maxWidth);
}
