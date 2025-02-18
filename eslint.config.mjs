import globals from "globals";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default {
  parser: "babel-eslint",
  plugins: ["react"],
  extends: ["eslint:recommended", "plugin:react/recommended"],
  rules: {
    // 'open' prop에 대한 타입 검사를 하지 않으려면 해당 규칙을 'off'로 설정
    "react/prop-types": "off",
  },
};
