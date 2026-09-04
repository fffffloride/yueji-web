import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { formatPrice } from "../src/utils/format.ts";

// 编译现有 TS 模块，替换构建器别名；业务函数和 Vue 响应式使用原实现。
function moduleExports(path: string, dependencies: Record<string, unknown>, globals = {}) {
  const exports: Record<string, any> = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(code, {
    exports,
    ...globals,
    require(name: string) {
      assert.ok(name in dependencies, `unexpected import ${name}`);
      return dependencies[name];
    },
    Error,
  });
  return exports;
}
const rules = moduleExports("src/utils/distribution.ts", { "./format": { formatPrice } });
for (const status of [undefined, null, 0, 2, 4, "1"])
  assert.equal(rules.hasDistributionAccess(status), false);
for (const status of [1, 3]) assert.equal(rules.hasDistributionAccess(status), true);
assert.equal(rules.withdrawalCents("0.29", 100, 100), 29);
assert.equal(rules.withdrawalCents(" 12.3 ", 1230, 1230), 1230);
for (const value of ["", "0", "-1", "1e2", "1.001", "Infinity", "1,000", "9007199254740991"]) {
  assert.throws(() => rules.withdrawalCents(value, 100_000, 100_000));
}
assert.throws(() => rules.withdrawalCents("20", 1999, 3000), /余额/);
assert.throws(() => rules.withdrawalCents("20", 3000, 1999), /上限/);
assert.equal(rules.dateRangeError("", ""), "");
assert.ok(rules.dateRangeError("2026-02-30", "2026-03-01"));
assert.ok(rules.dateRangeError("2026-09-02", "2026-09-01"));
assert.ok(rules.dateRangeError("2020-01-01", "2026-01-01"));
assert.ok(rules.dateRangeError("2026-09-02", ""));
assert.equal(rules.dateRangeError("2024-02-29", "2024-03-01"), "");
assert.equal(rules.monthRange(true, new Date(2026, 0, 15)).startDate, "2025-12-01");
assert.equal(rules.monthRange(true, new Date(2026, 0, 15)).endDate, "2025-12-31");
assert.equal(rules.taskValue(129, "SALES_AMOUNT"), "1.29 元");

const { useLoadMore } = moduleExports("src/composables/useLoadMore.ts", {
  vue: Vue,
  "@/settings": { appSettings: { pageSize: 2 } },
});
const pending: { params: any; resolve: (value: any) => void; reject: (error: Error) => void }[] =
  [];
let status = 0;
const scope = Vue.effectScope();
const page = scope.run(() =>
  useLoadMore({
    immediate: false,
    params: () => ({ status }),
    fetcher: (params: any) =>
      new Promise((resolve, reject) => pending.push({ params, resolve, reject })),
  })
);
const older = page.refresh();
status = 1;
const newer = page.refresh();
pending[1].resolve({ list: [{ id: "new" }], total: 3 });
await newer;
pending[0].resolve({ list: [{ id: "old" }], total: 3 });
await older;
assert.equal(page.list.value[0].id, "new");
assert.equal(pending[1].params.status, 1);
const failed = page.loadMore();
pending[2].reject(new Error("离线"));
await assert.rejects(failed, /离线/);
assert.equal(page.list.value.length, 1);
assert.equal(page.error.value, "离线");
const retry = page.loadMore();
assert.equal(pending[3].params.pageNum, 2);
pending[3].resolve({ list: [{ id: "next" }, { id: "last" }], total: 3 });
await retry;
assert.equal(page.list.value.length, 3);
assert.equal(page.isFinished.value, true);
await page.loadMore();
assert.equal(pending.length, 4);
const disposed = page.refresh();
scope.stop();
pending[4].resolve({ list: [{ id: "disposed" }], total: 1 });
await disposed;
assert.equal(page.list.value.length, 0);

let token = "first";
let agentStatus: number | undefined = 1;
let pageDataCalls = 0;
const { useDistributionPage } = moduleExports(
  "src/composables/useDistributionPage.ts",
  {
    "@/api/distribution": {
      default: {
        getProfile: async () => ({
          agent: agentStatus === undefined ? null : { status: agentStatus },
        }),
      },
    },
    "@/utils/distribution": rules,
    "@/utils/auth": { getAccessToken: () => token },
  },
  {
    ref: Vue.ref,
    shallowRef: Vue.shallowRef,
    onShow() {},
    onUnload() {},
    onPullDownRefresh() {},
    uni: {},
  }
);
const identity = useDistributionPage(async () => {
  pageDataCalls++;
  return "loaded";
});
for (const state of [undefined, 0, 2]) {
  agentStatus = state;
  await identity.load();
  assert.equal(identity.denied.value, true);
  assert.equal(pageDataCalls, 0);
}
agentStatus = 3;
await identity.load();
assert.equal(identity.data.value, "loaded");
agentStatus = 0;
const hiddenRefresh = identity.load();
assert.equal(identity.loading.value, true);
assert.equal(identity.data.value, "loaded");
await hiddenRefresh;
assert.equal(identity.data.value, null);
agentStatus = 3;
const team = useDistributionPage(async () => "team", true);
await team.load();
assert.equal(team.denied.value, true);
agentStatus = 1;
await team.load();
assert.equal(team.data.value, "team");
const switched = useDistributionPage(async () => {
  token = "changed";
  return "private";
});
await switched.load();
assert.equal(switched.data.value, null);
console.log("distribution checks passed: identity, money, dates, pagination races and retry");
