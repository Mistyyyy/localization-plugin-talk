const path = require("path");
const RawSource = require("webpack-sources/lib/RawSource");

/** @typedef {import("webpack/lib/Compiler")} Compiler */

class HtmlPlugin {
	constructor({ languages = ["en", "de"] } = {}) {
		this.languages = languages;
	}

	/**
	 * @param {Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.compilation.tap("HtmlPlugin", compilation => {
			compilation.hooks.additionalAssets.tap("HtmlPlugin", () => {
				for (const [name, entrypoint] of compilation.entrypoints) {
					const filesByType = new Map([
						[".js", []],
						[".json", []]
					]);
					for (const file of entrypoint.getFiles()) {
						const ext = path.extname(file);
						let list = filesByType.get(ext);
						if (list === undefined) {
							list = [];
							filesByType.set(ext, list);
						}
						list.push(file);
					}

					for (const lang of this.languages) {
						compilation.emitAsset(
							`${name}.${lang}.html`,
							new RawSource(
								`<html>
	<head>
		${filesByType
			.get(".js")
			.map(file => `<link rel="preload" as="script" href="${file}">`)
			.join("")}
	</head>
	<body>
		<button id="button">Click me</button>
		${filesByType
			.get(".json")
			.filter(file => file.endsWith(`.${lang}.json`))
			.map(
				file =>
					`<script type="localization">${compilation
						.getAsset(file)
						.source.source()}</script>`
			)
			.join("")}
		${filesByType
			.get(".js")
			.map(file => `<script async src="${file}"></script>`)
			.join("")}
	</body>
</html>`
							)
						);
					}
				}
			});
		});
	}
}
module.exports = HtmlPlugin;
