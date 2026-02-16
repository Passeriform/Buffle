import antfu from "@antfu/eslint-config"

export default antfu({
    ignores: ["tsconfig.json"],
    formatters: {

    },
    imports: {
        overrides: {
            "import/consistent-type-specifier-style": "off",
        },
    },
    unicorn: {
        overrides: {
            "unicorn/number-literal-case": ["error", { hexadecimalValue: "lowercase" }],
        },
    },
    stylistic: {
        quotes: "double",
        indent: 4,
        overrides: {
            "style/arrow-parens": ["error", "always"],
            "style/brace-style": ["error", "1tbs"],
            "style/quote-props": ["error", "as-needed"],
            "style/operator-linebreak": ["error", "before", { overrides: { "=": "after" } }],
        },
    },
    typescript: {
        overrides: {
            "ts/consistent-type-definitions": ["error", "type"],
        },
    },
    yaml: {
        overrides: {
            "yaml/indent": ["error", 2],
        },
    },
    rules: {
        "id-length": ["error", { exceptions: ["_", "x", "y"] }],
        "prefer-template": "off",
        "antfu/top-level-function": "off",
        "node/prefer-global/process": "off",
        "no-restricted-syntax": ["error", {
            selector: "TSTypeAnnotation > TSTupleType > :not(TSNamedTupleMember)",
            message: "All tuple members must have labels.",
        }, {
            selector: "TSAsExpression > TSTupleType > :not(TSNamedTupleMember)",
            message: "All tuple members must have labels.",
        }, {
            selector: "TSSatisfiesExpression > TSTupleType > :not(TSNamedTupleMember)",
            message: "All tuple members must have labels.",
        }],
    },
})
