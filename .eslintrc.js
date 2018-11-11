module.exports = {
	"extends": ["airbnb-base", "plugin:prettier/recommended"],
	"rules": {
		"prettier/prettier": [
			"error",
			{
				"printWidth": 100,
				"tabWidth": 4,
				"singleQuote": true,
				"trailingComma": "none",
				"bracketSpacing": true,
				"semi": true,
				"useTabs": true
			}
		]
	}
};