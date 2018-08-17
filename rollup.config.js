import typescript from 'rollup-plugin-typescript2';

export default {
    input: "./src/index.ts",
    output: [{
        name: "Pjax",
        file: "dist/pjax.umd.js",
        format: "umd"
    }, {
        file: "dist/pjax.es.js",
        format: "es"
    }],
    plugins: [
        typescript()
    ]
}