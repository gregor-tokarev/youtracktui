export function copyToClipboard(text: string): void {
	const platform = process.platform;
	let command: string[];

	if (platform === "darwin") {
		command = ["pbcopy"];
	} else if (platform === "win32") {
		command = ["clip.exe"];
	} else {
		command = ["xclip", "-selection", "clipboard"];
	}

	const proc = Bun.spawn(command, {
		stdin: "pipe",
	});
	proc.stdin.write(text);
	proc.stdin.end();
}
