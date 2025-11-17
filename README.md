# OpenAPI Typescript Codegen

> 基于 OpenAPI 规范生成 TypeScript 客户端的 Node.js 库

这是一个基于 [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) 的 fork 版本。

## 特性

- 🚀 快速、轻量、健壮且框架无关
- 📦 支持生成 TypeScript 客户端
- 🌐 支持生成多种 HTTP 客户端：Fetch、Node-Fetch、Axios、Angular 和 XHR
- 📋 支持 OpenAPI 规范 v2.0 和 v3.0
- 📄 支持 JSON 和 YAML 格式的输入文件
- 💻 支持通过 CLI、Node.js 和 NPX 使用
- 🔧 支持 tsc 和 @babel/plugin-transform-typescript
- ⏹️ 支持请求中止（可取消的 Promise 模式）
- 🔗 支持使用 [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser/) 处理外部引用

## 安装

```bash
npm install @owndo/openapi-typescript-codegen --save-dev
```

## 使用方法

### CLI 命令行

```bash
$ openapi --help

  Usage: openapi [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content (required)
    -o, --output <value>      Output directory (required)
    -c, --client <value>      HTTP client to generate [fetch, xhr, node, axios, angular] (default: "fetch")
    --name <value>            Custom client class name
    --useOptions              Use options instead of arguments
    --useUnionTypes           Use union types instead of enums
    --exportCore <value>      Write core files to disk (default: true)
    --exportServices <value>  Write services to disk (default: true)
    --exportModels <value>    Write models to disk (default: true)
    --exportSchemas <value>   Write schemas to disk (default: false)
    --indent <value>          Indentation options [4, 2, tabs] (default: "4")
    --postfixServices <value> Service name postfix (default: "Service")
    --postfixModels <value>   Model name postfix
    --request <value>         Path to custom request file
    -h, --help                display help for command

  Examples
    $ openapi --input ./spec.json --output ./generated
    $ openapi --input ./spec.json --output ./generated --client xhr
    $ openapi --input https://api.example.com/openapi.json --output ./generated --client axios
```

### Node.js API

```typescript
import { generate, HttpClient } from '@owndo/openapi-typescript-codegen';

await generate({
    input: './spec.json',
    output: './generated',
    httpClient: HttpClient.FETCH,
    clientName: 'ApiClient',
    useOptions: false,
    useUnionTypes: false,
    exportCore: true,
    exportServices: true,
    exportModels: true,
    exportSchemas: false,
    indent: '4',
    postfixServices: 'Service',
    postfixModels: '',
});
```

## 支持的 HTTP 客户端

- **fetch** - 使用浏览器原生 Fetch API（默认）
- **xhr** - 使用 XMLHttpRequest
- **node** - 使用 Node.js 的 node-fetch
- **axios** - 使用 Axios 库
- **angular** - 使用 Angular 的 HttpClient

## 与原始仓库的改动

本 fork 版本在原始项目 [ferdikoomen/openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) 的基础上进行了以下改动：

### 功能增强

1. **Schema 属性展开功能**
   - 新增 `expandSchemaProperties` 函数，支持将 schema 引用展开为独立的操作参数
   - 当 query、formData 或 requestBody 参数使用 schema 引用时，会自动展开为多个独立的参数
   - 适用于 OpenAPI v2.0 和 v3.0 规范

2. **参数处理改进**
   - 在 `OperationParameters` 接口中新增 `parametersBodyExpanded` 字段
   - 改进了 query 和 formData 参数的处理逻辑，支持 schema 引用的自动展开
   - 增强了 requestBody 的处理，支持将复杂 schema 展开为多个参数

### 项目配置变更

1. **包名和仓库**
   - 包名从 `openapi-typescript-codegen` 变更为 `@owndo/openapi-typescript-codegen`
   - 仓库地址更新为 [xujiehui/openapi-typescript-codegen](https://github.com/xujiehui/openapi-typescript-codegen)

2. **版本信息**
   - 当前版本：0.0.1
   - 作者：Endless

### 使用说明

这些改动向后兼容，不会影响现有功能。新增的 schema 展开功能会在检测到 schema 引用时自动启用，无需额外配置。

如果你需要从原始仓库迁移到本 fork 版本，只需更改包名即可：

```bash
# 原始版本
npm install openapi-typescript-codegen --save-dev

# Fork 版本
npm install @owndo/openapi-typescript-codegen --save-dev
```

## 项目信息

- **包名**: `@owndo/openapi-typescript-codegen`
- **版本**: 0.0.1
- **许可证**: MIT
- **仓库**: [GitHub](https://github.com/xujiehui/openapi-typescript-codegen)
- **问题反馈**: [Issues](https://github.com/xujiehui/openapi-typescript-codegen/issues)

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test

# 运行端到端测试
npm run test:e2e

# 代码检查
npm run eslint

# 代码格式化
npm run eslint:fix
```

## 许可证

MIT License

## 致谢

本项目基于 [ferdikoomen/openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) 项目 fork 而来。
