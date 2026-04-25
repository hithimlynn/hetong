# 合同生成系统

按 `合同生成系统 PRD（v1）.doc` 重做的简洁 Web 端原型。

## 功能

- 甲方填写合同固定字段并实时预览 A4 合同
- 金额自动转大写金额
- 发布后生成乙方签署链接，并锁定字段与条款快照
- 乙方打开链接后确认无误、上传或手写签名并提交
- 支持合同库、本月合同数量、金额和签署数量统计
- 支持导出 PDF，使用浏览器打印并选择“另存为 PDF”
- 固定法律条款由系统展示，普通业务编辑页不可修改

## 同步模式

- 未配置 Supabase 时：继续使用本地浏览器缓存
- 配置 Supabase 后：甲方后台与乙方签署链接改用云端同步，支持跨设备查看和签署回写

Supabase 配置说明见：

[SUPABASE_SETUP.md](C:/Users/l/Desktop/fd/ui-design-studio/SUPABASE_SETUP.md)

## 入口

[index.html](C:/Users/l/Desktop/fd/ui-design-studio/index.html)
